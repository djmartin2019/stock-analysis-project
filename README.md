# S&P 500 Data Pipeline & Middleware API

A comprehensive data pipeline for ingesting, processing, and serving historical S&P 500 stock data. This project demonstrates proficiency in data engineering, ETL with PySpark, data lake architecture (Bronze, Silver, Gold layers), and cloud integration with FastAPI and PostgreSQL.

---

## Overview

This project is designed to build a scalable data pipeline for the S&P 500 stocks. It includes the following core components:

- **Ingestion Module (Bronze Layer):**
  - Connects to the Yahoo Finance API via the `yfinance` library to fetch historical stock data.
  - Retrieves a list of tickers from a PostgreSQL database.
  - Stores raw CSV data in a partitioned data lake (Bronze layer), organized by year/month/day.

- **Transformation Module (Silver Layer):**
  - Utilizes PySpark to read the raw CSV files and perform data cleaning and enrichment.
  - Computes key metrics such as 20-day and 50-day moving averages and volatility using window functions.
  - Writes the processed data as Parquet files, partitioned (e.g., by Decade) for efficient querying.

- **Gold Layer:**
  - Curates a final dataset optimized for fast querying.
  - Loads this dataset into PostgreSQL for serving to business applications and dashboards.

- **Middleware API:**
  - A FastAPI-based RESTful API that provides endpoints to query:
    - An overview of the S&P 500.
    - Top and bottom performers.
    - Sector performance.
    - Historical data for individual stocks.
    - A list of all tickers from the database.
  - Includes CORS middleware for frontend integration.

- **Frontend Dashboard (Next.js):**
  - Interactively displays the data using Plotly and other visual components.
  - Allows users to search for and select individual stocks to update the dashboard.

---

## Architecture

### Data Lake (Medallion Architecture)

- **Bronze Layer:**  
Raw CSV files are ingested from yfinance and stored in a partitioned structure.

- **Silver Layer:**  
Processed and enriched data is stored as Parquet files for efficient querying and further transformations.
  
- **Gold Layer:**  
Curated data loaded into PostgreSQL for high-performance access by the API and business users.

### Cloud & Deployment

- **FastAPI Middleware API:**  
Deployed locally (and later on AWS using services like Lambda/API Gateway), the API exposes endpoints for data queries and aggregation.

- **PostgreSQL:**  
Used for storing ticker metadata and the curated Gold layer data.

- **Spark/PySpark:**  
Handles the ETL process, data cleaning, and metrics computation.

- **AWS Considerations:**  
The architecture is designed to be scalable and can be migrated to AWS (using S3, AWS Glue/EMR, RDS, and serverless API endpoints) for production use.

---
