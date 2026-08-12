import React, { useState, useEffect, useRef, useCallback } from 'react'
import { fabric } from 'fabric'

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920

function CanvasEditor() {
  const [zoomLevel, setZoomLevel] = useState(0.35) // Default 35% fits 9:16 canvas cleanly into view
  const [bgColor, setBgColor] = useState('#f5f5f5')
  const [initialized, setInitialized] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  const canvasAreaRef = useRef(null)

  // Auto-fit canvas inside viewport container without overflow
  const fitToScreen = useCallback(() => {
    if (!canvasAreaRef.current) return
    const rect = canvasAreaRef.current.getBoundingClientRect()
    const padding = 48 // 24px padding on each side
    const availWidth = rect.width - padding
    const availHeight = rect.height - padding

    if (availWidth > 0 && availHeight > 0) {
      const scaleX = availWidth / CANVAS_WIDTH
      const scaleY = availHeight / CANVAS_HEIGHT
      const fitScale = Math.min(scaleX, scaleY, 0.85)
      setZoomLevel(Math.max(0.15, Math.round(fitScale * 100) / 100))
    }
  }, [])

  // Check dark mode on mount and watch for theme changes
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  // Auto-fit zoom on initial mount & window resize
  useEffect(() => {
    const timer = setTimeout(fitToScreen, 100)
    window.addEventListener('resize', fitToScreen)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', fitToScreen)
    }
  }, [fitToScreen])

  // CALLBACK REF: Runs when container DOM element is ready
  const handleCanvasContainerRef = (containerElement) => {
    if (initialized || !containerElement) return
    if (window.fabricCanvas) return

    console.log('🔨 CALLBACK REF FIRED: Initializing canvas NOW')
    containerElement.innerHTML = ''

    const canvasElement = document.createElement('canvas')
    canvasElement.id = 'main-fabric-canvas'
    canvasElement.width = CANVAS_WIDTH
    canvasElement.height = CANVAS_HEIGHT

    // Critical inline overrides for Fabric.js preflight compatibility
    canvasElement.style.cssText = `
      display: block !important;
      width: ${CANVAS_WIDTH}px !important;
      height: ${CANVAS_HEIGHT}px !important;
      max-width: none !important;
      border: 2px solid ${isDarkMode ? '#475569' : '#cbd5e1'} !important;
      border-radius: 8px !important;
      cursor: default !important;
      background-color: #f5f5f5 !important;
      background: #f5f5f5 !important;
    `

    containerElement.appendChild(canvasElement)

    const canvas = new fabric.Canvas(canvasElement, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#f5f5f5',
      selection: true,
      preserveObjectStacking: true
    })

    canvas.setWidth(CANVAS_WIDTH)
    canvas.setHeight(CANVAS_HEIGHT)
    canvas.renderAll()

    window.fabricCanvas = canvas
    setInitialized(true)

    // Force upper-canvas transparency
    const fixTransparency = () => {
      const upperCanvas = document.querySelector('.upper-canvas')
      if (upperCanvas) {
        upperCanvas.style.background = 'transparent'
        upperCanvas.style.backgroundColor = 'transparent'
      }
    }
    
    fixTransparency()
    setTimeout(fixTransparency, 300)
    setTimeout(fitToScreen, 150)
  }

  const addText = () => {
    const canvas = window.fabricCanvas
    if (!canvas) return

    try {
      const textColor = isDarkMode ? '#ffffff' : '#1f2937'
      const text = new fabric.IText('Double click to edit', {
        left: 100,
        top: 100,
        fontSize: 36,
        fill: textColor,
        fontWeight: 'bold',
        editable: true,
        stroke: '#000000',
        strokeWidth: 0.5
      })
      
      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
    } catch (err) {
      console.error('❌ Error adding text:', err)
    }
  }

  const addRectangle = () => {
    const canvas = window.fabricCanvas
    if (!canvas) return

    try {
      const rectColor = isDarkMode ? '#60a5fa' : '#3b82f6'
      const strokeColor = isDarkMode ? '#93c5fd' : '#1e40af'
      const rect = new fabric.Rect({
        left: 200,
        top: 200,
        width: 180,
        height: 180,
        fill: rectColor,
        stroke: strokeColor,
        strokeWidth: 2,
        rx: 8,
        ry: 8
      })
      
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
    } catch (err) {
      console.error('❌ Error adding rectangle:', err)
    }
  }

  const addCircle = () => {
    const canvas = window.fabricCanvas
    if (!canvas) return

    try {
      const circleColor = isDarkMode ? '#f87171' : '#ef4444'
      const strokeColor = isDarkMode ? '#fca5a5' : '#991b1b'
      const circle = new fabric.Circle({
        left: 300,
        top: 300,
        radius: 90,
        fill: circleColor,
        stroke: strokeColor,
        strokeWidth: 2
      })
      
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
    } catch (err) {
      console.error('❌ Error adding circle:', err)
    }
  }

  const deleteSelected = () => {
    const canvas = window.fabricCanvas
    if (!canvas) return

    const activeObj = canvas.getActiveObject()
    if (activeObj) {
      canvas.remove(activeObj)
      canvas.renderAll()
    }
  }

  const clearCanvas = () => {
    const canvas = window.fabricCanvas
    if (!canvas) return

    if (confirm('Clear all objects from canvas?')) {
      canvas.clear()
    }
  }

  const changeBackgroundColor = (e) => {
    const color = e.target.value
    setBgColor(color)
    const canvas = window.fabricCanvas
    if (canvas) {
      canvas.setBackgroundColor(color, () => canvas.renderAll())
    }
  }

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.05, 2.5))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.05, 0.1))
  const resetZoomTo100 = () => setZoomLevel(1.0)

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs z-20 flex-shrink-0">
        
        {/* LEFT TOOL GROUP: OBJECT ADDERS */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={addText} 
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-xs shadow-xs transition-all duration-150"
            title="Add Text Layer"
          >
            <span>📝</span>
            <span>+ Text</span>
          </button>

          <button 
            onClick={addRectangle} 
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs shadow-xs transition-all duration-150"
            title="Add Rectangle Shape"
          >
            <span>▭</span>
            <span>+ Rect</span>
          </button>

          <button 
            onClick={addCircle} 
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-medium text-xs shadow-xs transition-all duration-150"
            title="Add Circle Shape"
          >
            <span>●</span>
            <span>+ Circle</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          {/* BG COLOR SELECTOR */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">BG:</span>
            <input 
              type="color" 
              value={bgColor} 
              onChange={changeBackgroundColor}
              className="h-6 w-8 rounded cursor-pointer border border-slate-300 dark:border-slate-500 bg-transparent p-0"
              title="Change Canvas Background Color"
            />
          </div>
        </div>

        {/* CENTER INFO BADGE */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
          <span>📐 Canvas: 1080 × 1920</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>9:16 Story/Reel</span>
        </div>

        {/* RIGHT ACTION GROUP */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={deleteSelected} 
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-xs transition-all duration-150"
            title="Delete Selected Object"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>

          <button 
            onClick={clearCanvas} 
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition-all duration-150"
            title="Clear All Canvas Content"
          >
            <span>🧹</span>
            <span>Clear</span>
          </button>
        </div>

      </div>

      {/* CANVAS WORKSPACE AREA */}
      <div 
        ref={canvasAreaRef}
        className="flex-1 w-full bg-slate-200/70 dark:bg-slate-900/90 overflow-auto flex justify-center items-center p-6 relative transition-colors duration-200"
      >
        <div 
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out'
          }}
          className="inline-block shadow-2xl rounded-lg overflow-hidden bg-white"
          ref={handleCanvasContainerRef}
        >
          {/* Canvas injected here by CALLBACK REF */}
        </div>
      </div>

      {/* FLOATING ZOOM CONTROLS */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center space-x-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200">
        <button 
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors"
          title="Zoom Out (-5%)"
        >
          −
        </button>

        <span className="w-12 text-center font-mono text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button 
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-sm transition-colors"
          title="Zoom In (+5%)"
        >
          +
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5"></div>

        <button 
          onClick={fitToScreen}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 font-semibold text-xs transition-colors"
          title="Auto Fit to Screen Height"
        >
          🎯 Fit
        </button>

        <button 
          onClick={resetZoomTo100}
          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors"
          title="Zoom to 100%"
        >
          100%
        </button>
      </div>

    </div>
  )
}

export default React.memo(CanvasEditor)