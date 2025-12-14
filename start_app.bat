@echo off
REM InstaGen Startup Script for Windows
REM Runs FastAPI backend and React frontend simultaneously in separate terminal windows

echo Starting InstaGen...
echo.

REM Navigate to project root (script location)
cd /d "%~dp0"

REM Start Backend in a new terminal window
echo Starting FastAPI backend on http://localhost:8000...
start cmd /k "cd backend && venv\Scripts\activate && python -m uvicorn main:app --reload"

REM Wait a moment for backend to initialize
timeout /t 2 /nobreak

REM Start Frontend in a new terminal window
echo Starting React frontend on http://localhost:3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate terminal windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each terminal window to stop the servers.
echo.
pause
