# Config file to store AWS keys, DB connection, etc.

DB_CONFIG = {
    'host': 'localhost',
    'dbname': 'sp500_db',
    'user': 'sp500_admin',
    'password': 'Jets-2514'
}

RAW_DATA_PATH="local_s3/raw_data"

AGGREGATED_FILE="local_s3/raw_data/all_historical_data.csv"
