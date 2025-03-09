# ingestion/data_fetcher.py

import yfinance as yf
import psycopg2
import os
import time
import pandas as pd
from datetime import datetime, timedelta
from config import RAW_DATA_PATH, AGGREGATED_FILE, DB_CONFIG

def get_sp500_tickers():
    """
    Connects to the PostgreSQL database using DB_CONFIG and queries the tickers table.
    Returns a list of ticker symbols.
    """

    tickers = []

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT ticker FROM tickers")
        rows = cur.fetchall()
        tickers = [row[0] for row in rows]
        cur.close()
        conn.close()
    except Exception as e:
        print("Error querying tickers table:", e)
    return tickers

class DataFetcher:
    def __init__(self, raw_data_path=RAW_DATA_PATH):
        self.raw_data_path = raw_data_path
        os.makedirs(self.raw_data_path, exist_ok=True)

    def fetch_all_historical_data(self, tickers, start_date="1962-01-01", end_date=None, max_retries=3):
        """
        Downloads all historical data for the given tickers from start_date to end_date.
        If end_date is None, uses today's date.
        Saves the aggregated data to a single CSV file.
        Returns the aggregated DataFrame.
        """
        if end_date is None:
            end_date = datetime.today().strftime("%Y-%m-%d")

        print(f"Fetching historical data from {start_date} to {end_date} for tickers: {tickers}")
        attempt = 0
        while attempt < max_retries:
            try:
                # Download data for all tickers at once.
                data = yf.download(tickers, start=start_date, end=end_date, group_by="ticker")
                if data.empty:
                    print("No data returned by yfinance.")
                    return None

                # Instead of using stack, loop over each ticker and extract its DataFrame.
                df_list = []
                for ticker in tickers:
                    try:
                        df_ticker = data[ticker].copy()
                    except KeyError:
                        print(f"Ticker {ticker} not found in downloaded data. Skipping.")
                        continue
                    df_ticker["Ticker"] = ticker
                    df_ticker = df_ticker.reset_index()  # Make Date a column
                    df_list.append(df_ticker)

                if not df_list:
                    print("No data found for any tickers.")
                    return None

                df_all = pd.concat(df_list, ignore_index=True)
                df_all["Date"] = pd.to_datetime(df_all["Date"])
                df_all = df_all.sort_values(by=["Date", "Ticker"])

                # Save the aggregated DataFrame.
                agg_file_path = os.path.join(self.raw_data_path, AGGREGATED_FILE)
                os.makedirs(os.path.dirname(agg_file_path), exist_ok=True)
                df_all.to_csv(agg_file_path, index=False)
                print(f"Aggregated historical data saved to {agg_file_path}")
                return df_all
            except Exception as e:
                print(f"Error on attempt {attempt+1} while fetching aggregated data: {e}")
                attempt += 1
                time.sleep(2 ** attempt)
        return None

    def partition_aggregated_data(self, aggregated_csv_path, partition_base=None):
        """
        Reads the aggregated CSV and partitions the data by year, month, and day.
        For each unique date, writes rows to:
            partition_base/year=YYYY/month=MM/day=DD/data.csv
        If partition_base is None, uses self.raw_data_path.
        """
        if partition_base is None:
            partition_base = self.raw_data_path

        print(f"Reading aggregated data from {aggregated_csv_path} ...")
        df = pd.read_csv(aggregated_csv_path, parse_dates=["Date"])
        # Create partitioning columns.
        df["Year"] = df["Date"].dt.year.astype(str)
        df["Month"] = df["Date"].dt.month.astype(str).str.zfill(2)
        df["Day"] = df["Date"].dt.day.astype(str).str.zfill(2)

        # Group by Year/Month/Day and write each group to its own CSV.
        for (year, month, day), group in df.groupby(["Year", "Month", "Day"]):
            folder = os.path.join(partition_base, f"year={year}", f"month={month}", f"day={day}")
            os.makedirs(folder, exist_ok=True)
            file_path = os.path.join(folder, "data.csv")
            group.to_csv(file_path, index=False)
            print(f"Partitioned data for {year}-{month}-{day} written to {file_path}")

    def incremental_update(self, tickers, day=None, max_retries=3):
        """
        Fetches data for a single day (defaults to yesterday) and stores it
        into the partitioned structure.
        """
        if day is None:
            day = datetime.today() - timedelta(days=1)
        day_str = day.strftime("%Y-%m-%d")
        next_day = (day + timedelta(days=1)).strftime("%Y-%m-%d")

        attempt = 0
        while attempt < max_retries:
            try:
                data = yf.download(tickers, start=day_str, end=next_day, group_by="ticker")
                if data.empty:
                    print(f"No data for {day_str}")
                    return
                df_list = []
                for ticker in tickers:
                    try:
                        df_ticker = data[ticker].copy()
                    except KeyError:
                        print(f"Ticker {ticker} not found for {day_str}. Skipping.")
                        continue
                    df_ticker["Ticker"] = ticker
                    df_ticker = df_ticker.reset_index()
                    df_list.append(df_ticker)
                if not df_list:
                    print(f"No data for any tickers on {day_str}")
                    return
                df_all = pd.concat(df_list, ignore_index=True)
                df_all["Date"] = pd.to_datetime(df_all["Date"])

                year = day.strftime("%Y")
                month = day.strftime("%m")
                day_str_short = day.strftime("%d")
                folder = os.path.join(self.raw_data_path, f"year={year}", f"month={month}", f"day={day_str_short}")
                os.makedirs(folder, exist_ok=True)
                file_path = os.path.join(folder, "data.csv")
                df_all.to_csv(file_path, index=False)
                print(f"Incremental update for {day_str} stored at {file_path}")
                return
            except Exception as e:
                print(f"Error on attempt {attempt+1} for {day_str}: {e}")
                attempt += 1
                time.sleep(2 ** attempt)
        print(f"Incremental update for {day_str} failed after {max_retries} attempts.")

if __name__ == "__main__":
    # For testing:
    tickers = get_sp500_tickers()
    fetcher = DataFetcher()

    # 1. Fetch all historical data (maximum available history) for all tickers into one aggregated CSV.
    aggregated_df = fetcher.fetch_all_historical_data(tickers, start_date="1962-01-01", end_date="2025-02-25")

    # 2. Partition the aggregated CSV by year/month/day.
    if aggregated_df is not None:
        agg_csv_path = os.path.join(RAW_DATA_PATH, AGGREGATED_FILE)
        fetcher.partition_aggregated_data(agg_csv_path)

