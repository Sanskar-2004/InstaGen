"""
Assets Management Router
Handles image uploads with background removal and asset management.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from pathlib import Path
import os
import uuid
import logging
from PIL import Image
import io
from rembg import remove
from typing import List, Dict

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assets", tags=["assets"])

# Configuration
UPLOADS_DIR = Path("static/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS = {"image/jpeg", "image/png", "image/webp", "image/gif"}
OUTPUT_FORMAT = "PNG"  # Always save as PNG for transparency support

# --- UTILITY FUNCTIONS ---

def validate_image_file(content_type: str, file_size: int) -> None:
    """
    Validate uploaded file.
    
    Args:
        content_type: MIME type of the file
        file_size: Size of the file in bytes
        
    Raises:
        HTTPException: If validation fails
    """
    if content_type not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Allowed: {', '.join(ALLOWED_FORMATS)}"
        )
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )

def remove_background_from_image(image_bytes: bytes) -> Image.Image:
    """
    Remove background from image using rembg.
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        PIL Image with background removed
        
    Raises:
        ValueError: If background removal fails
    """
    try:
        input_image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed (rembg requires RGB input)
        if input_image.mode not in ['RGB', 'RGBA']:
            input_image = input_image.convert('RGB')
        
        # Remove background
        output_image = remove(input_image)
        
        # Ensure output has alpha channel
        if output_image.mode != 'RGBA':
            output_image = output_image.convert('RGBA')
        
        return output_image
    
    except Exception as e:
        logger.warning(f"Background removal failed: {str(e)}")
        # If removal fails, return the original image converted to RGBA
        try:
            fallback_image = Image.open(io.BytesIO(image_bytes))
            if fallback_image.mode != 'RGBA':
                fallback_image = fallback_image.convert('RGBA')
            return fallback_image
        except Exception as fallback_error:
            raise ValueError(f"Could not process image: {str(fallback_error)}")

def save_processed_image(image: Image.Image, filename: str) -> Path:
    """
    Save processed image to uploads directory.
    
    Args:
        image: PIL Image object
        filename: Filename to save as
        
    Returns:
        Full path to saved file
        
    Raises:
        IOError: If save fails
    """
    try:
        file_path = UPLOADS_DIR / filename
        
        # Save with transparency support
        image.save(
            file_path,
            format=OUTPUT_FORMAT,
            quality=95,  # High quality for output
            optimize=True  # Optimize file size
        )
        
        logger.info(f"Image saved successfully: {filename}")
        return file_path
    
    except Exception as e:
        logger.error(f"Failed to save image: {str(e)}")
        raise IOError(f"Could not save image: {str(e)}")

# --- ENDPOINTS ---

@router.get("")
async def get_assets() -> List[Dict]:
    """
    Retrieve all uploaded assets.
    
    Returns:
        List of asset objects with metadata
    """
    try:
        assets = []
        
        if UPLOADS_DIR.exists():
            for file_path in sorted(UPLOADS_DIR.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True):
                if file_path.is_file() and file_path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.gif']:
                    assets.append({
                        "id": file_path.stem,
                        "filename": file_path.name,
                        "url": f"/static/uploads/{file_path.name}",
                        "src": f"/static/uploads/{file_path.name}",
                        "size": file_path.stat().st_size
                    })
        
        logger.info(f"Retrieved {len(assets)} assets")
        return assets
    
    except Exception as e:
        logger.error(f"Error retrieving assets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve assets")


@router.post("/upload-original")
async def upload_original(file: UploadFile = File(...)) -> Dict:
    """
    Upload an original image without any processing.
    
    Process:
    1. Validate the uploaded file
    2. Read file content
    3. Save as-is (or convert to PNG if needed)
    4. Return asset metadata
    
    Returns:
        JSON response with asset metadata
    """
    original_filename = file.filename
    file_content = None
    
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file
        validate_image_file(file.content_type, file_size)
        
        logger.info(f"Uploading original (no processing): {original_filename} ({file_size} bytes)")
        
        # Just save the image as-is
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if needed to ensure compatibility
        if image.mode not in ['RGB', 'RGBA']:
            image = image.convert('RGB')
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}.{OUTPUT_FORMAT.lower()}"
        
        # Save original image
        file_path = save_processed_image(image, unique_filename)
        
        # Get file size after saving
        saved_size = file_path.stat().st_size
        
        response_data = {
            "id": str(uuid.uuid4()),
            "url": f"/static/uploads/{unique_filename}",
            "src": f"/static/uploads/{unique_filename}",
            "filename": unique_filename,
            "original_name": original_filename,
            "size": saved_size,
            "message": "Original image uploaded successfully (no processing)"
        }
        
        logger.info(f"Original upload successful: {original_filename} -> {unique_filename}")
        return response_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Original upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload original: {str(e)}")


@router.post("/upload")
async def upload_asset(file: UploadFile = File(...)) -> Dict:
    """
    Upload an image asset with background removal.
    
    Process:
    1. Validate the uploaded file
    2. Read file content
    3. Remove background using rembg
    4. Save as PNG to static/uploads/
    5. Return asset metadata
    
    Args:
        file: Image file to upload
        
    Returns:
        JSON response with:
        - id: Unique asset ID
        - url: Full path URL to the asset
        - src: Alias for url
        - filename: Generated filename
        - original_name: Original filename
        - size: File size in bytes
        - message: Success message
        
    Raises:
        HTTPException: For invalid files, oversized files, or processing errors
    """
    
    original_filename = file.filename
    file_content = None
    
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file
        validate_image_file(file.content_type, file_size)
        
        logger.info(f"Processing upload: {original_filename} ({file_size} bytes)")
        
        # Remove background from image
        processed_image = remove_background_from_image(file_content)
        
        # Generate unique filename (always PNG output)
        unique_filename = f"{uuid.uuid4()}.{OUTPUT_FORMAT.lower()}"
        
        # Save processed image
        file_path = save_processed_image(processed_image, unique_filename)
        
        # Get file size after processing
        processed_size = file_path.stat().st_size
        
        response_data = {
            "id": str(uuid.uuid4()),
            "url": f"/static/uploads/{unique_filename}",
            "src": f"/static/uploads/{unique_filename}",
            "filename": unique_filename,
            "original_name": original_filename,
            "size": processed_size,
            "message": "Asset uploaded and processed successfully with background removal"
        }
        
        logger.info(f"Upload successful: {original_filename} -> {unique_filename}")
        return response_data
    
    except HTTPException:
        raise
    
    except ValueError as e:
        logger.error(f"Image processing error: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Image processing failed: {str(e)}"
        )
    
    except IOError as e:
        logger.error(f"File save error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save processed image: {str(e)}"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.delete("/{filename}")
async def delete_asset(filename: str) -> Dict:
    """
    Delete an uploaded asset.
    
    Args:
        filename: Name of the file to delete
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If file not found or deletion fails
    """
    try:
        file_path = UPLOADS_DIR / filename
        
        # Security: Prevent directory traversal
        if not file_path.resolve().is_relative_to(UPLOADS_DIR.resolve()):
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Delete file
        file_path.unlink()
        logger.info(f"Deleted asset: {filename}")
        
        return {"message": f"Asset {filename} deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting asset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete asset: {str(e)}")


@router.post("/extract-colors")
async def extract_colors(file: UploadFile = File(...)) -> Dict:
    """
    Extract dominant colors from uploaded image using quantization.
    
    Returns top 5 dominant colors as hex codes.
    """
    try:
        file_bytes = await file.read()
        
        # Open image
        img = Image.open(io.BytesIO(file_bytes))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize for faster processing but keep proportions
        img.thumbnail((150, 150))
        
        # Use PIL's quantize to reduce to 16 colors, then sample top colors
        img_quantized = img.quantize(colors=16)
        
        # Get the palette (dominant colors from quantization)
        palette = img_quantized.palette.getdata()[1]
        
        # Group palette into RGB tuples and calculate frequency
        color_freq = {}
        for i in range(0, len(palette), 3):
            rgb = tuple(palette[i:i+3])
            # Count pixels with this color index
            quantized_data = list(img_quantized.getdata())
            color_index = i // 3
            freq = quantized_data.count(color_index)
            color_freq[rgb] = freq
        
        # Get top 5 most frequent colors
        top_colors = sorted(color_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Convert to hex and filter out very light/dark grays
        hex_colors = []
        for rgb, _ in top_colors:
            r, g, b = rgb[0], rgb[1], rgb[2]
            
            # Skip if too close to white or black (unless it's the only option)
            is_white = r > 240 and g > 240 and b > 240
            is_black = r < 15 and g < 15 and b < 15
            is_gray = abs(r - g) < 10 and abs(g - b) < 10 and abs(r - b) < 10
            
            if not (is_white or (is_black and len(hex_colors) > 1) or (is_gray and len(hex_colors) > 2)):
                hex_color = '#{:02x}{:02x}{:02x}'.format(r, g, b)
                hex_colors.append(hex_color)
        
        # Ensure we have at least 5 colors, pad with defaults if needed
        default_colors = ["#000000", "#FFFFFF", "#FF6B6B", "#4ECDC4", "#45B7D1"]
        while len(hex_colors) < 5:
            hex_colors.append(default_colors[len(hex_colors)])
        
        logger.info(f"Extracted {len(hex_colors)} colors from image")
        
        return {
            "status": "success",
            "colors": hex_colors[:5],
            "count": len(hex_colors)
        }
    
    except Exception as e:
        logger.error(f"Color extraction error: {str(e)}")
        return {
            "status": "error",
            "colors": ["#000000", "#FFFFFF", "#FF6B6B", "#4ECDC4", "#45B7D1"],
            "message": "Using default palette"
        }


@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)) -> Dict:
    """
    Remove background from uploaded image using rembg.
    
    Returns URL to processed image with transparent background.
    """
    try:
        # Validate file
        file_bytes = await file.read()
        file_size = len(file_bytes)
        content_type = file.content_type or "image/jpeg"
        
        validate_image_file(content_type, file_size)
        
        logger.info(f"Processing background removal for: {file.filename}")
        
        # Remove background
        processed_image = remove_background_from_image(file_bytes)
        
        # Save processed image
        file_stem = Path(file.filename).stem
        processed_filename = f"{file_stem}_no_bg_{uuid.uuid4().hex[:8]}.png"
        saved_path = save_processed_image(processed_image, processed_filename)
        
        # Return relative URL
        relative_url = f"/static/uploads/{processed_filename}"
        
        logger.info(f"Background removed successfully: {relative_url}")
        
        return {
            "status": "success",
            "url": relative_url,
            "filename": processed_filename,
            "original": file.filename
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Background removal error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")


@router.get("/health")
async def health_check() -> Dict:
    """Health check endpoint for assets router."""
    return {
        "status": "healthy",
        "uploads_dir": str(UPLOADS_DIR),
        "writable": os.access(UPLOADS_DIR, os.W_OK)
    }
