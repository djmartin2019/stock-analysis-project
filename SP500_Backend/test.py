from pyspark.sql import SparkSession
import plotly.express as px

spark = SparkSession.builder.appName("ParquetExploration").getOrCreate()

df = spark.read.parquet("local_s3/silver_data")

# Register the DataFrame as a temporary view for SQL querying.
df.createOrReplaceTempView("silver_data")

# Run a Spark SQL query to select a subset.
agg_df = spark.sql("""
    SELECT Ticker, Date, moving_avg_20, volatility_20
    FROM silver_data
    ORDER BY Date
""")

# Convert the Spark DataFrame to a Pandas DataFrame.
pandas_df = agg_df.toPandas()

print(pandas_df.head())

# If your dataset is large, you can limit it using:
# pandas_df = agg_df.limit(10000).toPandas()

fig = px.line(
        pandas_df,
        x='Date',
        y='moving_avg_20',
        color='Ticker',
        title="20-day moving average for all stocks"
)

fig.show()
