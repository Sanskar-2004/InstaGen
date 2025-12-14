#!/bin/bash

# InstaGen Startup Script for Mac/Linux
# Runs FastAPI backend and React frontend simultaneously in parallel processes

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Starting InstaGen..."
echo ""

# Function to cleanup background processes on script exit
cleanup() {
    echo ""
    echo "Stopping InstaGen servers..."
    kill %1 %2 2>/dev/null || true
    exit 0
}

# Set up trap to handle script exit
trap cleanup EXIT INT TERM

# Start Backend
echo "Starting FastAPI backend on http://localhost:8000..."
(
    cd backend
    source venv/bin/activate
    python -m uvicorn main:app --reload
) &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "Starting React frontend on http://localhost:3000..."
(
    cd frontend
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "Both servers are running in parallel."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers."
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
