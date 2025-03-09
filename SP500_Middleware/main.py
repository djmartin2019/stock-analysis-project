from fastapi import FastAPI
from routes.sp500 import router as sp500_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="S&P 500 Middleware API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production, use your actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(sp500_router, prefix="/sp500")

@app.get("/")
def root():
    return {"message": "S&P 500 Middleware is running"}

