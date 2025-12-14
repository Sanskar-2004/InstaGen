# InstaGen - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Frontend Components](#frontend-components)
5. [Backend Architecture](#backend-architecture)
6. [API Endpoints](#api-endpoints)
7. [Data Flow](#data-flow)
8. [Setup and Installation](#setup-and-installation)
9. [Features](#features)
10. [Code Examples](#code-examples)

---

## Project Overview

**InstaGen** is a professional AI-powered design studio for generating Instagram content. It combines:
- **AI Logo Generation** using Google Gemini 2.0 Flash
- **Canvas Editor** with Fabric.js for design manipulation
- **Background Removal** using rembg technology
- **AI Ad Copy Generator** for marketing text
- **Color Extraction** from uploaded images

### Key Technologies
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + Python 3.11
- **Image Generation**: Google Gemini 2.0 Flash API
- **Image Processing**: PIL, rembg (background removal)
- **Canvas**: Fabric.js
- **HTTP Client**: httpx (async)

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React App (Vite Dev Server)                │  │
│  │  • App.jsx (Main Entry)                                 │  │
│  │  • EditorLayout.jsx (Layout Manager)                    │  │
│  │  • LeftSidebar.jsx (Tools & Assets)                     │  │
│  │  • CanvasEditor.jsx (Drawing Canvas)                    │  │
│  │  • RightSidebar.jsx (Properties)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────────────┘
               │ AXIOS HTTP REQUESTS
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              main.py (FastAPI Server)                    │  │
│  │  • CORS Configuration                                    │  │
│  │  • Static Files Mount                                    │  │
│  │  • Health Check Endpoints                                │  │
│  │  • Proxy Service for Images                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            ROUTERS (API Endpoints)                       │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ ai_generator.py - AI Content Generation            │ │  │
│  │  │ • Logo Generation with Mix & Match Styles          │ │  │
│  │  │ • Ad Copy Generation with Fallbacks                │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ assets.py - File & Image Management               │ │  │
│  │  │ • Upload Original Images                           │ │  │
│  │  │ • Remove Background                                │ │  │
│  │  │ • Extract Colors                                   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────────────┘
               │ EXTERNAL APIs
               ├─► Google Gemini 2.0 Flash (Logo Generation)
               ├─► Pollinations.ai (Image Rendering)
               └─► DiceBear API (Fallback Logos)
```

---

## Project Structure

```
InstaGen/
├── frontend/                          # React Vite Application
│   ├── src/
│   │   ├── App.jsx                   # Main App Component
│   │   ├── main.jsx                  # React Entry Point
│   │   ├── index.css                 # Global Styles & Custom Scrollbar
│   │   ├── components/
│   │   │   ├── CanvasEditor.jsx      # Main Canvas with Fabric.js
│   │   │   └── layout/
│   │   │       ├── EditorLayout.jsx  # Layout Wrapper
│   │   │       ├── LeftSidebar.jsx   # Tools & Asset Manager
│   │   │       └── RightSidebar.jsx  # Properties Panel
│   │   └── assets/                   # Images, SVGs
│   ├── public/                        # Static Assets
│   ├── index.html                     # HTML Entry
│   ├── vite.config.js                 # Vite Configuration
│   ├── tailwind.config.js             # Tailwind CSS Config
│   ├── postcss.config.js              # PostCSS Config
│   └── package.json                   # Dependencies
│
├── backend/                           # FastAPI Application
│   ├── main.py                        # FastAPI Server Entry Point
│   ├── database.py                    # Database Configuration
│   ├── routers/
│   │   ├── ai_generator.py            # AI Generation Logic
│   │   ├── assets.py                  # Asset Management
│   │   ├── compliance_router.py       # Compliance Features
│   │   ├── export.py                  # Export Functionality
│   │   ├── layouts.py                 # Layout Templates
│   │   ├── palettes.py                # Color Palettes
│   │   └── __init__.py
│   ├── services/                      # Business Logic
│   ├── static/
│   │   ├── uploads/                   # User Uploaded Files
│   │   └── generated/                 # Generated Content
│   ├── requirements.txt               # Python Dependencies
│   ├── .env.example                   # Environment Variables Template
│   └── .env                           # Environment Variables
│
├── scripts/
│   └── logo_generator_pro.py          # Standalone Logo Generator Script
│
├── README.md                          # Main README
├── QUICK_START.md                     # Quick Start Guide
├── API_DOCUMENTATION.md               # API Reference
├── setup-ai.bat / setup-ai.sh         # Setup Scripts
├── start-servers.bat / start_app.bat  # Start Scripts
└── start_app.sh                       # Linux Start Script
```

---

## Frontend Components

### 1. **App.jsx** - Main Application Component
**Purpose**: Root component that initializes the application
**Code Structure**:
```javascript
- Imports EditorLayout and CanvasEditor
- Renders EditorLayout wrapper
- Passes CanvasEditor as children
- No state management (clean component)
```

**File**: `frontend/src/App.jsx`

---

### 2. **EditorLayout.jsx** - Layout Manager
**Purpose**: Creates the main 3-panel layout (Left Sidebar | Canvas | Right Sidebar)
**Structure**:
```jsx
- Left Panel: LeftSidebar Component
- Center Panel: Canvas Editor (children)
- Right Panel: RightSidebar Component
- Uses flexbox for responsive layout
```

**Key Features**:
- Responsive design
- Glass-morphism styling
- Shadow effects for depth
- Proper overflow handling

**File**: `frontend/src/components/layout/EditorLayout.jsx`

---

### 3. **LeftSidebar.jsx** - Asset & Tool Manager (536 lines)
**Purpose**: Main control panel for logo generation, ad copy, asset management, and color picking

**State Management**:
```javascript
// Asset Management
- activeTab: 'assets' | 'ai'
- assets: Array<{id, url, type, originalId}>
- isUploading: Boolean
- paletteColors: Array<HexColor>

// Logo Generation
- aiBrandName: String
- selectedStyles: Array<String> (Mix & Match)
- logoLoading: Boolean
- logoError: String
- generatedLogo: {url, originalUrl}
- logoImageData: Base64Data

// Ad Copy Generation
- aiProduct: String
- productDesc: String
- aiTone: 'Professional'
- copyLoading: Boolean
- copyError: String
- generatedCopy: Object
```

**Key Functions**:

1. **handleFileUpload()** - Upload and Process Images
   - Uploads to `/api/assets/upload-original` (original)
   - Uploads to `/api/assets/remove-background` (processed)
   - Extracts colors from image
   - Creates paired assets (original + processed)

2. **generateLogo()** - AI Logo Generation
   - Validates brand name and style selection
   - Sends to `/api/ai/generate-logo` endpoint
   - Handles both single and multiple styles (mix & match)
   - Uses proxy endpoint to convert image to data URL
   - Updates state with generated logo

3. **generateAdCopy()** - Ad Copy Generation
   - Sends product info to `/api/ai/generate-text`
   - Returns headline, body, and CTA

4. **toggleStyle()** - Mix & Match Style Selection
   - Toggles style in selectedStyles array
   - Allows multiple style combinations

5. **handleColorClick()** - Apply Color to Canvas
   - Gets active object on canvas
   - Changes text color or fill color

6. **addImage() / addText()** - Add to Canvas
   - Draggable assets to canvas
   - Fabric.js integration

**UI Sections**:
- **InstaGen Header**: App name and branding
- **Tab Navigation**: Assets vs AI Tools
- **Upload Area**: Drag and drop or click to upload
- **Asset Gallery**: Two-column layout (Original | Processed)
- **Color Palette**: Auto-extracted brand colors
- **Logo Generator**: Brand name input, style mix & match
- **Ad Copy Generator**: Product info inputs

**File**: `frontend/src/components/layout/LeftSidebar.jsx`

---

### 4. **CanvasEditor.jsx** - Drawing Canvas (281 lines)
**Purpose**: Main editing workspace with Fabric.js canvas

**Constants**:
```javascript
CANVAS_WIDTH = 1080
CANVAS_HEIGHT = 1920
SAFE_ZONE_TOP = 200
SAFE_ZONE_BOTTOM_START = 1670
```

**State**:
```javascript
- selectedObject: Fabric Object (active item)
- bgColor: Canvas background color
- zoomLevel: 0.5 to 3.0 (50% to 300%)
```

**Key Functions**:

1. **initSafeZones(canvas)** - Create Protected Areas
   - Top safe zone (200px) for brand logo
   - Bottom safe zone (250px) for CTA
   - Prevents accidental editing of key areas

2. **useEffect Setup** - Canvas Initialization
   - Creates Fabric canvas instance
   - Sets up safe zones
   - Initializes selection handlers
   - Visibility watchdog (maintains canvas size)
   - Cleanup on unmount

3. **Canvas Tools**:
   - **addText()**: Insert text with double-click editing
   - **addRectangle()**: Add rectangle shape
   - **addCircle()**: Add circle shape
   - **deleteSelected()**: Remove selected object (skip safe zones)
   - **clearCanvas()**: Clear all non-safe objects

4. **Zoom Controls**:
   - **zoomIn()**: Increase zoom by 10%
   - **zoomOut()**: Decrease zoom by 10%
   - **resetZoom()**: Reset to 100%

5. **Color Management**:
   - **changeBackgroundColor()**: Change canvas BG
   - **handleColorClick()**: Apply color from palette

**Rendering**:
```jsx
- Toolbar: Add text, shapes, background color, zoom controls
- Canvas Container: 
  - Scrollable area with custom scrollbar
  - Flex centered layout
  - Transform scale for zoom (not CSS zoom property)
  - Drag-and-drop support for images
- Canvas: Fabric.js drawing area (1080x1920)
- Instructions: Semi-transparent floating tips
```

**File**: `frontend/src/components/CanvasEditor.jsx`

---

### 5. **RightSidebar.jsx** - Properties Panel
**Purpose**: Shows properties of selected canvas object
**Features**:
- Object type display
- Position/size editing
- Color picker
- Rotation control
- Alignment options

**File**: `frontend/src/components/layout/RightSidebar.jsx`

---

### 6. **index.css** - Global Styles
**Key Styles**:
- Custom scrollbar styling
- Canvas scrollbar (Gray-400 on Gray-200)
- Global font settings
- Utility classes

**File**: `frontend/src/index.css`

---

## Backend Architecture

### 1. **main.py** - FastAPI Server (228 lines)
**Purpose**: Server entry point, CORS configuration, static files, proxy service

**Key Sections**:

1. **Setup**:
   - Load environment variables from .env
   - Configure logging
   - Setup FastAPI app with metadata

2. **CORS Middleware**:
   ```python
   allow_origins: [
     "http://localhost:3000",
     "http://localhost:5173",  # Vite dev server
     "127.0.0.1:*"
   ]
   ```

3. **Static Files Mount**:
   - Mounts `static/` directory at `/static`
   - Serves uploaded images and generated content

4. **Router Inclusion**:
   - Includes assets router
   - Includes ai_generator router

5. **Root Endpoint** (`GET /`):
   - Returns API information
   - Lists available endpoints

6. **Health Check** (`GET /health`):
   - Checks static files writability
   - Checks Gemini API configuration
   - Returns service status

7. **Proxy Image Endpoint** (`POST /api/proxy-image`):
   - **Purpose**: Convert external images to base64 data URLs
   - **Strategy**:
     1. Try fetching from Gemini-generated URLs
     2. Fallback to DiceBear geometric shapes
     3. Return error if all fail
   - **Process**:
     - Fetch image from URL
     - Encode to base64
     - Return as data URL
   - **Error Handling**: Graceful degradation with fallbacks

8. **Exception Handlers**:
   - HTTP exceptions: Custom error response
   - General exceptions: 500 error response

**File**: `backend/main.py`

---

### 2. **ai_generator.py** - AI Content Generation (326 lines)
**Purpose**: Logo and ad copy generation using Gemini API

**Configuration**:
```python
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_IMAGE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
```

**Models**:
```python
class LogoRequest(BaseModel):
    brand_name: str
    style: str = "Modern"
    styles: list = None  # Mix & match array

class AdCopyRequest(BaseModel):
    product_name: str
    description: str = ""
    tone: str = "Professional"
```

**Style Mapping** (10 Styles):
- Modern, Vintage, Minimalist, Luxury, Tech
- Playful, Organic, Abstract, 3D, Sports

**API Endpoints**:

1. **POST /api/ai/generate-logo**
   - Input: brand_name, styles (array)
   - Process:
     1. Validate input
     2. Combine style keywords
     3. Call Gemini 2.0 Flash API
     4. Generate Pollinations.ai URL
     5. Return URL to frontend
   - Fallback: Pre-optimized prompts if API fails

2. **POST /api/ai/generate-text**
   - Input: product_name, description, tone
   - Process:
     1. Validate input
     2. Call Gemini API for headline/body/CTA
     3. Return structured text response
   - Fallback: Random selection from predefined lists

**Key Functions**:

1. **Gemini API Integration**:
   - Uses httpx for async HTTP requests
   - Sends formatted prompts to Gemini
   - Extracts text from response
   - Graceful error handling with fallbacks

2. **Prompt Optimization**:
   - Gemini generates refined prompts
   - Adds variation seeds for uniqueness
   - Includes style-specific keywords

3. **Pollinations Integration**:
   - Generates image URLs using refined prompts
   - Format: `https://pollinations.ai/p/{encoded_prompt}`
   - Always returns a URL (never fails)

4. **Fallback System**:
   - Pre-defined professional templates
   - Random selection for variety
   - Ensures API never crashes

**File**: `backend/routers/ai_generator.py`

---

### 3. **assets.py** - Asset Management (414 lines)
**Purpose**: File uploads, background removal, color extraction

**Key Utilities**:

1. **validate_image_file()**
   - Checks file type (JPEG, PNG, WebP, GIF)
   - Validates file size (max 10MB)

2. **remove_background_from_image()**
   - Uses rembg library
   - Converts image to RGBA
   - Returns image with transparent background

3. **save_processed_image()**
   - Saves PIL Image to disk
   - Generates unique filename
   - Returns file path

**API Endpoints**:

1. **POST /api/assets/upload-original**
   - Saves original image without processing
   - Returns image URL
   - Purpose: Preserve original for comparison

2. **POST /api/assets/remove-background**
   - Removes background using rembg
   - Returns processed image URL
   - Purpose: Processed/edited version

3. **POST /api/assets/extract-colors**
   - Analyzes image
   - Extracts top 5 dominant colors
   - Returns hex color codes
   - Filters out whites/blacks/grays

**File**: `backend/routers/assets.py`

---

## API Endpoints

### Logo Generation
```
POST /api/ai/generate-logo
Content-Type: application/json

Request:
{
  "brand_name": "Nike",
  "styles": ["Modern", "Tech"],  // or single style in 'style'
  "style": "Modern"  // for backward compatibility
}

Response:
{
  "url": "/static/uploads/logo_xxxxx.png",
  "status": "success",
  "styles": ["Modern", "Tech"],
  "message": "Logo generated with Modern, Tech styles"
}
```

### Ad Copy Generation
```
POST /api/ai/generate-text
Content-Type: application/json

Request:
{
  "product_name": "Running Shoes",
  "description": "High-performance athletic footwear",
  "tone": "Professional"
}

Response:
{
  "headline": "Experience Ultimate Performance...",
  "body": "Our running shoes combine...",
  "cta": "Shop Now",
  "status": "success"
}
```

### Asset Upload
```
POST /api/assets/upload-original
Content-Type: multipart/form-data
Body: file (binary image)

Response:
{
  "id": "uuid",
  "url": "/static/uploads/image_xxxxx.png",
  "filename": "image_xxxxx.png",
  "size": 125000
}
```

### Background Removal
```
POST /api/assets/remove-background
Content-Type: multipart/form-data
Body: file (binary image)

Response:
{
  "url": "/static/uploads/image_no_bg_xxxxx.png",
  "filename": "image_no_bg_xxxxx.png",
  "status": "success"
}
```

### Color Extraction
```
POST /api/assets/extract-colors
Content-Type: multipart/form-data
Body: file (binary image)

Response:
{
  "colors": ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#33FFF5"],
  "status": "success",
  "count": 5
}
```

### Proxy Image
```
POST /api/proxy-image
Content-Type: application/json

Request:
{
  "url": "https://example.com/image.png"
}

Response:
{
  "status": "success",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## Data Flow

### Complete User Flow: Logo Generation with Background Removal

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS IMAGE                                               │
│    - Clicks upload area in LeftSidebar                              │
│    - Selects image file                                             │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. PARALLEL UPLOADS                                                 │
│    ┌────────────────────────────────────┐                           │
│    │ Upload Original                    │                           │
│    │ POST /api/assets/upload-original   │                           │
│    │ → Saves as-is                      │                           │
│    │ → Returns original_url             │                           │
│    └────────────────────────────────────┘                           │
│    ┌────────────────────────────────────┐                           │
│    │ Remove Background                  │                           │
│    │ POST /api/assets/remove-background │                           │
│    │ → Uses rembg library               │                           │
│    │ → Returns processed_url            │                           │
│    └────────────────────────────────────┘                           │
│    ┌────────────────────────────────────┐                           │
│    │ Extract Colors                     │                           │
│    │ POST /api/assets/extract-colors    │                           │
│    │ → Analyzes image                   │                           │
│    │ → Returns [5 colors]               │                           │
│    └────────────────────────────────────┘                           │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND STATE UPDATE                                            │
│    - Add original asset to assets array                             │
│    - Add processed asset (paired with original)                     │
│    - Update palette colors                                          │
│    - Display both in LeftSidebar                                    │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. USER GENERATES LOGO                                              │
│    - Enters brand name in LeftSidebar                               │
│    - Selects mix & match styles (checkboxes)                        │
│    - Clicks "Generate Logo"                                         │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. LOGO GENERATION                                                  │
│    POST /api/ai/generate-logo                                       │
│    {                                                                │
│      "brand_name": "Nike",                                          │
│      "styles": ["Modern", "Tech"]                                   │
│    }                                                                │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼ (Backend Processing)
┌─────────────────────────────────────────────────────────────────────┐
│ 6. BACKEND: COMBINE STYLES                                          │
│    - Get keywords: "minimalist, sleek..." + "futuristic, neon..."   │
│    - Combine: "minimalist, sleek, futuristic, neon, ..."            │
│    - Create prompt: "Professional logo with combined keywords"      │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. GEMINI API CALL (with Fallback)                                  │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │ Try: Gemini 2.0 Flash API                                    │ │
│    │ POST to generativelanguage.googleapis.com                    │ │
│    │ Response: Refined prompt                                     │ │
│    └──────────────────────────────────────────────────────────────┘ │
│    │                                                                │
│    │ On Failure (429/500):                                         │
│    │ Use pre-optimized prompt directly                             │
│    │                                                                │
│    └──────────────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. GENERATE IMAGE URL                                               │
│    - Call Pollinations API                                          │
│    - Generate URL: https://pollinations.ai/p/{encoded_prompt}       │
│    - Format: Safe for embedding                                     │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 9. RETURN TO FRONTEND                                               │
│    {                                                                │
│      "url": "https://pollinations.ai/p/nike-modern-tech...",        │
│      "status": "success",                                           │
│      "styles": ["Modern", "Tech"]                                   │
│    }                                                                │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 10. FRONTEND: DISPLAY LOGO                                          │
│    - Call proxy endpoint if needed (data URL conversion)            │
│    - Update generatedLogo state                                     │
│    - Show preview in LeftSidebar                                    │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 11. USER ADDS LOGO TO CANVAS                                        │
│    - Click + button on logo preview                                 │
│    - Drag logo to canvas                                            │
│    - Canvas receives image via drag-drop                            │
│    - Fabric.js renders image                                        │
│    - User can resize, move, rotate                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Setup and Installation

### Prerequisites
- Node.js 16+ (Frontend)
- Python 3.11+ (Backend)
- pip package manager
- Google Gemini API key

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# Run server
python main.py
```

### Environment Variables
```
# .env file
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Features

### 1. Logo Generation with Mix & Match
- **Single Style**: Generate logo with one style
- **Multiple Styles**: Combine up to 10 styles for unique logos
- **Hybrid Approach**: 
  - Primary: Google Gemini 2.0 Flash
  - Fallback: Pre-optimized prompts
  - Final Render: Pollinations.ai

### 2. Canvas Editor
- **Drawing Tools**: Text, rectangles, circles
- **Editing**: Move, resize, rotate, delete
- **Safe Zones**: Protected areas (top/bottom)
- **Zoom**: 50% to 300%
- **Background**: Customizable color
- **Drag & Drop**: Add images from sidebar

### 3. Asset Management
- **Upload**: Original + processed versions
- **Background Removal**: rembg technology
- **Color Extraction**: Auto-detect brand colors
- **Organization**: Side-by-side comparison

### 4. Ad Copy Generation
- **Headline Generation**: Attention-grabbing titles
- **Body Copy**: Persuasive descriptions
- **CTA**: Call-to-action buttons
- **Tone**: Professional, casual, etc.

### 5. Color Tools
- **Auto Extract**: 5 dominant colors from images
- **Apply to Canvas**: Click to change colors
- **Brand Colors**: Consistent palette

---

## Code Examples

### Example 1: Logo Generation Flow
**Frontend (LeftSidebar.jsx)**:
```javascript
const generateLogo = async () => {
  if (!aiBrandName.trim()) return setLogoError('Enter brand name')
  if (selectedStyles.length === 0) return setLogoError('Select at least one style')
  
  setLogoLoading(true)
  setLogoError('')

  try {
    const res = await axios.post('http://localhost:8000/api/ai/generate-logo', {
      brand_name: aiBrandName,
      styles: selectedStyles,  // Array of selected styles
      style: selectedStyles[0] // For backward compatibility
    })
    setGeneratedLogo({ url: res.data.url, originalUrl: res.data.url })
  } catch (e) {
    setLogoError("AI Error: " + (e.response?.data?.detail || e.message))
  }
  setLogoLoading(false)
}
```

**Backend (ai_generator.py)**:
```python
@router.post("/generate-logo")
async def generate_logo(request: LogoRequest) -> dict:
    if not request.brand_name.strip():
        raise HTTPException(status_code=400, detail="Brand name required")
    
    # Get selected styles
    selected_styles = request.styles if request.styles else [request.style]
    
    # Get style keywords
    all_keywords = [STYLE_MAP.get(s, STYLE_MAP["Modern"]) for s in selected_styles]
    style_keywords = ", ".join(all_keywords)
    
    # Build prompt
    prompt = f"""
    Professional logo for "{request.brand_name}"
    Styles: {style_keywords}
    ...
    """
    
    # Try Gemini optimization
    try:
        optimized_prompt = await optimize_with_gemini(prompt)
    except:
        optimized_prompt = prompt  # Use fallback
    
    # Generate Pollinations URL
    encoded = urllib.parse.quote(optimized_prompt)
    url = f"https://pollinations.ai/p/{encoded}"
    
    return {"url": url, "status": "success", "styles": selected_styles}
```

### Example 2: Background Removal
**Frontend (LeftSidebar.jsx)**:
```javascript
const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  // Upload original
  const origRes = await axios.post(
    'http://localhost:8000/api/assets/upload-original',
    formData
  )
  
  setAssets(prev => [...prev, {
    id: `${assetId}_orig`,
    url: origRes.data.url,
    type: 'original'
  }])

  // Remove background
  try {
    const bgRes = await axios.post(
      'http://localhost:8000/api/assets/remove-background',
      formData
    )
    
    setAssets(prev => [...prev, {
      id: `${assetId}_processed`,
      url: bgRes.data.url,
      type: 'processed'
    }])
  } catch (e) {
    console.log('Background removal failed')
  }
}
```

**Backend (assets.py)**:
```python
@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)) -> Dict:
    file_bytes = await file.read()
    
    # Validate
    validate_image_file(file.content_type, len(file_bytes))
    
    # Remove background
    processed_image = remove_background_from_image(file_bytes)
    
    # Save
    filename = f"{Path(file.filename).stem}_no_bg_{uuid.uuid4().hex[:8]}.png"
    saved_path = save_processed_image(processed_image, filename)
    
    return {
        "status": "success",
        "url": f"/static/uploads/{filename}",
        "filename": filename
    }
```

### Example 3: Canvas Text Addition
**Frontend (CanvasEditor.jsx)**:
```javascript
const addText = () => {
  const canvas = window.fabricCanvas
  if (!canvas) return
  
  const text = new fabric.IText('Double click to edit', {
    left: 100,
    top: 250,
    fontSize: 32,
    fill: '#000000'
  })
  
  canvas.add(text)
  canvas.setActiveObject(text)
  canvas.renderAll()
}
```

---

## Environment Configuration

### Frontend (.env or vite.config.js)
```javascript
// Default API endpoint
const API_BASE = 'http://localhost:8000'
```

### Backend (.env)
```
GEMINI_API_KEY=your_key_here
```

---

## Testing the Application

### Manual Testing Workflow
1. **Start Backend**: `python main.py` (port 8000)
2. **Start Frontend**: `npm run dev` (port 5173)
3. **Test Logo Generation**:
   - Enter brand name
   - Select styles
   - Click generate
   - View preview
4. **Test Canvas**:
   - Add text/shapes
   - Apply colors
   - Zoom in/out
   - Test safe zones

### API Testing with cURL
```bash
# Generate Logo
curl -X POST http://localhost:8000/api/ai/generate-logo \
  -H "Content-Type: application/json" \
  -d '{
    "brand_name": "TestBrand",
    "styles": ["Modern", "Tech"]
  }'

# Health Check
curl http://localhost:8000/health
```

---

## Performance Optimizations

1. **Frontend**:
   - Lazy loading components
   - Memoized Canvas Editor
   - Custom scrollbar CSS
   - Vite bundling

2. **Backend**:
   - Async HTTP requests (httpx)
   - Efficient image processing
   - Error handling with fallbacks
   - Static file caching

3. **Assets**:
   - Image compression
   - Base64 optimization
   - Lazy loading

---

## Troubleshooting

### Logo Generation Fails
- Check Gemini API key in .env
- Verify billing is enabled
- Check network connectivity
- Review backend logs for errors

### Canvas Not Showing
- Check if Fabric.js library loaded
- Verify canvas element exists
- Check browser console for errors
- Ensure ports are not blocked

### Images Not Loading
- Check static/uploads directory exists
- Verify file permissions
- Check CORS settings
- Try proxy endpoint

### Background Removal Not Working
- Ensure rembg is installed: `pip install rembg`
- Check image format (PNG, JPEG supported)
- Review backend logs
- Try with different image

---

## Future Enhancements

1. **Export Features**:
   - Export canvas as PNG/SVG
   - Download assets
   - Save projects

2. **Advanced Tools**:
   - Text effects
   - Filters
   - Image manipulation

3. **Collaboration**:
   - Share designs
   - Team projects
   - Version history

4. **AI Improvements**:
   - Custom training
   - More style options
   - Animation generation

---

## Conclusion

InstaGen is a fully-featured AI design studio that combines:
- Modern frontend architecture (React + Vite)
- Robust backend services (FastAPI)
- Advanced AI capabilities (Gemini)
- Professional image processing (rembg)

The modular design allows easy expansion and maintenance, while the hybrid approach ensures reliability even when external APIs are unavailable.

For support, refer to the API_DOCUMENTATION.md and QUICK_START.md files.

---

**Last Updated**: December 13, 2025
**Version**: 2.0.0
**Status**: Production Ready ✅
