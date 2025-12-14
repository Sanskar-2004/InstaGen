"""
Export router for final design export and optimization.

This module provides endpoints for exporting optimized designs for download.
"""

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from PIL import Image
import io

from services.image_processing import ImageOptimizer

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/export-final")
async def export_final(file: UploadFile = File(...)):
    """
    Export and optimize a design file for download.

    This endpoint accepts an uploaded image file, optimizes it using the
    optimize_for_retail function (compresses to < 500KB), and returns it
    as a downloadable JPEG file.

    Args:
        file: Image file to export and optimize

    Returns:
        StreamingResponse with optimized JPEG image (< 500KB) as attachment
    """
    try:
        # Validate file is an image
        if not file.content_type.startswith("image/"):
            raise ValueError("File must be an image")

        # Read uploaded file bytes
        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise ValueError("Uploaded file is empty")

        # Open as PIL Image
        image = Image.open(io.BytesIO(file_bytes))

        # Pass to optimize_for_retail function
        optimized_buffer = ImageOptimizer.optimize_for_retail(image)

        # Reset buffer position to beginning for streaming
        optimized_buffer.seek(0)

        # Return as StreamingResponse with proper headers
        return StreamingResponse(
            iter([optimized_buffer.getvalue()]),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": "attachment; filename=instagen_export.jpg"
            }
        )

    except ValueError as e:
        raise ValueError(f"Validation error: {str(e)}")
    except Exception as e:
        raise Exception(f"Error exporting file: {str(e)}")
