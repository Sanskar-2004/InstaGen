from typing import Optional
"""Generative AI service for background generation and compositing.

This module supports generating a background using Stable Diffusion via
`diffusers` when available. If ML libraries are not installed, it falls back
to a lightweight placeholder generator so the `/api/generate-bg` endpoint
remains functional for development and testing.

Public API:
- `generate_composite_background(prompt: str, product_image_bytes: bytes) -> bytes`
    Returns PNG bytes of the composited image.
"""

from typing import Tuple
import io
import uuid
from PIL import Image, ImageFilter, ImageDraw

try:
    from diffusers import AutoPipelineForText2Image
    import torch
except Exception:
    AutoPipelineForText2Image = None
    torch = None


# Preferred background size (close to 9:16)
TARGET_WIDTH = 768
TARGET_HEIGHT = 1344


def _placeholder_background(prompt: str, size: Tuple[int, int]) -> Image.Image:
    """Create a simple placeholder background influenced by the prompt.

    The placeholder generates a soft gradient and a subtle pattern based on
    the prompt hash so results vary by prompt but don't require ML.
    """
    width, height = size
    h = abs(hash(prompt))
    r = 120 + (h % 80)
    g = 100 + ((h >> 8) % 80)
    b = 140 + ((h >> 16) % 80)

    base = Image.new("RGB", (width, height), (r, g, b))

    gradient = Image.new("L", (1, height))
    for y in range(height):
        gradient.putpixel((0, y), int(255 * (y / height)))
    alpha = gradient.resize((width, height))

    overlay = Image.new("RGB", (width, height), (255, 255, 255))
    bg = Image.composite(overlay, base, alpha)

    draw = ImageDraw.Draw(bg)
    for i in range(0, width, max(40, width // 20)):
        draw.line([(i, 0), (i, height)], fill=(255, 255, 255, 10))

    bg = bg.filter(ImageFilter.GaussianBlur(radius=6))
    return bg


class SDXLService:
    """Thin wrapper for a diffusers text->image pipeline.

    Note: initialization downloads the model and can be slow. This class is
    only used when `diffusers` and `torch` are installed and available.
    """

    MODEL_ID = "stabilityai/sdxl-turbo"

    def __init__(self, device: str | None = None):
        if AutoPipelineForText2Image is None or torch is None:
            raise RuntimeError("diffusers/torch not installed")

        if device is None:
            if torch.cuda.is_available():
                device = "cuda"
            else:
                try:
                    if torch.backends.mps.is_available():
                        device = "mps"
                    else:
                        device = "cpu"
                except Exception:
                    device = "cpu"

        self.device = device
        torch_dtype = torch.float16 if device in ("cuda", "mps") else torch.float32

        self.pipe = AutoPipelineForText2Image.from_pretrained(self.MODEL_ID, torch_dtype=torch_dtype)
        try:
            self.pipe.to(self.device)
        except Exception:
            self.pipe.to("cpu")
            self.device = "cpu"

        try:
            self.pipe.enable_attention_slicing()
        except Exception:
            pass

    def generate(self, prompt: str, width: int = TARGET_WIDTH, height: int = TARGET_HEIGHT, steps: int = 28) -> Image.Image:
        if not prompt or prompt.strip() == "":
            raise ValueError("Prompt required")

        if self.device == "cuda":
            with torch.autocast("cuda"):
                out = self.pipe(prompt, width=width, height=height, num_inference_steps=steps)
        else:
            out = self.pipe(prompt, width=width, height=height, num_inference_steps=steps)

        img = out.images[0]
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        return img


def generate_composite_background(prompt: str, product_image_bytes: bytes) -> bytes:
    """Generate a background (SDXL when available) and composite the product centered.

    Returns PNG bytes of the composited image.
    """
    size = (TARGET_WIDTH, TARGET_HEIGHT)

    # 1) Generate background image (SDXL if available, otherwise placeholder)
    bg_img: Image.Image
    if AutoPipelineForText2Image is not None and torch is not None:
        try:
            svc = SDXLService()
            bg_img = svc.generate(prompt, width=size[0], height=size[1])
        except Exception:
            bg_img = _placeholder_background(prompt, size)
    else:
        bg_img = _placeholder_background(prompt, size)

    if bg_img.mode != "RGBA":
        bg_img = bg_img.convert("RGBA")

    # 2) Load product image and ensure RGBA
    product = Image.open(io.BytesIO(product_image_bytes)).convert("RGBA")

    # 3) Scale product to fit within the background box (max 60% of bg dims)
    max_w = int(size[0] * 0.6)
    max_h = int(size[1] * 0.6)
    pw, ph = product.size
    scale = min(1.0, max_w / pw, max_h / ph)
    if scale < 1.0:
        product = product.resize((int(pw * scale), int(ph * scale)), resample=Image.LANCZOS)

    # 4) Composite product centered on background
    bg_copy = bg_img.copy()
    bx, by = bg_copy.size
    px, py = product.size
    paste_x = (bx - px) // 2
    paste_y = (by - py) // 2
    bg_copy.paste(product, (paste_x, paste_y), product)

    # 5) Return PNG bytes
    out = io.BytesIO()
    bg_copy.save(out, format="PNG")
    out.seek(0)
    return out.read()


def generate_background(prompt: str, file_id: str) -> str:
    """Generate a background from a prompt and composite the product image.

    This function is compatible with the assets router which stores products
    in PROCESSED_ASSETS_DIR.

    Args:
        prompt: Text prompt for background generation
        file_id: Filename (e.g., 'uuid.png') of the product in PROCESSED_ASSETS_DIR

    Returns:
        Relative URL path to the saved composited image (e.g., '/uploads/processed/uuid.png')
    """
    try:
        from services.image_processing import PROCESSED_ASSETS_DIR
        from pathlib import Path

        # Resolve product file path
        product_path = Path(PROCESSED_ASSETS_DIR) / file_id
        if not product_path.exists():
            raise FileNotFoundError(f"Product asset not found: {file_id}")

        # Read product image
        with open(product_path, "rb") as f:
            product_bytes = f.read()

        # Generate composite
        composite_bytes = generate_composite_background(prompt, product_bytes)

        # Save composite to processed directory
        composite_id = str(uuid.uuid4())
        composite_filename = f"{composite_id}.png"
        composite_path = Path(PROCESSED_ASSETS_DIR) / composite_filename

        with open(composite_path, "wb") as f:
            f.write(composite_bytes)

        # Return relative URL
        return f"/uploads/processed/{composite_filename}"

    except Exception as e:
        raise Exception(f"Error generating background: {str(e)}")
