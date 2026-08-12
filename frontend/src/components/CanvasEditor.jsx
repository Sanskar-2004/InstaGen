import React, { useState } from 'react'
import { fabric } from 'fabric'

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920

function CanvasEditor() {
  const [zoomLevel, setZoomLevel] = useState(0.5)
  const [bgColor, setBgColor] = useState('#f5f5f5')
  const [initialized, setInitialized] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showSafeZones, setShowSafeZones] = useState(true)

  // Check dark mode on mount and when it changes
  React.useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
    
    checkDarkMode()
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  // CALLBACK REF: This runs EXACTLY ONCE when DOM is ready, bypassing all timing issues
  const handleCanvasContainerRef = (containerElement) => {
    // Guard 1: Skip if already initialized
    if (initialized || !containerElement) {
      console.log('🛡️ Skipping: Already initialized or no container')
      return
    }

    // Guard 2: Skip if canvas already exists
    if (window.fabricCanvas) {
      console.log('🛡️ Skipping: Canvas already exists in window')
      return
    }

    console.log('🔨 CALLBACK REF FIRED: Initializing canvas NOW')

    // Clear any existing content
    containerElement.innerHTML = ''

    // Create a FRESH canvas element
    const canvasElement = document.createElement('canvas')
    canvasElement.id = 'main-fabric-canvas'
    canvasElement.width = CANVAS_WIDTH
    canvasElement.height = CANVAS_HEIGHT

    // ARMOR PLATE: Override Tailwind's preflight CSS with !important inline styles
    canvasElement.style.cssText = `
      display: block !important;
      width: ${CANVAS_WIDTH}px !important;
      height: ${CANVAS_HEIGHT}px !important;
      max-width: none !important;
      height: ${CANVAS_HEIGHT}px !important;
      border: 2px solid #999999 !important;
      border-radius: 4px !important;
      cursor: default !important;
      background-color: #f5f5f5 !important;
      background: #f5f5f5 !important;
    `

    // Inject into container
    containerElement.appendChild(canvasElement)

    console.log('✅ Canvas element injected into DOM')

    // Initialize Fabric
    const canvas = new fabric.Canvas(canvasElement, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#f5f5f5',
      selection: true,
      preserveObjectStacking: true
    })

    // Set initial text color based on dark mode
    const textColor = isDarkMode ? '#ffffff' : '#1f2937'

    // Force render cycle
    canvas.setWidth(CANVAS_WIDTH)
    canvas.setHeight(CANVAS_HEIGHT)
    canvas.renderAll()

    window.fabricCanvas = canvas
    setInitialized(true)

    console.log('✅ Fabric canvas initialized successfully')
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
    console.log('Canvas element actual size:', canvasElement.width, 'x', canvasElement.height)

    // FIX TRANSPARENCY: Force upper-canvas to be transparent
    const fixTransparency = () => {
      const upperCanvas = document.querySelector('.upper-canvas')
      if (upperCanvas) {
        upperCanvas.style.background = 'transparent'
        upperCanvas.style.backgroundColor = 'transparent'
        console.log('✅ Upper canvas transparency fixed')
      }
    }
    
    // Run immediately and again after delay
    fixTransparency()
    setTimeout(fixTransparency, 500)

    // Add safe zones overlay if enabled
    if (showSafeZones) {
      addSafeZonesOverlay(canvas)
    }
  }

  const addText = () => {
    console.log('📝 Add Text clicked')
    const canvas = window.fabricCanvas
    
    if (!canvas) {
      console.error('❌ Canvas is not initialized!')
      alert('Canvas not ready. Please refresh the page.')
      return
    }

    try {
      const textColor = isDarkMode ? '#ffffff' : '#1f2937'
      const text = new fabric.IText('Double click to edit', {
        left: 100,
        top: 100,
        fontSize: 32,
        fill: textColor,
        fontWeight: 'bold',
        editable: true,
        stroke: '#000000',
        strokeWidth: 0.5
      })
      
      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()
      
      console.log('✅ Text added. Total objects:', canvas.getObjects().length)
    } catch (err) {
      console.error('❌ Error adding text:', err)
    }
  }

  const addRectangle = () => {
    console.log('▭ Add Rect clicked')
    const canvas = window.fabricCanvas
    
    if (!canvas) {
      console.error('❌ Canvas is not initialized!')
      return
    }

    try {
      const rectColor = isDarkMode ? '#60a5fa' : '#3b82f6'
      const strokeColor = isDarkMode ? '#93c5fd' : '#1e40af'
      const rect = new fabric.Rect({
        left: 200,
        top: 200,
        width: 150,
        height: 150,
        fill: rectColor,
        stroke: strokeColor,
        strokeWidth: 2
      })
      
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
      
      console.log('✅ Rectangle added. Total objects:', canvas.getObjects().length)
    } catch (err) {
      console.error('❌ Error adding rectangle:', err)
    }
  }

  const addCircle = () => {
    console.log('● Add Circle clicked')
    const canvas = window.fabricCanvas
    
    if (!canvas) {
      console.error('❌ Canvas is not initialized!')
      return
    }

    try {
      const circleColor = isDarkMode ? '#f87171' : '#ef4444'
      const strokeColor = isDarkMode ? '#fca5a5' : '#991b1b'
      const circle = new fabric.Circle({
        left: 300,
        top: 300,
        radius: 75,
        fill: circleColor,
        stroke: strokeColor,
        strokeWidth: 2
      })
      
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
      
      console.log('✅ Circle added. Total objects:', canvas.getObjects().length)
    } catch (err) {
      console.error('❌ Error adding circle:', err)
    }
  }

  const deleteSelected = () => {
    console.log('🗑️ Delete clicked')
    const canvas = window.fabricCanvas
    
    if (!canvas) {
      console.error('❌ Canvas is not initialized!')
      return
    }

    const activeObj = canvas.getActiveObject()
    if (activeObj) {
      canvas.remove(activeObj)
      canvas.renderAll()
      console.log('✅ Object deleted. Total objects:', canvas.getObjects().length)
    } else {
      console.log('⚠️ No object selected')
    }
  }

  const clearCanvas = () => {
    console.log('🧹 Clear clicked')
    const canvas = window.fabricCanvas
    
    if (!canvas) {
      console.error('❌ Canvas is not initialized!')
      return
    }

    if (confirm('Clear all objects from canvas?')) {
      canvas.clear()
      console.log('✅ Canvas cleared')
    }
  }

  const changeBackgroundColor = (e) => {
    const color = e.target.value
    setBgColor(color)
    const canvas = window.fabricCanvas
    if (canvas) {
      canvas.setBackgroundColor(color, () => canvas.renderAll())
      console.log('✅ Background color changed to:', color)
    }
  }

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 3))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.1))
  const resetZoom = () => setZoomLevel(0.5)

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: isDarkMode ? '#1a1b26' : '#f3f4f6',
    transition: 'background-color 0.3s ease'
  }

  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: isDarkMode ? '#0f1117' : '#ffffff',
    borderBottom: `1px solid ${isDarkMode ? '#30363d' : '#d1d5db'}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 20,
    flexShrink: 0,
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  }

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    color: '#ffffff',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'opacity 0.2s ease'
  }

  const canvasAreaStyle = {
    flex: 1,
    width: '100%',
    backgroundColor: isDarkMode ? '#1a1b26' : '#f9fafb',
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px',
    transition: 'background-color 0.3s ease'
  }

  const canvasWrapperStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center center',
    display: 'inline-block',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    borderRadius: '4px'
  }

  const zoomControlsStyle = {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    zIndex: 50,
    display: 'flex',
    gap: '8px',
    backgroundColor: isDarkMode ? '#0f1117' : '#ffffff',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
    border: `1px solid ${isDarkMode ? '#30363d' : '#e5e7eb'}`,
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  }

  return (
    <div style={containerStyle}>
      {/* TOOLBAR */}
      <div style={toolbarStyle}>
        <button 
          onClick={addText} 
          style={{...buttonStyle, backgroundColor: '#3b82f6'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          + Text
        </button>
        <button 
          onClick={addRectangle} 
          style={{...buttonStyle, backgroundColor: '#10b981'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          + Rect
        </button>
        <button 
          onClick={addCircle} 
          style={{...buttonStyle, backgroundColor: '#ef4444'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
        >
          + Circle
        </button>
        
        <div style={{borderLeft: `1px solid ${isDarkMode ? '#30363d' : '#d1d5db'}`, marginLeft: '8px', marginRight: '8px', height: '24px'}}></div>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '14px', fontWeight: 500, color: isDarkMode ? '#e2e8f0' : '#374151'}}>BG:</span>
          <input 
            type="color" 
            value={bgColor} 
            onChange={changeBackgroundColor}
            style={{height: '32px', width: '48px', padding: '4px', border: `1px solid ${isDarkMode ? '#30363d' : '#d1d5db'}`, borderRadius: '4px', cursor: 'pointer'}}
          />
        </div>

        <div style={{flex: 1}}></div>
        
        <button 
          onClick={deleteSelected} 
          style={{...buttonStyle, backgroundColor: '#f97316'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
        >
          Delete
        </button>
        <button 
          onClick={clearCanvas} 
          style={{...buttonStyle, backgroundColor: '#dc2626'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
        >
          Clear All
        </button>
      </div>

      {/* CANVAS AREA */}
      <div style={canvasAreaStyle}>
        <div style={canvasWrapperStyle} ref={handleCanvasContainerRef}>
          {/* Canvas will be injected here by CALLBACK REF when DOM is ready */}
        </div>
      </div>

      {/* ZOOM CONTROLS */}
      <div style={zoomControlsStyle}>
        <button 
          onClick={zoomOut}
          style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? '#21262d' : '#e5e7eb', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', color: isDarkMode ? '#e2e8f0' : '#1f2937', transition: 'background-color 0.2s ease'}}
          onMouseOver={(e) => e.target.style.backgroundColor = isDarkMode ? '#30363d' : '#d1d5db'}
          onMouseOut={(e) => e.target.style.backgroundColor = isDarkMode ? '#21262d' : '#e5e7eb'}
        >
          −
        </button>
        <span style={{width: '64px', textAlign: 'center', fontFamily: 'monospace', fontSize: '14px', color: isDarkMode ? '#e2e8f0' : '#1f2937'}}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button 
          onClick={zoomIn}
          style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? '#21262d' : '#e5e7eb', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', color: isDarkMode ? '#e2e8f0' : '#1f2937', transition: 'background-color 0.2s ease'}}
          onMouseOver={(e) => e.target.style.backgroundColor = isDarkMode ? '#30363d' : '#d1d5db'}
          onMouseOut={(e) => e.target.style.backgroundColor = isDarkMode ? '#21262d' : '#e5e7eb'}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default React.memo(CanvasEditor)