import pandas as pd
import numpy as np
import os
import pyarrow.parquet as pq
import glob
import psycopg2

from config import DB_CONFIG
from pyspark.sql.functions import to_date

DATA_LAKE_PATH = "../SP500_Backend/local_s3/silver_data/"

def get_decade_folder(year):
    """Determines the correct decade folder for a given year"""
    decade = (year // 10) * 10  # Convert to nearest decade
    return f"Decade={decade}"

def load_parquet_data(start_year=None, end_year=None):
    """Loads stock data from the appropriate Parquet files based on the year range"""
    data_frames = []

    # If no year is provided, load all decades
    if start_year is None and end_year is None:
        decade_folders = [f for f in os.listdir(DATA_LAKE_PATH) if f.startswith("Decade=")]
    else:
        decade_folders = [get_decade_folder(year) for year in range(start_year, end_year + 1, 10)]

    for decade_folder in set(decade_folders):  # Avoid duplicate decade lookups
        folder_path = os.path.join(DATA_LAKE_PATH, decade_folder)

        if not os.path.exists(folder_path):
            print(f"⚠️ Directory does not exist: {folder_path}")
            continue

        # Use glob to find all parquet files
        parquet_files = glob.glob(os.path.join(folder_path, "*.parquet"))

        if not parquet_files:
            print(f"⚠️ No parquet files found in {folder_path}")
            continue

        for file_path in parquet_files:
            try:
                print(f"✅ Loading: {file_path}")
                df = pd.read_parquet(file_path, engine="pyarrow")
                data_frames.append(df)
            except Exception as e:
                print(f"❌ Error loading {file_path}: {e}")

    # Merge all dataframes if multiple files are loaded
    if data_frames:
        return pd.concat(data_frames, ignore_index=True)

    print("⚠️ No data loaded from Parquet files.")
    return None

def get_sp500_overview():
    """Returns an overview of the S&P 500 based on the latest available data."""
    # Only read data for 2020-2025 using partition pruning.
    df = spark.read.parquet("local_s3/silver_data").filter("Year >= 2020 AND Year <= 2025")

    from pyspark.sql.functions import to_date
    df = df.withColumn("Date", to_date("Date", "yyyy-MM-dd"))

    start_date = "2020-01-01"
    end_date = "2025-02-23"
    df_filtered = df.filter((df.Date >= start_date) & (df.Date <= end_date))

    if df_filtered.rdd.isEmpty():
        return {"error": "No data found in the specified range"}

    # Option: cache this result if reused frequently.
    df_filtered.cache()

    # Convert only a subset to Pandas to avoid memory issues.
    pandas_df = df_filtered.limit(10000).toPandas()
    pandas_df["Change"] = pandas_df["Close"] - pandas_df["Open"]

    return pandas_df.to_dict(orient="records")


def get_bottom_performers():
    """Returns the 10 worst-performing stocks for the latest available data."""
    df = load_parquet_data(start_year=2024, end_year=2026)
    if df is not None:
        latest_date = df["Date"].max()
        df_latest = df[df["Date"] == latest_date]
        df_latest = df_latest.copy()  # ✅ Explicitly create a copy
        df_latest["Change"] = df_latest["Close"] - df_latest["Open"]
        return df_latest.nsmallest(10, "Change").to_dict(orient="records")
    return {"error": "Data not found"}

def get_top_performers():
    """Returns the top 10 best-performing stocks for the latest available date."""
    print("Loading data for top performers...")
    df = load_parquet_data(start_year=2024, end_year=2026)

    if df is None:
        print("⚠️ No data loaded - `load_parquet_data` returned None!")
        return {"error": "Data not found"}

    print(f"✅ DataFrame loaded successfully! Shape: {df.shape}")
    print(df.head())

    latest_date = df["Date"].max()
    df_latest = df[df["Date"] == latest_date]
    df_latest.loc[:, "Change"] = df_latest["Close"] - df_latest["Open"]  # Daily gain/loss
    return df_latest.nlargest(10, "Change").to_dict(orient="records")

def get_sector_performance():
    """Aggregates sector performance from the latest available data."""
    df = load_parquet_data(start_year=2020, end_year=2026)
    if df is not None:
        latest_date = df["Date"].max()
        df_latest = df[df["Date"] == latest_date]
        sector_summary = df_latest.groupby("Sector")["Close"].mean().reset_index()
        return sector_summary.to_dict(orient="records")
    return {"error": "Data not found"}

def get_stock_data(ticker):
    """Returns historical data for a specific stock."""
    df = load_parquet_data(start_year=1990, end_year=2026)  # Load all data for the stock
    if df is not None:
        df_stock = df[df["Ticker"] == ticker]

        if df_stock.empty:
            return {"error": "Stock data not found"}

        # Replace NaN and infinite values before converting to JSON
        df_stock.replace([np.inf, -np.inf], np.nan, inplace=True)
        df_stock.fillna(0, inplace=True)  # Replace NaN with 0 or any other default value

        return df_stock.to_dict(orient="records")

    return {"error": "Data not found"}

def get_all_tickers():
    """
    Connects to a PostgreSQL DB using DB_CONFIG,
    queries the tickers table, and returns a list of tickers
    along with additional details (company_name, sector, industry).
    """

    tickers = []
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT ticker, company_name, sector, industry FROM tickers")
        rows = cur.fetchall()
        tickers = [
            {
                "ticker": row[0],
                "company_name": row[1],
                "sector": row[2],
                "industry": row[3]
            }
            for row in rows
        ]
        cur.close()
        conn.close()
    except Exception as e:
        return {"error": str(e)}
    return tickers
