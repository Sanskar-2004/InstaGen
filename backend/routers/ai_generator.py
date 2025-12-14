"""
AI Generation Router - Gemini Pro for Logo Generation
Uses Google Gemini API directly for high-quality, fast logo generation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import json
import random
import os
from dotenv import load_dotenv
import logging
import base64

# Load environment variables FIRST
load_dotenv()

# Setup logger BEFORE any imports that use it
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Generator"])

# --- CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_IMAGE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Verify Gemini API Key
if GEMINI_API_KEY:
    logger.info("✅ GEMINI PRO CONFIGURED - Using Gemini 2.0 Flash for logo generation")
else:
    logger.warning("⚠️ GEMINI_API_KEY not set - Logo generation will fail. Set GEMINI_API_KEY in .env")

# --- MODELS ---
class AdCopyRequest(BaseModel):
    product_name: str
    description: str = ""
    tone: str = "Professional"

class LogoRequest(BaseModel):
    brand_name: str
    style: str = "Modern"
    styles: list = None  # For mix & match: array of selected styles

# --- STYLE MAPPING ---
STYLE_MAP = {
    "Modern": "minimalist, sleek, vector art, flat design, clean lines, contemporary, professional",
    "Vintage": "retro, 70s aesthetic, vintage badge, nostalgic, warm colors, classic, timeless",
    "Minimalist": "minimal, simple, geometric shapes, monochrome, icon-like, bold sans-serif, stark",
    "Luxury": "luxurious, premium, gold accents, sophisticated, elegant, high-end, exclusive, upscale",
    "Tech": "futuristic, neon, cyberpunk, geometric shapes, circuit lines, gradient, tech startup",
    "Playful": "cute, vibrant colors, friendly, cheerful, fun, cartoon style, energetic, approachable",
    "Organic": "natural, eco-friendly, flowing curves, earth tones, botanical, sustainable, green",
    "Abstract": "abstract art, artistic, creative, unique, contemporary, expressionist, modern art",
    "3D": "three-dimensional, realistic shading, depth, glossy, metallic, modern, sculptural",
    "Sports": "athletic, dynamic, energetic, powerful, bold, strength, competitive, movement",
}

# --- FALLBACK VARIATIONS (For Offline Mode) ---
FALLBACK_HEADLINES = [
    "Stop Scrolling! {product} is Here 🔥",
    "Upgrade Your Life with {product} ✨",
    "The Secret to {desc} is Here 🤫",
    "Why Everyone is Talking About {product} 🚀",
    "Don't Miss Out on {product} 💎",
    "Finally, {product} is Here! 🎉",
    "Game-Changer Alert: {product} 🚀",
    "You Need {product} in Your Life 💯"
]

FALLBACK_BODIES = [
    "Experience premium quality. {desc} Join thousands of satisfied customers.",
    "Tired of mediocrity? {product} is the upgrade you've been waiting for.",
    "Transform your experience today. {desc} Limited stock available!",
    "Designed specifically for you. {desc} Don't wait, get it now!",
    "This is what excellence looks like. {product} is your answer.",
    "Stop settling for less. {product} is the difference maker.",
    "The results speak for themselves. {desc} Be part of the movement!"
]

FALLBACK_CTAS = [
    "Shop Now 🛒",
    "Get Yours 👇",
    "Learn More 💡",
    "Claim Offer 🎁",
    "Join Today ✨",
    "Discover More 🔍",
    "Start Now 🚀"
]

# --- ENDPOINTS ---

@router.post("/generate-text")
async def generate_ad_copy(request: AdCopyRequest):
    """
    Generate Ad Copy with random variation seed.
    
    Key feature: Adds a random number to the prompt so the AI treats
    every request as brand new, even for identical inputs.
    This prevents caching and ensures fresh variations.
    """
    
    # 1. FORCE VARIATION: Add random seed to prompt
    # This tricks the AI into generating new results every time
    variation_seed = random.randint(1, 100000)
    
    system_prompt = """You are a Senior Copywriter expert at Instagram ads.
