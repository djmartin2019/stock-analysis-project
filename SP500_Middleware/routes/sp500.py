from fastapi import APIRouter
from services.data_loader import (
    get_sp500_overview,
    get_top_performers,
    get_bottom_performers,
    get_sector_performance,
    get_stock_data,
    get_all_tickers
)

router = APIRouter()

@router.get("/overview")
async def sp500_overview():
    return get_sp500_overview()

@router.get("/top-performers")
async def top_performers():
    return get_top_performers()

@router.get("/bottom-performers")
async def bottom_performers():
    return get_bottom_performers()

@router.get("/sectors")
async def sector_performance():
    return get_sector_performance()

@router.get("/stock/{ticker}")
async def stock_data(ticker: str):
    return get_stock_data(ticker)

@router.get("/tickers")
async def get_tickers():
   return get_all_tickers()
