"""
MODULE C: RECURSIVE IMAGE OPTIMIZER
Standalone image compression function for FastAPI backend

Add this to your export route:
────────────────────────────────
from MODULE_C_ImageOptimizer import recursive_optimize_export

@app.post('/api/export')
async def export_image(file_path: str):
    optimized_path = recursive_optimize_export(file_path)
    return { 'file': optimized_path, 'status': 'optimized' }
"""

import os
from PIL import Image
import logging

logger = logging.getLogger(__name__)

# Configuration
MAX_FILE_SIZE_KB = 500  # 500KB target
QUALITY_START = 95
QUALITY_MIN = 65
QUALITY_STEP = 5


def recursive_optimize_export(file_path):
    """
    Recursively optimize image until it's under 500KB
    
    Logic:
    1. Load image from file_path
    2. Check file size
    3. If > 500KB, reduce JPEG quality by 5 and re-save
    4. Repeat until < 500KB or quality < 65
    
    Args:
        file_path (str): Path to the image file
        
    Returns:
        str: Path to the optimized image
    """
    if not os.path.exists(file_path):
        logger.error(f"[ImageOptimizer] File not found: {file_path}")
        return None

    try:
        # Get initial file size
        file_size_kb = os.path.getsize(file_path) / 1024
        logger.info(
            f"[ImageOptimizer] Starting optimization: {file_size_kb:.2f}KB"
        )

        # If already under limit, return as-is
        if file_size_kb <= MAX_FILE_SIZE_KB:
            logger.info(f"[ImageOptimizer] Already optimized: {file_size_kb:.2f}KB")
            return file_path

        # Open image
        img = Image.open(file_path)
        logger.info(f"[ImageOptimizer] Image mode: {img.format}, Size: {img.size}")

        # Convert RGBA to RGB if needed
        if img.mode == "RGBA":
            rgb_img = Image.new("RGB", img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])
            img = rgb_img

        # Recursive compression loop
        quality = QUALITY_START
        iteration = 0
        max_iterations = 20

        while file_size_kb > MAX_FILE_SIZE_KB and quality >= QUALITY_MIN:
            iteration += 1
            quality -= QUALITY_STEP

            logger.info(
                f"[ImageOptimizer] Iteration {iteration}: quality={quality}, "
                f"current_size={file_size_kb:.2f}KB"
            )

            # Save with reduced quality
            img.save(file_path, format="JPEG", quality=quality, optimize=True)

            # Check new file size
            file_size_kb = os.path.getsize(file_path) / 1024

            if iteration >= max_iterations:
                logger.warn(
                    f"[ImageOptimizer] Max iterations ({max_iterations}) reached"
                )
                break

        logger.info(
            f"[ImageOptimizer] Optimization complete: {file_size_kb:.2f}KB "
            f"(quality: {quality}, iterations: {iteration})"
        )

        return file_path

    except Exception as e:
        logger.error(f"[ImageOptimizer] Optimization failed: {str(e)}")
        return None


def optimize_with_format_fallback(file_path):
    """
    Enhanced version: Falls back to WebP/PNG if JPEG quality is exhausted
    
    Args:
        file_path (str): Path to the image file
        
    Returns:
        str: Path to the optimized image
    """
    if not os.path.exists(file_path):
        logger.error(f"[ImageOptimizer] File not found: {file_path}")
        return None

    try:
        file_size_kb = os.path.getsize(file_path) / 1024

        # First try JPEG optimization
        if file_path.lower().endswith((".jpg", ".jpeg")):
            logger.info(f"[ImageOptimizer] Attempting JPEG optimization")
            result = recursive_optimize_export(file_path)

            if result:
                file_size_kb = os.path.getsize(result) / 1024
                if file_size_kb <= MAX_FILE_SIZE_KB:
                    return result

        # If still too large, try WebP format
        logger.info(f"[ImageOptimizer] Attempting WebP conversion")
        img = Image.open(file_path)

        if img.mode == "RGBA":
            rgb_img = Image.new("RGB", img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])
            img = rgb_img

        webp_path = file_path.replace(".jpg", ".webp").replace(".jpeg", ".webp")
        img.save(webp_path, format="WEBP", quality=80)

        webp_size_kb = os.path.getsize(webp_path) / 1024
        logger.info(f"[ImageOptimizer] WebP size: {webp_size_kb:.2f}KB")

        if webp_size_kb <= MAX_FILE_SIZE_KB:
            logger.info(f"[ImageOptimizer] WebP optimized successfully")
            return webp_path

        # If WebP still too large, reduce quality
        for quality in [70, 60, 50, 40]:
            img.save(webp_path, format="WEBP", quality=quality)
            webp_size_kb = os.path.getsize(webp_path) / 1024

            if webp_size_kb <= MAX_FILE_SIZE_KB:
                logger.info(
                    f"[ImageOptimizer] WebP optimized at quality {quality}: "
                    f"{webp_size_kb:.2f}KB"
                )
                return webp_path

        logger.error(f"[ImageOptimizer] Could not optimize below {MAX_FILE_SIZE_KB}KB")
        return file_path  # Return original if all else fails

    except Exception as e:
        logger.error(f"[ImageOptimizer] Format fallback failed: {str(e)}")
        return file_path


# ============================================================================
# USAGE EXAMPLES
# ============================================================================
"""
Example 1: Basic usage in FastAPI route
──────────────────────────────────────

from fastapi import FastAPI
from MODULE_C_ImageOptimizer import recursive_optimize_export

@app.post('/api/export')
async def export_design(request: ExportRequest):
    # Generate or process image
    image_path = generate_image(request)
    
    # Optimize
    optimized_path = recursive_optimize_export(image_path)
    
    # Return to user
    return FileResponse(optimized_path)


Example 2: With format fallback
────────────────────────────────

from MODULE_C_ImageOptimizer import optimize_with_format_fallback

@app.post('/api/export-advanced')
async def export_with_fallback(request: ExportRequest):
    image_path = generate_image(request)
    optimized_path = optimize_with_format_fallback(image_path)
    return FileResponse(optimized_path)


Example 3: Standalone script
─────────────────────────────

if __name__ == '__main__':
    result = recursive_optimize_export('./exports/my_image.jpg')
    if result:
        final_size = os.path.getsize(result) / 1024
        print(f"✓ Optimized to {final_size:.2f}KB")
    else:
        print("✗ Optimization failed")
"""
