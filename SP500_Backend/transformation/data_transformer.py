from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, stddev, to_date, year, floor
from pyspark.sql.window import Window

class DataTransformer:
    def __init__(self, bronze_path, silver_path):
        """
        :param bronze_path: Path to the raw CSV files (Bronze layer)
        :param silver_path: Destination path for Parquet files (Silver layer)
        """
        self.bronze_path = bronze_path
        self.silver_path = silver_path
        self.spark = SparkSession.builder \
                .appName("DataTransformaiton") \
                .config("spark.driver.memory", "4g") \
                .getOrCreate()

    def transform_to_silver(self):
        # Read all raw CSV files directly using a wildcard pattern.
        print(f"Reading files from pattern: {self.bronze_path}")
        df = self.spark.read.option("header", "true") \
                .option("inferSchema", "true") \
                .csv(self.bronze_path)
        if df is None or df.rdd.isEmpty():
            print("No data found in Bronze layer!")
            return None

        # Ensure the Date column is properly typed
        df = df.withColumn("Date", to_date(col("Date"), "yyyy-MM-dd"))

        # For consistent processing, cast numeric columns to double
        df = df.withColumn("Close", col("Close").cast("double"))
        df = df.withColumn("Open", col("Open").cast("double"))
        df = df.withColumn("High", col("High").cast("double"))
        df = df.withColumn("Low", col("Low").cast("double"))
        df = df.withColumn("Volume", col("Volume").cast("double"))

        # Add Year and Decade columns.
        df = df.withColumn("Year", year(col("Date")))
        # Calculate the decade (e.g., for 1985, floor(1985/10)*10 = 1980)
        df = df.withColumn("Decade", (floor(col("Year") / 10) * 10).cast("string"))

        # Define a window for calculating metrics for each ticker, ordered by Date.
        # We partition by Ticker so that each stock's time series is processed separately.
        windowSpec_20 = Window.partitionBy("Ticker").orderBy("Date").rowsBetween(-19, 0)
        windowSpec_50 = Window.partitionBy("Ticker").orderBy("Date").rowsBetween(-49, 0)

        # Calculate a 20-day moving average and volatility on the "Close" price.
        df = df.withColumn("moving_avg_20", avg(col("Close")).over(windowSpec_20))
        df = df.withColumn("volatility_20", stddev(col("Close")).over(windowSpec_20))

        # Calculate a 50-day moving average and volatility on the "Close" price
        df = df.withColumn("moving_avg_50", avg(col("Close")).over(windowSpec_50))
        df = df.withColumn("volatility_50", stddev(col("Close")).over(windowSpec_50))

        # Write the transformed data as Parquet files (Silver Layer).
        df.write.mode("overwrite").partitionBy("Decade").parquet(self.silver_path)
        print(f"Transformed data written to Silver layer at {self.silver_path}")
        return df

if __name__ == "__main__":
    # Bronze_path uses a glob pattern that matches all CSV files in the partitioned bronze layer.
    bronze_path = "local_s3/raw_data/*/*/*/data.csv"
    silver_path = "local_s3/silver_data"

    # Instantiate the transformer and perform the transformation.
    transformer = DataTransformer(bronze_path, silver_path)
    transformed_df = transformer.transform_to_silver()

    if transformed_df is not None:
        print("Transformation completed successfully!")
    else:
        print("Transformation failed. Please check log for errors.")