Return ONLY valid JSON with no markdown blocks:
{"headline": "max 7 words", "body": "max 30 words", "cta": "call to action"}"""

    user_prompt = f"""Write Instagram ad copy (Variation #{variation_seed}):
Product: {request.product_name}
Description: {request.description if request.description else 'Premium product'}
Tone: {request.tone}

IMPORTANT: Generate something NEW and UNIQUE for variation #{variation_seed}.
Return ONLY JSON, no code blocks."""

    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "temperature": 0.9,  # HIGH creativity to force variation
            "maxOutputTokens": 500
        }
    }
    
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured, using random fallback")
        return _get_random_fallback_text(request)
    
    try:
        response = requests.post(
            f"{GEMINI_BASE_URL}?key={GEMINI_API_KEY}",
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            logger.warning(f"Gemini API error: {response.status_code}, using fallback")
            return _get_random_fallback_text(request)
        
        result = response.json()
        
        if "candidates" not in result or not result["candidates"]:
            logger.warning("No content from Gemini, using fallback")
            return _get_random_fallback_text(request)
        
        generated_text = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Try to parse JSON
        try:
            clean_text = generated_text.replace("```json", "").replace("```", "").strip()
            copy_data = json.loads(clean_text)
            return {
                "status": "success",
                "headline": copy_data.get("headline", ""),
                "body": copy_data.get("body", ""),
                "cta": copy_data.get("cta", ""),
                "mode": "gemini"
            }
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse error: {e}, using fallback")
            return _get_random_fallback_text(request)
        
    except Exception as e:
        logger.warning(f"Gemini error: {str(e)}, using random fallback")
        return _get_random_fallback_text(request)


@router.post("/generate-logo")
async def generate_logo(request: LogoRequest):
    """
    Generate professional logos using Gemini-optimized prompts.
    Supports mix & match styles for unique combinations.
    IMPORTANT: Always includes brand name text in the logo.
    
    Strategy:
    1. Use styles array if provided (mix & match), otherwise use single style
    2. Try to use Gemini 2.0 Flash to optimize the prompt (if quota available)
    3. Fallback to pre-optimized Gemini prompts (no API calls needed)
    4. Generate image via pollinations.ai with optimized prompt
    """
    
    try:
        # Support mix & match: use styles array if provided, otherwise use single style
        selected_styles = request.styles if request.styles else [request.style]
        style_names = ", ".join(selected_styles)
        
        # Get keywords for all selected styles
        all_keywords = []
        for style in selected_styles:
            keywords = STYLE_MAP.get(style, STYLE_MAP["Modern"])
            all_keywords.append(keywords)
        style_keywords = ", ".join(all_keywords)
        
        logger.info(f"🎨 LOGO GENERATION: Creating logo for '{request.brand_name}' with styles: {style_names}")
        
        optimized_prompt = None
        used_gemini_api = False
        
        # Step 1: Try to use Gemini to generate optimized prompt (if API available & quota OK)
        if GEMINI_API_KEY:
            try:
                gemini_prompt = f"""Generate ONLY a detailed, single-line image generation prompt for a professional logo.
Brand Name: {request.brand_name}
Styles: {style_names}
Keywords: {style_keywords}

Requirements:
- MUST include brand text "{request.brand_name}" in the logo
- ONE LINE ONLY
- Combine all specified styles together
- Vector art style
- Professional quality

Return ONLY the prompt."""
                
                payload = {
                    "contents": [{"parts": [{"text": gemini_prompt}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 150
                    }
                }
                
                async with httpx.AsyncClient(timeout=15) as client:
                    response = await client.post(
                        f"{GEMINI_IMAGE_URL}?key={GEMINI_API_KEY}",
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if "candidates" in result and result["candidates"]:
                            optimized_prompt = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                            used_gemini_api = True
                            logger.info(f"✅ Used Gemini API to optimize prompt")
                    else:
                        logger.warning(f"⚠️ Gemini API returned {response.status_code}, using fallback")
                        
            except Exception as e:
                logger.warning(f"⚠️ Gemini API call failed ({str(e)}), using fallback prompt")
        
        # Step 2: Fallback to pre-optimized prompt if Gemini unavailable/failed
        if not optimized_prompt:
            optimized_prompt = f"professional {style_names.lower()} logo for {request.brand_name}, vector art, {style_keywords}, minimalist, clean design, text included"
            logger.info(f"📝 Using optimized fallback prompt (no API call)")
        
        # Step 3: Generate image URL using Pollinations.ai (reliable, no quota limits)
        seed = random.randint(1, 999999999)
        
        # Build Pollinations URL with optimized prompt
        import urllib.parse
        encoded_prompt = urllib.parse.quote(optimized_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&seed={seed}&model=turbo"
        
        logger.info(f"✅ LOGO URL GENERATED: {request.brand_name} | Styles: {style_names} | Seed: {seed}")
        
        return {
            "status": "success",
            "url": image_url,
            "brand_name": request.brand_name,
            "style": request.style,
            "styles": selected_styles,  # Include mix & match styles
            "seed": seed,
            "model": "gemini-2.0-flash" if used_gemini_api else "gemini-fallback",
            "message": f"Generated using Gemini {'API' if used_gemini_api else 'Fallback'} + Pollinations.ai (Fast, Professional & Efficient) - Styles: {style_names}"
        }
        
    except Exception as e:
        logger.error(f"❌ LOGO GENERATION ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Logo generation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
        "styles_available": list(STYLE_MAP.keys()),
        "fallback_enabled": True
    }


# --- INTERNAL HELPERS ---

def _get_random_fallback_text(request: AdCopyRequest) -> dict:
    """
    Returns RANDOM variations from predefined lists.
    
    This is the "Offline Mode" - when API fails, we still return
    different text every time by randomly selecting from lists.
    User sees fresh content even if API is down.
    """
    
    headline_template = random.choice(FALLBACK_HEADLINES)
    body_template = random.choice(FALLBACK_BODIES)
    cta = random.choice(FALLBACK_CTAS)
    
    # Fill in the templates with actual product/description
    desc = request.description if request.description else f"high quality {request.product_name}"
    
    headline = headline_template.format(
        product=request.product_name,
        desc=desc
    )
    
    body = body_template.format(
        product=request.product_name,
        desc=desc
    )
    
    return {
        "status": "success",
        "headline": headline,
        "body": body,
        "cta": cta,
        "mode": "fallback_random",
        "note": "Generated via Offline Mode (API Unavailable)"
    }
