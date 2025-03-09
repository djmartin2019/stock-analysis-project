from pyspark.sql import SparkSession
import plotly.graph_objects as go
import pandas as pd

spark = SparkSession.builder.appName("InteractiveGraph").getOrCreate()

# Read your Silver layer Parquet files
df = spark.read.parquet("local_s3/silver_data")

# Register the DataFrame as a temporary view for SQL querying.
df.createOrReplaceTempView("silver_data")

# Run a Spark SQL query to select tthe columns we need.
agg_df = spark.sql("""
                   SELECT Ticker, Date, moving_avg_20, moving_avg_50
                   FROM silver_data
                   ORDER BY Ticker, Date
                   """)

# Convert the Spark DataFrame to a Pandas DataFrame.
pandas_df = agg_df.toPandas()

# Ensure the Date column is datetime.
pandas_df['Date'] = pd.to_datetime(pandas_df['Date'])

# Get the unique tickers.
tickers = sorted(pandas_df['Ticker'].unique())

# Create an empty Plotly Figure.
fig = go.Figure()

# For each ticker, add two traces: one for the 20-day MA and one for the 50-day MA.
# Initially, only the first ticker's traces are visibile.
for i, ticker in enumerate(tickers):
    df_stock = pandas_df[pandas_df['Ticker'] == ticker]
    visible = True if i == 0 else False
    fig.add_trace(go.Scatter(
        x=df_stock['Date'],
        y=df_stock['moving_avg_20'],
        mode='lines',
        name=f"{ticker} 20-day MA",
        visible=visible
        ))
    fig.add_trace(go.Scatter(
        x=df_stock['Date'],
        y=df_stock['moving_avg_50'],
        mode='lines',
        name=f"{ticker} 50-day MA",
        visible=visible
        ))

# Create an update menu with a dropdown button for each ticker.
buttons = []
for i, ticker in enumerate(tickers):
    # There are 2 traces per ticker.
    visibility = [False] * (len(tickers) * 2)
    visibility[2 * i] = True # 20-day trace for this ticker.
    visibility[2 * i + 1] = True # 50-day trace for this ticker.
    buttons.append(dict(
        label=ticker,
        method="update",
        args=[{"visible": visibility},
              {"title": f"Moving Averages for {ticker}"}]
        ))

# Update layout with the dropdown menu.
fig.update_layout(
        updatemenus=[{
            "buttons": buttons,
            "direction": "down",
            "showactive": True,
            "x": 0.1,
            "xanchor": "left",
            "y": 1.15,
            "yanchor": "top"
            }],
    title=f"Moving Averages for {tickers[0]}",
    xaxis_title="Date",
    yaxis_title="Moving Average"
)

fig.show()
