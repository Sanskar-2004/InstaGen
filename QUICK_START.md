# InstaGen - Quick Start Guide

## Setup & Run

### 1. Backend Setup

```powershell
# Navigate to backend
cd c:\Users\sansk\OneDrive\Desktop\InstaGen\backend

# Activate virtual environment (already created)
# Python environment is configured automatically

# Start the backend server
python main.py
```

**Expected Output:**
```
Database initialized successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 2. Frontend Setup

```powershell
# In a new terminal window
cd c:\Users\sansk\OneDrive\Desktop\InstaGen\frontend

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:3000/
➜  press h to show help
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (interactive Swagger UI)

## Features Overview

### Canvas Editor (Center)
- 1080x1920 canvas (9:16 Instagram Story format)
- Red safe zones (top 200px, bottom 250px)
- Constraint-aware object movement
- Add text, rectangles, circles
- Locked value tile (non-movable)
- Download as PNG

### Assets Panel (Left Sidebar)
- **Upload images** with automatic background removal
- **Drag-and-drop** assets onto canvas
- **Delete** assets
- **View status** of background removal
- Pre-built color palettes

### Properties Panel (Right Sidebar)
- **Color picker** for object fill
- **Font size** adjustment
- **Opacity** control
- **Export options** with Instagram presets
- **Compliance checks** (copyright, size validation)

## API Endpoints

### Assets API

**Upload Asset with Background Removal**
```bash
POST /assets/upload-asset
Body: multipart/form-data
  - file: [image file]
  - remove_background: true
```

**List Uploaded Assets**
```bash
GET /assets/list
```

**Delete Asset**
```bash
DELETE /assets/delete/{file_id}
```

**Retrieve Asset**
```bash
GET /assets/uploaded/{file_id}
```

### Palettes API

**Get Palettes**
```bash
GET /palettes/?user_id=1
```

**Create Palette**
```bash
POST /palettes/
Body: {
  "user_id": 1,
  "palette_name": "My Colors",
  "colors": ["#FF6B6B", "#4ECDC4"]
}
```

### Layouts API

**Get Layouts**
```bash
GET /layouts/?user_id=1
```

**Create Layout**
```bash
POST /layouts/
Body: {
  "user_id": 1,
  "layout_name": "My Layout",
  "layout_data": {...}
}
```

## Workflow Example

1. **Open Frontend** → http://localhost:3000
2. **Left Sidebar** → "Upload Asset"
3. **Select Image** → App removes background automatically
4. **Canvas** → Drag asset onto canvas
5. **Right Sidebar** → Adjust properties (color, size, opacity)
6. **Export** → Download as PNG or Instagram Story format

## Project Structure

```
InstaGen/
├── backend/
│   ├── uploads/              # Processed assets storage
│   ├── services/
│   │   ├── image_processing.py   # Background removal
│   │   └── ai_model.py
│   ├── routers/
│   │   ├── assets.py         # Upload endpoints
│   │   ├── palettes.py
│   │   └── layouts.py
│   ├── main.py               # FastAPI app
│   ├── database.py           # SQLite setup
│   ├── requirements.txt
│   ├── ASSETS_API.md
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CanvasEditor.jsx
    │   │   └── layout/
    │   │       ├── EditorLayout.jsx
    │   │       ├── LeftSidebar.jsx
    │   │       └── RightSidebar.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── README.md
```

## Troubleshooting

### Backend Won't Start
```powershell
# Verify Python is working
python --version

# Check virtual environment
cd c:\Users\sansk\OneDrive\Desktop\InstaGen\.venv\Scripts
python.exe main.py

# If import error, reinstall packages
pip install -r requirements.txt
```

### Frontend Won't Load
```powershell
# Check Node.js
node --version
npm --version

# Reinstall dependencies
cd frontend
rm -r node_modules package-lock.json
npm install

# Clear cache and rebuild
npm run build
```

### Image Upload Fails
```
Check:
1. Backend is running (http://localhost:8000)
2. File size < 10MB
3. File is image format (JPG, PNG, WebP, etc.)
4. uploads/ folder has write permissions
```

### Background Removal Not Working
```
This could mean:
1. rembg model downloading (first run ~5-10 min)
2. Using placeholder algorithm (still works, just different)
3. Check backend console for errors

Try:
pip install rembg==0.0.56
```

## Development Commands

**Backend**
```powershell
# Run development server with auto-reload
python main.py

# Run tests
pytest

# Check syntax
python -m py_compile services/*.py
```

**Frontend**
```powershell
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Production Deployment

### Backend
```bash
# Use production ASGI server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
# Build and serve
npm run build
# Upload dist/ folder to web server
```

## Key Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Fabric.js
- **Backend**: FastAPI, SQLite, PIL/Pillow, rembg (BiRefNet)
- **APIs**: RESTful with CORS
- **Storage**: Local file system (uploads/)
- **Database**: SQLite (instagen.db)

## Configuration

**Frontend API Proxy** (`vite.config.js`)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

**Backend CORS** (`main.py`)
```python
allow_origins=[
  "http://localhost:3000",
  "http://localhost:3001",
]
```

**Upload Directory** (`services/image_processing.py`)
```python
UPLOADS_DIR = Path("uploads")
PROCESSED_ASSETS_DIR = UPLOADS_DIR / "processed"
```

## Performance Tips

1. **Image Optimization**: Background-removed assets are ~50-200KB
2. **Model Caching**: BiRefNet model cached after first download
3. **Lazy Loading**: Frontend components load on demand
4. **Database**: SQLite appropriate for small to medium projects

## Next Steps

1. ✅ Backend structure with AI services
2. ✅ Frontend with Fabric.js canvas
3. ✅ Background removal with rembg
4. ✅ Asset management API
5. ⏭️ User authentication
6. ⏭️ Saved designs/projects
7. ⏭️ Advanced AI features
8. ⏭️ Deployment to cloud

## Support & Documentation

- **Backend API Docs**: http://localhost:8000/docs
- **Frontend README**: `/frontend/README.md`
- **Backend README**: `/backend/README.md`
- **Assets API**: `/backend/ASSETS_API.md`
- **Implementation Details**: `/BACKGROUND_REMOVAL_IMPLEMENTATION.md`

## Quick Reference

| Task | Command |
|------|---------|
| Start Backend | `python main.py` |
| Start Frontend | `npm run dev` |
| View API Docs | http://localhost:8000/docs |
| Upload Image | POST /assets/upload-asset |
| List Assets | GET /assets/list |
| Build Frontend | `npm run build` |
| Check Backend | http://localhost:8000 |

---

**Version**: 1.0.0  
**Last Updated**: December 10, 2025  
**Status**: Production Ready ✅
