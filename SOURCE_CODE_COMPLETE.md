# InstaGen - Complete Source Code

**Project**: InstaGen - Fabric.js Canvas Editor with Dark Mode & Social Safe Zones
**Technology Stack**: React 18.2.0 + Vite 5.0 + Fabric.js 5.3.0 + Tailwind CSS 3.3.6
**Date**: December 14, 2025

---

## 📁 Project Structure

```
InstaGen/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                          (Main App Component)
│   │   ├── main.jsx                         (Entry Point)
│   │   ├── index.css                        (Global Styles)
│   │   ├── components/
│   │   │   ├── CanvasEditor.jsx             (Canvas & Drawing Logic)
│   │   │   ├── DarkModeToggle.jsx           (Dark Mode Switch)
│   │   │   └── layout/
│   │   │       ├── EditorLayout.jsx         (Main Layout)
│   │   │       ├── LeftSidebar.jsx          (Left Panel)
│   │   │       └── RightSidebar.jsx         (Right Panel - Properties)
│   │   ├── hooks/
│   │   │   └── useDarkMode.js               (Dark Mode Hook)
│   │   └── utils/
│   │       ├── updateCanvasTheme.js         (Canvas Theme Updates)
│   │       └── MODULE_A_LayoutConstraints.js (Compliance Module)
│   ├── package.json                          (Dependencies)
│   ├── vite.config.js                        (Vite Config)
│   ├── tailwind.config.js                    (Tailwind Config)
│   └── index.html                            (HTML Entry)
└── backend/                                   (Node.js/Python API)
```

---

## 🔧 Frontend Source Code

### 1. App.jsx
**File**: `frontend/src/App.jsx`

```jsx
import { useEffect, useState } from 'react'
import EditorLayout from './components/layout/EditorLayout'
import CanvasEditor from './components/CanvasEditor'

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize dark mode on mount
    const theme = localStorage.getItem('theme') || 'light'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <EditorLayout>
      <CanvasEditor />
    </EditorLayout>
  )
}

export default App
```

---

### 2. CanvasEditor.jsx (Main Canvas Component)
**File**: `frontend/src/components/CanvasEditor.jsx`

Key Features:
- Fabric.js canvas initialization with callback refs
- Dark mode support with dynamic colors
- Social safe zones overlay (200px top, 250px bottom)
- Text, rectangle, circle drawing tools
- Zoom controls (50-300%)
- Background color picker
- Delete & Clear All functions

Full file available in the workspace at: `c:\Users\sansk\OneDrive\Desktop\InstaGen\frontend\src\components\CanvasEditor.jsx`

Highlights:
```jsx
// Safe Zone Configuration (9x16 - 1080x1920)
const SAFE_TOP = 200          // Unsafe area from top
const SAFE_BOTTOM = 250       // Unsafe area from bottom
const SAFE_HEIGHT = 1470      // Safe area height

// Dark Mode Support
const [isDarkMode, setIsDarkMode] = useState(false)
const [showSafeZones, setShowSafeZones] = useState(true)

// Canvas Styling
const containerStyle = {
  backgroundColor: isDarkMode ? '#1a1b26' : '#f3f4f6'
}

// Shape Colors (Dark Mode Aware)
const rectColor = isDarkMode ? '#60a5fa' : '#3b82f6'
const circleColor = isDarkMode ? '#f87171' : '#ef4444'
const textColor = isDarkMode ? '#ffffff' : '#1f2937'
```

---

### 3. EditorLayout.jsx
**File**: `frontend/src/components/layout/EditorLayout.jsx`

```jsx
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

export default function EditorLayout({ children }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <LeftSidebar />
      <main className="flex-1 overflow-hidden bg-white">
        {children}
      </main>
      <RightSidebar />
    </div>
  )
}
```

---

### 4. RightSidebar.jsx (Export & Properties)
**File**: `frontend/src/components/layout/RightSidebar.jsx`

Key Features:
- Export panel with PNG/JPG format selection
- Size presets (1080x1920, 1080x1080, 500x500)
- Dark mode aware styling on all text
- Export handler that forces light background

