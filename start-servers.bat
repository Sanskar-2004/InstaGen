@echo off
title InstaGen - Backend & Frontend Servers

echo.
echo ============================================
echo   InstaGen Server Launcher
echo ============================================
echo.

REM Start Backend Server in a new window
echo Starting Backend Server (Port 8000)...
start "Backend - FastAPI" cmd /k "cd /d C:\Users\sansk\OneDrive\Desktop\InstaGen\backend && .\venv\Scripts\activate.bat && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend Server in a new window
echo Starting Frontend Server (Port 3000)...
start "Frontend - React" cmd /k "cd /d C:\Users\sansk\OneDrive\Desktop\InstaGen\frontend && npm run dev"

echo.
echo ============================================
echo Both servers are starting...
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close these windows to stop the servers
echo ============================================
echo.

pause
