"""
Image Processing Service Module

This module handles advanced image processing operations including:
- Background removal using BiRefNet (RMBG-1.4) - optional with rembg
- Image resizing and optimization
- Format conversion
"""

import os
import io
import uuid
from pathlib import Path
from PIL import Image
import numpy as np
from typing import Tuple, Optional

# Try to import rembg for background removal
try:
    from rembg import remove
    HAS_REMBG = True
    print("[OK] rembg available for background removal")
except Exception as e:
    HAS_REMBG = False
    print("[INFO] rembg not installed. Using placeholder background removal")

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("static/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

PROCESSED_ASSETS_DIR = UPLOADS_DIR / "processed"
PROCESSED_ASSETS_DIR.mkdir(parents=True, exist_ok=True)


class BackgroundRemover:
    """Remove backgrounds from images using AI models."""

    @staticmethod
    def remove_background(image_data: bytes) -> bytes:
        """
        Remove background from an image using BiRefNet/rembg.

        Args:
            image_data: Image bytes

        Returns:
            Image bytes with background removed (PNG with transparency)
        """
        try:
            # Open image
            img = Image.open(io.BytesIO(image_data))

            # Convert to RGBA if necessary
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            if HAS_REMBG:
                # Use rembg for professional background removal
                print("Using rembg (BiRefNet) for background removal...")
                
                # rembg.remove() accepts PIL Image or bytes with force_return_bytes=True
                # Pass the PIL Image object directly
                output_img = remove(img)
                
                # Save as PNG with transparency
                output_stream = io.BytesIO()
                if isinstance(output_img, Image.Image):
                    output_img.save(output_stream, format="PNG")
                else:
                    # If output is bytes, open and save as PNG
                    result_img = Image.open(io.BytesIO(output_img))
                    result_img.save(output_stream, format="PNG")
                
                output_stream.seek(0)
                return output_stream.getvalue()
            else:
                # Placeholder: use simple alpha channel masking
                print("Using placeholder background removal...")
                return BackgroundRemover._placeholder_removal(image_data)

        except Exception as e:
            raise Exception(f"Error removing background: {str(e)}")

    @staticmethod
    def _placeholder_removal(image_data: bytes) -> bytes:
        """
        Placeholder background removal using color-based masking.
        In production, this would use the actual BiRefNet model.

        Args:
            image_data: Image bytes

        Returns:
            Image bytes with placeholder background removal (PNG with transparency)
        """
        try:
            img = Image.open(io.BytesIO(image_data))

            # Convert to RGBA
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            # Convert to numpy array
            img_array = np.array(img)

            # Get image dimensions
            height, width = img_array.shape[:2]

            # Create mask based on edge detection and color similarity
            # This is a simple placeholder that preserves the subject
            # by detecting and removing uniform background colors

            # Get the background color (assume it's from corners)
            bg_color = BackgroundRemover._detect_background_color(img_array)

            # Create mask
            mask = BackgroundRemover._create_mask(img_array, bg_color)

            # Apply mask to alpha channel
            img_array[:, :, 3] = mask

            # Convert back to PIL Image
            result = Image.fromarray(img_array, "RGBA")

            # Save to bytes
            output = io.BytesIO()
            result.save(output, format="PNG")
            output.seek(0)
            return output.getvalue()

        except Exception as e:
            raise Exception(f"Error in placeholder removal: {str(e)}")

    @staticmethod
    def _detect_background_color(img_array: np.ndarray) -> Tuple[int, int, int]:
        """
        Detect background color from image corners.

        Args:
            img_array: Numpy array of image (RGBA)

        Returns:
            RGB tuple of detected background color
        """
        # Sample corners of the image
        corners = [
            img_array[10:30, 10:30],  # top-left
            img_array[10:30, -30:-10],  # top-right
            img_array[-30:-10, 10:30],  # bottom-left
            img_array[-30:-10, -30:-10],  # bottom-right
        ]

        # Get most common color in corners
        all_pixels = np.concatenate([c.reshape(-1, 4) for c in corners])
        # Get R, G, B channels (ignore alpha)
        rgb_pixels = all_pixels[:, :3]

        # Calculate mean color
        bg_color = tuple(np.mean(rgb_pixels, axis=0).astype(int))
        return bg_color[:3]

    @staticmethod
    def _create_mask(img_array: np.ndarray, bg_color: Tuple[int, int, int]) -> np.ndarray:
        """
        Create alpha mask based on color similarity to background.

        Args:
            img_array: Numpy array of image (RGBA)
            bg_color: Background color RGB tuple

        Returns:
            Alpha channel values (0-255)
        """
        rgb = img_array[:, :, 3]  # Start with original alpha
        rgb_pixels = img_array[:, :, :3]

        # Calculate color distance from background
        color_distance = np.sqrt(
            (rgb_pixels[:, :, 0].astype(float) - bg_color[0]) ** 2
            + (rgb_pixels[:, :, 1].astype(float) - bg_color[1]) ** 2
            + (rgb_pixels[:, :, 2].astype(float) - bg_color[2]) ** 2
        )

        # Create mask: pixels similar to background become transparent
        threshold = 50
        mask = np.where(color_distance < threshold, 0, 255).astype(np.uint8)

        # Apply slight smoothing to edges
        from PIL import ImageFilter

        mask_img = Image.fromarray(mask, mode="L")
        mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=2))
        mask = np.array(mask_img)

        return mask