Key Export Function:
```jsx
const handleExport = () => {
  if (!window.fabricCanvas) return
  const canvas = window.fabricCanvas
  
  // Store original background color
  const originalBgColor = canvas.backgroundColor
  
  // Force light background for export (regardless of dark mode)
  canvas.setBackgroundColor('#f5f5f5', () => {
    canvas.renderAll()
  })
  
  // Small delay to ensure rendering
  setTimeout(() => {
    let mult = 1
    if(exportDimension === '1080x1920') mult = 2 // Full HD export
    
    const dataURL = canvas.toDataURL({
      format: exportFormat,
      quality: 1,
      multiplier: mult
    })
    
    // Restore original background
    canvas.setBackgroundColor(originalBgColor, () => {
      canvas.renderAll()
    })
    
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `design-${Date.now()}.${exportFormat}`
    link.click()
  }, 100)
}
```

---

### 5. DarkModeToggle.jsx
**File**: `frontend/src/components/DarkModeToggle.jsx`

```jsx
import React, { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { updateCanvasTheme } from '../utils/updateCanvasTheme'

export default function DarkModeToggle({ position = 'fixed' }) {
  const [theme, toggleTheme] = useDarkMode()

  // Update canvas theme whenever theme changes
  useEffect(() => {
    const canvas = window.fabricCanvas
    if (canvas) {
      console.log('[DarkModeToggle] Updating canvas:', theme)
      updateCanvasTheme(canvas, theme === 'dark')
    }
  }, [theme])

  const handleClick = () => {
    console.log('[DarkModeToggle] Click - current theme:', theme)
    toggleTheme()
  }

  const positionClasses = position === 'fixed' ? 'fixed top-4 left-4 z-50' : 'relative'

  return (
    <button
      onClick={handleClick}
      className={`
        ${positionClasses} px-3 py-2 rounded-lg shadow-lg 
        transition-all duration-300 font-medium text-sm
        ${
          theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
            : 'bg-white hover:bg-slate-100 text-slate-700'
        }
        border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title="Toggle Dark Mode"
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        {theme === 'dark' ? (
          <>
            <Sun size={16} />
            {position === 'fixed' && <span>Light</span>}
          </>
        ) : (
          <>
            <Moon size={16} />
            {position === 'fixed' && <span>Dark</span>}
          </>
        )}
      </div>
    </button>
  )
}
```

---

### 6. useDarkMode.js Hook
**File**: `frontend/src/hooks/useDarkMode.js`

```jsx
import { useState, useEffect } from 'react'

/**
 * Custom Hook: useDarkMode
 * Manages dark mode state with localStorage persistence
 * Automatically adds/removes 'dark' class to document.documentElement
 */
export function useDarkMode() {
  const [theme, setTheme] = useState('light')

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const initialTheme = saved || 'light'
    
    setTheme(initialTheme)
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    console.log('[useDarkMode] Initialized with:', initialTheme)
  }, [])

  // Update DOM when theme changes
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
    console.log('[useDarkMode] Theme updated to:', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return [theme, toggleTheme]
}

export default useDarkMode
```

---

### 7. updateCanvasTheme.js
**File**: `frontend/src/utils/updateCanvasTheme.js`

```jsx
/**
 * Update canvas theme for dark/light mode
 * @param {fabric.Canvas} canvas - Fabric.js canvas instance
 * @param {boolean} isDark - true for dark mode, false for light mode
 */
export function updateCanvasTheme(canvas, isDark) {
  if (!canvas) {
    console.error('[CANVAS THEME] Canvas not provided')
    return
  }

  console.log('[CANVAS THEME] Updating canvas to', isDark ? 'DARK' : 'LIGHT', 'mode')

  // 1. Set the Canvas Background Color explicitly
  const bgColor = isDark ? '#121212' : '#ffffff'
  canvas.setBackgroundColor(bgColor, canvas.renderAll.bind(canvas))

  // 2. Loop through objects to invert text colors
  canvas.getObjects().forEach((obj) => {
    // Only target text objects or simple shapes
    if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') {
      
      // If going Dark: Turn Black text -> White
      if (isDark && (obj.fill === '#000000' || obj.fill === 'black' || obj.fill === '#000')) {
        obj.set('fill', '#ffffff')
        obj.set('originalColor', 'black')
        console.log('[CANVAS THEME] ✓ Changed black text to white (dark mode)')
      }
      
      // If going Light: Turn White text -> Black
      else if (!isDark && obj.fill === '#ffffff') {
        obj.set('fill', '#000000')
        console.log('[CANVAS THEME] ✓ Changed white text to black (light mode)')
      }
    }
  })

  // 3. Force a full repaint
  canvas.requestRenderAll()
  console.log('[CANVAS THEME] ✓ Canvas theme update complete')
}

