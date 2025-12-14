#!/bin/bash
# Quick setup script for InstaGen AI Features

echo "🚀 InstaGen AI Features Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cp backend/.env.example backend/.env
    echo "✅ .env file created. Please edit it with your Hugging Face API key."
    echo ""
    echo "Steps to get your API key:"
    echo "1. Go to https://huggingface.co/settings/tokens"
    echo "2. Create a new token (read-only is fine)"
    echo "3. Copy the token and paste it in backend/.env"
    echo ""
else
    echo "✅ .env file already exists"
fi

echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt --quiet
cd ..

echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo "✅ Frontend dependencies installed"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Hugging Face API key to backend/.env"
echo "2. Start backend: cd backend && python -m uvicorn main:app --reload"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 and try the AI Tools!"
echo ""
