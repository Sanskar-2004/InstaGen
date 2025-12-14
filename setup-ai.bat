@echo off
REM Quick setup script for InstaGen AI Features (Windows)

echo 🚀 InstaGen AI Features Setup
echo ==============================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo 📝 Creating .env file...
    copy backend\.env.example backend\.env
    echo ✅ .env file created. Please edit it with your Hugging Face API key.
    echo.
    echo Steps to get your API key:
    echo 1. Go to https://huggingface.co/settings/tokens
    echo 2. Create a new token (read-only is fine)
    echo 3. Copy the token and paste it in backend\.env
    echo.
) else (
    echo ✅ .env file already exists
)

echo 📦 Installing dependencies...
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo ✅ Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo ✅ Frontend dependencies installed
echo.

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Add your Hugging Face API key to backend\.env
echo 2. Start backend: cd backend ^& python -m uvicorn main:app --reload
echo 3. Start frontend: cd frontend ^& npm run dev
echo 4. Open http://localhost:3000 and try the AI Tools!
echo.

pause