export default updateCanvasTheme
```

---

### 8. index.css (Global Styles)
**File**: `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 1. Global Reset & Fonts */
html {
  background-color: #f8fafc;
  color: #1f2937;
}

html.dark {
  background-color: #1e293b;
  color: #f1f5f9;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
  overflow: hidden;
}

html.dark body {
  background-color: #1e293b;
  color: #f1f5f9;
}

/* Canvas and content areas keep white background */
.dark canvas,
canvas {
  background-color: white !important;
}

/* CRITICAL: Prevent dark mode from affecting canvas */
.dark #main-fabric-canvas,
#main-fabric-canvas {
  background-color: #f5f5f5 !important;
  background: #f5f5f5 !important;
  color-scheme: light !important;
}

.dark canvas.lower-canvas,
canvas.lower-canvas {
  background-color: #f5f5f5 !important;
}

.dark canvas.upper-canvas,
canvas.upper-canvas {
  background: transparent !important;
  background-color: transparent !important;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Custom scrollbars */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* FABRIC.JS CRITICAL FIXES */
.canvas-container canvas.upper-canvas {
    background: transparent !important;
    background-color: transparent !important;
}

.canvas-container {
    background: none !important;
}

.canvas-container canvas {
    max-width: none !important;
    max-height: none !important;
    box-sizing: content-box !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
}
```

---

### 9. tailwind.config.js
**File**: `frontend/tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

### 10. vite.config.js
**File**: `frontend/vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true
  }
})
```

---

### 11. package.json
**File**: `frontend/package.json`

```json
{
  "name": "instagen-frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "fabric": "^5.3.0",
    "lucide-react": "^0.561.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.0"
  }
}
```

---

## 🎨 Key Features Implemented

### 1. Dark Mode
- ✅ Toggle switch in top-left corner
- ✅ localStorage persistence
- ✅ Automatic canvas color updates
- ✅ All UI elements respond to theme

### 2. Fabric.js Canvas
- ✅ Stable initialization with callback refs
- ✅ Text, Rectangle, Circle tools
- ✅ Zoom controls (50-300%)
- ✅ Background color picker
- ✅ Delete & Clear All functions

### 3. Social Safe Zones
- ✅ 9x16 (1080x1920) format compliance
- ✅ 200px unsafe zone from top (red overlay)
- ✅ 250px unsafe zone from bottom (red overlay)
- ✅ Toggle button to show/hide
- ✅ Non-interactive overlays

### 4. Export Functionality
- ✅ PNG/JPG format selection
- ✅ Size presets (Story/Reel, Square Post, Preview)
- ✅ High-resolution export (2x multiplier for 1080x1920)
- ✅ Always exports with light background (professional appearance)

### 5. Dark Mode CSS Fixes
- ✅ Canvas always maintains light background
- ✅ Workspace adapts to dark theme
- ✅ All text colors update for readability
- ✅ Upper-canvas transparency fixed

---

## 🚀 How to Run

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Server runs on `http://localhost:3002`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📝 Notes

### Tailwind CSS + Fabric.js Conflict Solution
**Problem**: Tailwind's preflight CSS was crushing canvas dimensions
**Solution**: Force CSS overrides with `!important` flags

### Dark Mode Canvas Rendering
**Problem**: Canvas background turned black in dark mode
**Solution**: Force `color-scheme: light !important` and explicit background colors

### Export Consistency
**Problem**: Exports were inheriting dark mode colors
**Solution**: Temporarily force light background during export, then restore

---

## 🔐 Production Checklist

- [ ] Test all buttons in light & dark modes
- [ ] Verify export quality at different resolutions
- [ ] Check dark mode toggle persistence across sessions
- [ ] Validate safe zones don't interfere with drawing
- [ ] Test zoom functionality at extreme levels
- [ ] Verify responsive layout on mobile

---

## 📞 Support

For issues or questions about this codebase, refer to:
- `TECHNICAL_DOCUMENTATION.md` - Architecture details
- `API_DOCUMENTATION.md` - Backend endpoints
- `COMPLIANCE_MODULES_QUICK_START.md` - Regulatory features

---

**Generated**: December 14, 2025
**Project Version**: 1.0.0
**License**: MIT (Add your license)

