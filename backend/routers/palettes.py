from fastapi import APIRouter, HTTPException, Depends
from typing import List
from database import get_db_connection
import json

router = APIRouter(prefix="/palettes", tags=["palettes"])

@router.get("/")
def get_palettes(user_id: int):
    """Get all color palettes for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM color_palettes WHERE user_id = ?", (user_id,))
    palettes = cursor.fetchall()
    conn.close()
    return [dict(p) for p in palettes]

@router.post("/")
def create_palette(user_id: int, palette_name: str, colors: List[str]):
    """Create a new color palette."""
    conn = get_db_connection()
    cursor = conn.cursor()
    colors_json = json.dumps(colors)
    
    try:
        cursor.execute(
            "INSERT INTO color_palettes (user_id, palette_name, colors) VALUES (?, ?, ?)",
            (user_id, palette_name, colors_json)
        )
        conn.commit()
        palette_id = cursor.lastrowid
        conn.close()
        return {"id": palette_id, "message": "Palette created successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{palette_id}")
def delete_palette(palette_id: int):
    """Delete a color palette."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM color_palettes WHERE id = ?", (palette_id,))
        conn.commit()
        conn.close()
        return {"message": "Palette deleted successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))