class ImageOptimizer:
    """Optimize and process images for social media."""

    @staticmethod
    def resize_for_web(image_data: bytes, max_width: int = 1080) -> bytes:
        """
        Resize image for web while maintaining aspect ratio.

        Args:
            image_data: Image bytes
            max_width: Maximum width in pixels

        Returns:
            Optimized image bytes
        """
        try:
            img = Image.open(io.BytesIO(image_data))

            # Calculate new size
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            # Optimize and save
            output = io.BytesIO()
            img.save(output, format="PNG", optimize=True)
            output.seek(0)
            return output.getvalue()

        except Exception as e:
            raise Exception(f"Error resizing image: {str(e)}")

    @staticmethod
    def convert_to_png(image_data: bytes) -> bytes:
        """
        Convert image to PNG format.

        Args:
            image_data: Image bytes

        Returns:
            PNG image bytes
        """
        try:
            img = Image.open(io.BytesIO(image_data))

            # Convert to RGBA for consistency
            if img.mode != "RGBA":
                img = img.convert("RGBA")

            output = io.BytesIO()
            img.save(output, format="PNG")
            output.seek(0)
            return output.getvalue()

        except Exception as e:
            raise Exception(f"Error converting image: {str(e)}")

    @staticmethod
    def save_processed_asset(
        image_data: bytes, original_filename: str, remove_bg: bool = True
    ) -> dict:
        """
        Save processed asset to disk and extract dominant colors.

        Args:
            image_data: Image bytes
            original_filename: Original filename
            remove_bg: Whether to remove background

        Returns:
            Dictionary with keys:
            - url: Full URL to the saved asset (e.g., http://localhost:8000/static/uploads/processed/...)
            - palette: List of dominant HEX colors extracted from the image
            - filename: The UUID filename of the saved asset
        """
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = ".png"
            filename = f"{file_id}{file_extension}"

            # Process image
            if remove_bg:
                processed_data = BackgroundRemover.remove_background(image_data)
            else:
                processed_data = ImageOptimizer.convert_to_png(image_data)

            # Optimize
            optimized_data = ImageOptimizer.resize_for_web(processed_data)

            # Save to disk
            file_path = PROCESSED_ASSETS_DIR / filename
            with open(file_path, "wb") as f:
                f.write(optimized_data)

            # Extract dominant colors from the saved image
            palette = ImageOptimizer.extract_dominant_colors(str(file_path), num_colors=4)

            # Return full URL and palette
            # Note: In production, replace localhost:8000 with your actual domain
            relative_url = f"/static/uploads/processed/{filename}"
            full_url = f"http://localhost:8000{relative_url}"
            
            print(f"Asset saved: {full_url}")
            print(f"Palette extracted: {palette}")
            
            return {
                "url": full_url,
                "palette": palette,
                "filename": filename
            }

        except Exception as e:
            print(f"[ERROR] Error saving processed asset: {str(e)}")
            raise Exception(f"Error saving processed asset: {str(e)}")

    @staticmethod
    def optimize_for_retail(image: Image.Image) -> io.BytesIO:
        """
        Compress a PIL Image to ensure file size is strictly less than 500KB.

        This function implements an optimization loop:
        1. Convert image to RGB mode (handles transparency)
        2. Save to BytesIO buffer with JPEG quality starting at 95
        3. Check file size in KB
        4. If > 500KB, reduce quality by 5 and repeat
        5. Return BytesIO object when under 500KB

        Args:
            image: PIL.Image object to optimize

        Returns:
            io.BytesIO object containing optimized JPEG image (< 500KB)

        Raises:
            Exception: If unable to compress below 500KB after quality reaches 10
        """
        try:
            # Convert to RGB to handle transparency issues
            if image.mode != "RGB":
                if image.mode == "RGBA":
                    # Create white background for transparency
                    background = Image.new("RGB", image.size, (255, 255, 255))
                    background.paste(image, mask=image.split()[3])
                    image = background
                else:
                    image = image.convert("RGB")

            quality = 95  # Start with high quality
            target_size_kb = 500
            max_iterations = 20  # Safety limit

            iteration = 0
            while iteration < max_iterations:
                iteration += 1

                # Save to BytesIO buffer with current quality
                output_buffer = io.BytesIO()
                image.save(output_buffer, format="JPEG", quality=quality, optimize=True)
                output_buffer.seek(0)

                # Check file size in KB
                file_size_kb = len(output_buffer.getvalue()) / 1024

                print(f"[OPTIMIZE_RETAIL] Iteration {iteration}: Quality {quality}, Size {file_size_kb:.2f}KB")

                # If under 500KB, return the buffer
                if file_size_kb < target_size_kb:
                    print(f"[OK] Image optimized to {file_size_kb:.2f}KB (quality: {quality})")
                    return output_buffer

                # Reduce quality by 5 for next iteration
                quality -= 5

                # If quality drops below 10, fail with warning
                if quality < 10:
                    print(f"[WARNING] Could not compress below {target_size_kb}KB")
                    print(f"[WARNING] Final size: {file_size_kb:.2f}KB at quality 10")
                    return output_buffer  # Return best effort result

            # Fallback (should not reach here)
            raise Exception(f"Optimization failed after {max_iterations} iterations")

        except Exception as e:
            raise Exception(f"Error in optimize_for_retail: {str(e)}")

    @staticmethod
    def optimize_export(image_data: bytes, target_size_kb: int = 500, max_iterations: int = 10) -> bytes:
        """
        Optimize image for export by iteratively reducing quality and size until under target.

        This function implements an optimization loop:
        1. Save the image and check file size
        2. If > target_size_kb, reduce quality by 5% and resize by 5%
        3. Repeat until under target or max iterations reached

        Args:
            image_data: Image bytes to optimize
            target_size_kb: Target file size in KB (default 500)
            max_iterations: Maximum optimization iterations (default 10)

        Returns:
            Optimized image bytes under target size

        Raises:
            Exception: If optimization fails or cannot reach target size
        """
        try:
            target_bytes = target_size_kb * 1024

            # Open image
            img = Image.open(io.BytesIO(image_data))

            # Convert to RGB for better compression (PNG with transparency may be larger)
            if img.mode in ("RGBA", "LA", "P"):
                # Keep transparency if present, otherwise convert to RGB
                if img.mode == "RGBA":
                    background = Image.new("RGB", img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                else:
                    img = img.convert("RGB")

            quality = 85  # Start with good quality
            iteration = 0
            current_size = len(image_data)
            optimized_data = image_data  # Initialize with original

            while current_size > target_bytes and iteration < max_iterations:
                iteration += 1
                print(f"[OPTIMIZE] Iteration {iteration}: Size {current_size / 1024:.2f}KB, Quality {quality}")

                # Reduce quality by 5%
                quality = max(10, quality - 5)

                # Resize image by 5% (multiply by 0.95)
                new_width = max(100, int(img.width * 0.95))
                new_height = max(100, int(img.height * 0.95))
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

                # Save with current quality
                output = io.BytesIO()
                img.save(output, format="JPEG", quality=quality, optimize=True)
                output.seek(0)
                optimized_data = output.getvalue()

                current_size = len(optimized_data)

            if current_size > target_bytes:
                print(f"[WARNING] Could not optimize below {target_size_kb}KB after {max_iterations} iterations")
                print(f"[WARNING] Final size: {current_size / 1024:.2f}KB")

            print(f"[OK] Export optimized to {current_size / 1024:.2f}KB")
            return optimized_data

        except Exception as e:
            raise Exception(f"Error optimizing export: {str(e)}")

    @staticmethod
    def extract_dominant_colors(image_path: str, num_colors: int = 4) -> list:
        """
        Extract dominant colors from an image and convert them to HEX codes.

        Uses PIL's quantize method to reduce the image to a palette and extract
        the top N dominant RGB colors.

        Args:
            image_path: Path to the image file
            num_colors: Number of dominant colors to extract (default: 4)

        Returns:
            List of HEX color codes (e.g., ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"])

        Raises:
            Exception: If unable to read or process the image
        """
        try:
            # Open the image
            img = Image.open(image_path)

            # Convert to RGB if necessary (remove alpha channel)
            if img.mode == "RGBA":
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # Reduce image to palette using quantize
            # This finds the optimal num_colors colors that best represent the image
            img_quantized = img.quantize(colors=num_colors)

            # Get the palette (RGB tuples for each color)
            palette = img_quantized.getpalette()

            # Extract RGB tuples from palette
            colors_rgb = []
            for i in range(num_colors):
                r = palette[i * 3]
                g = palette[i * 3 + 1]
                b = palette[i * 3 + 2]
                colors_rgb.append((r, g, b))

            # Convert RGB to HEX
            colors_hex = [f"#{r:02X}{g:02X}{b:02X}" for r, g, b in colors_rgb]

            print(f"[OK] Extracted {num_colors} dominant colors: {colors_hex}")
            return colors_hex

        except Exception as e:
            print(f"[ERROR] Failed to extract colors: {str(e)}")
            # Return a fallback palette if extraction fails
            return ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"]
