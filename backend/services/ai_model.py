"""
AI Model Service Module

This module contains AI model logic for InstaGen, including:
- Color palette generation
- Layout optimization
- Image processing
"""

from PIL import Image
import io
from typing import List, Tuple

class ColorPaletteGenerator:
    """Generate color palettes using AI models."""
    
    @staticmethod
    def generate_from_image(image_data: bytes) -> List[str]:
        """
        Generate a color palette from an uploaded image.
        
        Args:
            image_data: Image bytes
            
        Returns:
            List of hex color codes
        """
        try:
            img = Image.open(io.BytesIO(image_data))
            # Resize for faster processing
            img.thumbnail((100, 100))
            
            # Get dominant colors (simple version)
            colors = ColorPaletteGenerator._extract_dominant_colors(img, 5)
            return colors
        except Exception as e:
            raise Exception(f"Error processing image: {str(e)}")
    
    @staticmethod
    def _extract_dominant_colors(image: Image.Image, num_colors: int = 5) -> List[str]:
        """
        Extract dominant colors from an image.
        
        Args:
            image: PIL Image object
            num_colors: Number of dominant colors to extract
            
        Returns:
            List of hex color codes
        """
        # Convert image to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize for performance
        image = image.resize((50, 50))
        pixels = list(image.getdata())
        
        # Simple color clustering (will be enhanced with torch/ML)
        hex_colors = []
        color_set = set()
        
        for pixel in pixels:
            if isinstance(pixel, tuple) and len(pixel) >= 3:
                hex_color = '#{:02x}{:02x}{:02x}'.format(pixel[0], pixel[1], pixel[2])
                color_set.add(hex_color)
            
            if len(color_set) >= num_colors:
                break
        
        return list(color_set)[:num_colors]

class LayoutOptimizer:
    """Optimize layouts using AI."""
    
    @staticmethod
    def suggest_layout(image_dimensions: Tuple[int, int], content_type: str) -> dict:
        """
        Suggest an optimized layout based on image dimensions and content type.
        
        Args:
            image_dimensions: (width, height)
            content_type: Type of content (e.g., 'post', 'story', 'carousel')
            
        Returns:
            Layout configuration dictionary
        """
        layouts = {
            'post': {
                'grid_columns': 1,
                'aspect_ratio': '1:1',
                'recommended_size': (1080, 1080)
            },
            'story': {
                'grid_columns': 1,
                'aspect_ratio': '9:16',
                'recommended_size': (1080, 1920)
            },
            'carousel': {
                'grid_columns': 3,
                'aspect_ratio': '1:1',
                'recommended_size': (1080, 1080)
            }
        }
        
        return layouts.get(content_type, layouts['post'])

class ImageProcessor:
    """Process and manipulate images."""
    
    @staticmethod
    def resize_image(image_data: bytes, width: int, height: int) -> bytes:
        """
        Resize an image to specified dimensions.
        
        Args:
            image_data: Image bytes
            width: Target width
            height: Target height
            
        Returns:
            Resized image bytes
        """
        try:
            img = Image.open(io.BytesIO(image_data))
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            img.save(output, format='PNG')
            return output.getvalue()
        except Exception as e:
            raise Exception(f"Error resizing image: {str(e)}")
    
    @staticmethod
    def apply_filter(image_data: bytes, filter_type: str) -> bytes:
        """
        Apply a filter to an image.
        
        Args:
            image_data: Image bytes
            filter_type: Type of filter to apply
            
        Returns:
            Filtered image bytes
        """
        try:
            img = Image.open(io.BytesIO(image_data))
            
            # Apply basic filters (can be extended with torch)
            if filter_type == 'grayscale':
                img = img.convert('L')
            elif filter_type == 'blur':
                from PIL import ImageFilter
                img = img.filter(ImageFilter.BLUR)
            
            output = io.BytesIO()
            img.save(output, format='PNG')
            return output.getvalue()
        except Exception as e:
            raise Exception(f"Error applying filter: {str(e)}")
