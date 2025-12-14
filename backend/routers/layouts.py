from fastapi import APIRouter, HTTPException, File, UploadFile
from typing import Optional
from database import get_db_connection
import json

router = APIRouter(prefix="/layouts", tags=["layouts"])

@router.get("/")
def get_layouts(user_id: int):
    """Get all draft layouts for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM draft_layouts WHERE user_id = ?", (user_id,))
    layouts = cursor.fetchall()
    conn.close()
    return [dict(l) for l in layouts]

@router.post("/")
def create_layout(user_id: int, layout_name: str, layout_data: dict):
    """Create a new draft layout."""
    conn = get_db_connection()
    cursor = conn.cursor()
    layout_json = json.dumps(layout_data)
    
    try:
        cursor.execute(
            "INSERT INTO draft_layouts (user_id, layout_name, layout_data) VALUES (?, ?, ?)",
            (user_id, layout_name, layout_json)
        )
        conn.commit()
        layout_id = cursor.lastrowid
        conn.close()
        return {"id": layout_id, "message": "Layout created successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{layout_id}")
def update_layout(layout_id: int, layout_data: dict):
    """Update a draft layout."""
    conn = get_db_connection()
    cursor = conn.cursor()
    layout_json = json.dumps(layout_data)
    
    try:
        cursor.execute(
            "UPDATE draft_layouts SET layout_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (layout_json, layout_id)
        )
        conn.commit()
        conn.close()
        return {"message": "Layout updated successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{layout_id}")
def delete_layout(layout_id: int):
    """Delete a draft layout."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM draft_layouts WHERE id = ?", (layout_id,))
        conn.commit()
        conn.close()
        return {"message": "Layout deleted successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))
