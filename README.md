# InstaGen

A full-stack Instagram content creation tool with a FastAPI backend and React frontend. Create professional product shots with AI-powered background generation, compliance checking, and export optimization.

## Project Structure

```
InstaGen/
├── backend/                  # FastAPI Python backend
│   ├── main.py              # FastAPI app entry point
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic (image processing, generative AI, compliance)
│   ├── database.py          # SQLite initialization
│   ├── requirements.txt      # Python dependencies
│   └── venv/                # Python virtual environment
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components (CanvasEditor, Sidebar, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── start_app.bat            # Windows startup script
├── start_app.sh             # Mac/Linux startup script
└── README.md                # This file
```

## Quick Start

### Prerequisites

- **Python 3.12+** (64-bit) with pip
- **Node.js 18+** with npm
- **Git** (optional)

### Windows

1. **Run the startup script:**
   ```bash
   start_app.bat
   ```
   This will open two terminal windows:
   - Backend running on `http://localhost:8000`
   - Frontend running on `http://localhost:3000`

2. **Manual startup** (if preferred):
   ```bash
   # Terminal 1: Backend
   cd backend
   venv\Scripts\activate
   python -m uvicorn main:app --reload

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

### Mac/Linux

1. **Run the startup script:**
   ```bash
   chmod +x start_app.sh
   ./start_app.sh
   ```

2. **Manual startup** (if preferred):
   ```bash
   # Terminal 1: Backend
   cd backend
   source venv/bin/activate
   python -m uvicorn main:app --reload

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Backend Setup (First Time)

If the backend hasn't been set up yet:

```bash
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Create virtual environment (Mac/Linux)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Frontend Setup (First Time)

If the frontend dependencies haven't been installed:

```bash
cd frontend
npm install
```

## Features

### Backend (FastAPI)
- **Image Processing**: Background removal, optimization, format conversion
- **Generative AI**: SDXL Turbo background generation with product compositing
- **Compliance Checking**: Ad copy validation against retail regulations
- **Export Optimization**: Automatic image compression for <500KB file sizes
- **RESTful API**: Full CORS support for frontend communication

### Frontend (React + Vite)
- **Canvas Editor**: Fabric.js-powered 9:16 canvas with safe zones
- **Constraint-Aware Design**: Locked value tiles, safe zones, snap-back constraints
- **Real-time Validation**: Headline compliance checking with visual feedback
- **Alcohol Mode**: Automatic Drinkaware logo injection for alcoholic products
- **Asset Management**: Upload, remove background, and manage product images
- **Export Pipeline**: Download optimized images with compliance validation

## API Endpoints

### Assets
- `POST /assets/upload-asset` - Upload and process image
- `POST /assets/remove-background` - Remove background from image
- `POST /assets/generate-bg` - Generate background and composite product
- `GET /assets/uploaded/{file_id}` - Retrieve processed asset
- `GET /assets/list` - List all uploaded assets
- `DELETE /assets/delete/{file_id}` - Delete an asset

### Compliance
- `POST /check-text` - Validate ad copy for compliance

### Export
- `POST /export/export-final` - Optimize and export image

### Other
- `GET /health` - Health check endpoint

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate  # Mac/Linux
# or venv\Scripts\activate  # Windows
python -m uvicorn main:app --reload
```

The `--reload` flag enables hot-reload on file changes.

### Frontend Development
```bash
cd frontend
npm run dev
```

The Vite dev server provides instant HMR (Hot Module Replacement).

## Configuration

### Backend
- Database: SQLite (`database.db`)
- Uploads folder: `backend/uploads/`
- Processed assets: `backend/uploads/processed/`
- Port: `8000` (default)

### Frontend
- Port: `3000` (default, managed by Vite)
- Proxy to backend: `/api/*` → `http://localhost:8000/*`

## Technologies

### Backend
- **FastAPI** - Modern async web framework
- **Uvicorn** - ASGI server
- **Pillow** - Image processing
- **Diffusers** - SDXL text-to-image (optional, fallback placeholder available)
- **SQLite** - Lightweight database

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Fabric.js** - Canvas manipulation
- **Axios** - HTTP client

## Troubleshooting

### Backend won't start
- Ensure Python 3.12+ is installed and in PATH
- Check that `venv` is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check that port 3000 is not in use

### API calls failing
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify frontend proxy config in `vite.config.js`

## License

© 2025 InstaGen. All rights reserved.
