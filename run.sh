#!/bin/bash

# Navigate to middleware and start FastAPI
echo "Starting SP500 Middleware API..."
cd SP500_Middleware
source venv/bin/activate # Activate virtual environments for Mac/Linux
uvicorn main:app --reload --host 127.0.0.1 --port 8000 & # Run in background
cd ..

# Navigate to frontend and start Next.JS in dev mode
echo "Starting SP500 Frontend..."
cd sp500_frontend
npm run dev & # Run Next.js in background
cd ..

# Keep script running
wait
