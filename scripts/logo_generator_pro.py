"""
Pro Logo Generation Script - With Style Mix & Match
Uses Google's Gemini 2.0 Flash model to generate professional, high-quality logos.
Saves results directly to your computer.

Setup:
1. Install required package: pip install google-generativeai pillow
2. Get your API key from: https://aistudio.google.com/apikey
3. Replace YOUR_API_KEY_HERE with your actual API key
4. Mix and match styles for unique logo combinations
5. Run: python logo_generator_pro.py
"""

import google.generativeai as genai
from PIL import Image
import io

# --- Configuration ---
# 1. Paste your API Key from Google AI Studio here
API_KEY = "YOUR_API_KEY_HERE"
genai.configure(api_key=API_KEY)

# 2. Select the advanced image generation model
MODEL_ID = "gemini-2.0-flash"

# 3. Define your PRO prompt with mix & match styles
# IMPORTANT: Must clearly include the brand name text in the logo
BRAND_NAME = "NEXUS AI"

# --- MIX & MATCH STYLES ---
# Select multiple styles and combine them for unique logos
AVAILABLE_STYLES = {
    "Modern": "minimalist, sleek, vector art, flat design, clean lines, contemporary",
    "Vintage": "retro, 70s aesthetic, vintage badge, nostalgic, warm colors, classic",
    "Minimalist": "minimal, simple, geometric shapes, monochrome, icon-like, bold sans-serif",
    "Luxury": "luxurious, premium, gold accents, sophisticated, elegant, high-end",
    "Tech": "futuristic, neon, cyberpunk, geometric shapes, circuit lines, gradient",
    "Playful": "cute, vibrant colors, friendly, cheerful, fun, cartoon style, energetic",
    "Organic": "natural, eco-friendly, flowing curves, earth tones, botanical, sustainable",
    "Abstract": "abstract art, artistic, creative, unique, contemporary, expressionist",
    "3D": "three-dimensional, realistic shading, depth, glossy, metallic, modern",
    "Sports": "athletic, dynamic, energetic, powerful, bold, strength, competitive",
}

# Select styles to mix and match (empty list = use all)
SELECTED_STYLES = ["Modern", "Tech"]  # Change to mix different styles

# Combine selected styles for unique logo
STYLE = ", ".join([AVAILABLE_STYLES[s] for s in SELECTED_STYLES]) if SELECTED_STYLES else ", ".join(AVAILABLE_STYLES.values())

PROMPT = f"""
Professional logo design with the text "{BRAND_NAME}" prominently displayed.
The text "{BRAND_NAME}" MUST be clearly visible and readable in the logo.
Style: {STYLE}
Design approach: Clean, professional, suitable for business use.
Typography: Modern, bold, easy to read, sans-serif font.
Include the brand name/text as a key part of the logo design.
Vector graphics, high quality, ready for use.
Background: white or transparent.
No watermarks, no text other than "{BRAND_NAME}".
"""

# Optional: Define what you DON'T want (Negative Prompt)
NEGATIVE_PROMPT = "photorealistic, 3d render, blurry, messy, hand drawn, textured paper, watermark, no text"

print(f"🎨 Initializing Gemini 2.0 Flash model...")
print(f"🏷️  Generating logo for: {BRAND_NAME}")
print(f"🎭 Style mix: {', '.join(SELECTED_STYLES) if SELECTED_STYLES else 'All styles'}")

try:
    # Initialize the Generative AI model
    model = genai.GenerativeModel(MODEL_ID)

    print("📡 Generating image... This might take 10-30 seconds.")

    # Call the generate_images method via Gemini
    response = model.generate_content(
        [
            f"Generate a professional logo image with this exact prompt:\n\n{PROMPT}\n\nNegative prompt (avoid): {NEGATIVE_PROMPT}"
        ],
        stream=False
    )

    # Check if generation was successful
    if response and response.parts:
        # Extract image data from response
        image_data = response.parts[0].data if hasattr(response.parts[0], 'data') else response.parts[0].inline_data.data
        
        # Convert the raw image data to a PIL Image object
        image = Image.open(io.BytesIO(image_data))

        # Save the high-quality image locally
        style_suffix = "_".join(SELECTED_STYLES) if SELECTED_STYLES else "all_styles"
        output_filename = f"{BRAND_NAME.replace(' ', '_').lower()}_{style_suffix}_logo.png"
        image.save(output_filename, format="PNG")

        print(f"\n✅ Success! Your logo has been saved to: {output_filename}")
        print(f"🏷️  Brand: {BRAND_NAME}")
        print(f"🎭 Style: {', '.join(SELECTED_STYLES) if SELECTED_STYLES else 'All Styles Mixed'}")
        print("📂 Open the file to view your professional logo.")

        # Optional: To show it directly, uncomment below:
        # image.show()

    else:
        print("\n❌ Generation failed. No image returned.")
        print("💡 Tip: Check your API key and ensure billing is enabled.")


except Exception as e:
    print(f"\n❌ An error occurred.")
    print(f"🔍 Error details: {e}")
    print("\n💡 Troubleshooting Tips:")
    print("   - Check your API key is correct")
    print("   - Ensure billing is enabled in Google Cloud Console")
    print("   - Verify your quota hasn't been exceeded")
    print("   - Try a simpler style combination")

