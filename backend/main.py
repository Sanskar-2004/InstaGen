from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from pydantic import BaseModel
from pathlib import Path
import os
import warnings
import logging
from dotenv import load_dotenv
import httpx
import urllib.parse
import random

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Define request models
class ImageProxyRequest(BaseModel):
    url: str

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore', message='.*CUDA is not available.*')

# Import routers (after env loading)
try:
    from routers import assets, ai_generator
    logger.info("Routers imported successfully")
except ImportError as e:
    logger.warning(f"Could not import all routers: {e}")

# Create FastAPI app
app = FastAPI(
    title="InstaGen API",
    description="Professional Instagram content generation tool with AI features",
    version="2.0.0"
)

# Configure CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup static files directory for image uploads
uploads_dir = Path("static/uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)
logger.info(f"Static uploads directory ready: {uploads_dir.absolute()}")

# Mount static files
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("Static files mounted at /static")
except Exception as e:
    logger.error(f"Failed to mount static files: {e}")

# Include API routers
try:
    app.include_router(assets.router)
    logger.info("Assets router included")
except Exception as e:
    logger.warning(f"Could not include assets router: {e}")

try:
    app.include_router(ai_generator.router)
    logger.info("AI Generator router included")
except Exception as e:
    logger.warning(f"Could not include AI generator router: {e}")

# --- ROOT ENDPOINTS ---

@app.get("/")
def read_root():
    """API root endpoint."""
    return {
        "message": "Welcome to InstaGen API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "assets": "/api/assets",
            "ai": "/api/ai",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    static_writable = os.access(uploads_dir, os.W_OK)
    gemini_key = bool(os.getenv("GEMINI_API_KEY"))
    
    return {
        "status": "healthy",
        "version": "2.0.0",
        "services": {
            "static_files": "ok" if static_writable else "error",
            "gemini_api": "configured" if gemini_key else "not_configured"
        }
    }


@app.post("/api/proxy-image")
async def proxy_image(request_data: ImageProxyRequest):
    """
    Intelligent Proxy with Fallback Strategy:
    1. Tries to fetch the AI image from Gemini-generated URLs
    2. If that fails, uses DiceBear geometric shapes as fallback
    3. Ensures your app NEVER crashes from external API failures
    """
    url = request_data.url
    
    if not url or not url.startswith(("http://", "https://")):
        return {"status": "error", "detail": "Invalid URL"}
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=30.0) as client:
        # === ATTEMPT 1: Try the AI image from Gemini ===
        try:
            logger.info(f"📡 Fetching Gemini-generated image: {url[:60]}...")
            response = await client.get(url)
            
            if response.status_code == 200:
                b64_data = __import__('base64').b64encode(response.content).decode('utf-8')
                content_type = response.headers.get("content-type", "image/png")
                data_url = f"data:{content_type};base64,{b64_data}"
                logger.info(f"✅ Successfully fetched image: {len(response.content)} bytes")
                return {"status": "success", "data": data_url}
            
            logger.warning(f"⚠️ Image fetch failed with status {response.status_code}")
            
        except Exception as e:
            logger.warning(f"⚠️ Image fetch error: {str(e)}")
        
        # === ATTEMPT 2: Fallback to DiceBear geometric shapes ===
        # These look like professional abstract logos and are always reliable
        try:
            logger.info("🎨 Using DiceBear geometric shapes fallback...")
            seed = random.randint(1, 100000)
            fallback_url = f"https://api.dicebear.com/9.x/shapes/svg?seed={seed}&backgroundColor=0a0a0a&scale=80"
            
            fallback_response = await client.get(fallback_url)
            if fallback_response.status_code == 200:
                # Return SVG as data URL
                b64_data = __import__('base64').b64encode(fallback_response.content).decode('utf-8')
                data_url = f"data:image/svg+xml;base64,{b64_data}"
                logger.info("✅ DiceBear fallback loaded successfully")
                return {"status": "success", "data": data_url}
        
        except Exception as e:
            logger.error(f"❌ DiceBear fallback error: {str(e)}")
        
        # === FINAL FALLBACK: Return error but don't crash ===
        return {"status": "error", "detail": "All image sources temporarily unavailable"}

# --- STARTUP/SHUTDOWN EVENTS ---

@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    logger.info("=" * 60)
    logger.info("🚀 InstaGen API Starting...")
    logger.info(f"📁 Upload directory: {uploads_dir.absolute()}")
    logger.info(f"🔑 Gemini API Key: {'✓ Configured' if os.getenv('GEMINI_API_KEY') else '✗ Not configured'}")
    logger.info("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    logger.info("🛑 InstaGen API Shutting down...")


# --- EXCEPTION HANDLERS ---

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    logger.error(f"HTTP Error {exc.status_code}: {exc.detail}")
    return {
        "error": True,
        "status_code": exc.status_code,
        "detail": exc.detail
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler."""
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "error": True,
        "status_code": 500,
        "detail": "An unexpected error occurred"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
