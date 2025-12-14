import React, { useState, useEffect } from 'react'
import DarkModeToggle from '../DarkModeToggle'

export default function RightSidebar() {
  const [activePanel, setActivePanel] = useState('properties')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [size, setSize] = useState(24)
  const [opacity, setOpacity] = useState(100)
  const [selectedObject, setSelectedObject] = useState(null)
  const [exportFormat, setExportFormat] = useState('png')
  const [exportDimension, setExportDimension] = useState('1080x1920')
  const [layers, setLayers] = useState([])

  // --- SELECTION LISTENER LOGIC (Unchanged) ---
  useEffect(() => {
    const updateSelection = () => {
      try {
        let active = window.selectedFabricObject
        if (!active && window.fabricCanvas) {
          active = window.fabricCanvas.getActiveObject()
        }
        
        if (active) {
          setSelectedObject(active)
          if (active.fill && typeof active.fill === 'string') setSelectedColor(active.fill)
          
          if (active.fontSize) {
            setSize(active.fontSize)
          } else if (active.width) {
            setSize(Math.round(active.width * (active.scaleX || 1)))
          }
          
          if (active.opacity !== undefined) setOpacity(Math.round(active.opacity * 100))
        } else {
          setSelectedObject(null)
        }
      } catch (e) { console.error(e) }
    }

    const canvas = window.fabricCanvas
    if (canvas) {
      canvas.on('selection:created', updateSelection)
      canvas.on('selection:updated', updateSelection)
      canvas.on('selection:cleared', () => setSelectedObject(null))
    }

    const pollInterval = setInterval(() => {
      if (window.selectedFabricObject && !selectedObject) updateSelection()
    }, 500)

    return () => {
      clearInterval(pollInterval)
      if (canvas) {
        canvas.off('selection:created', updateSelection)
        canvas.off('selection:updated', updateSelection)
        canvas.off('selection:cleared')
      }
    }
  }, [selectedObject])

  // --- ACTIONS ---
  
  const applyColor = (color) => {
    setSelectedColor(color)
    const obj = window.fabricCanvas?.getActiveObject()
    if (obj) {
      obj.set('fill', color)
      window.fabricCanvas.renderAll()
    }
  }

  const applySize = (val) => {
    setSize(val)
    const obj = window.fabricCanvas?.getActiveObject()
    if (obj) {
      if (obj.fontSize) obj.set('fontSize', parseInt(val))
      else obj.scaleToWidth(parseInt(val))
      window.fabricCanvas.renderAll()
    }
  }

  const applyOpacity = (val) => {
    setOpacity(val)
    const obj = window.fabricCanvas?.getActiveObject()
    if (obj) {
      obj.set('opacity', val / 100)
      window.fabricCanvas.renderAll()
    }
  }

  const alignObject = (position) => {
    const canvas = window.fabricCanvas
    const obj = canvas?.getActiveObject()
    if (!obj || !canvas) return

    switch(position) {
      case 'left': obj.set({left: 0}); break;
      case 'center-h': obj.centerH(); break;
      case 'right': obj.set({left: canvas.width - (obj.width * obj.scaleX)}); break;
      case 'top': obj.set({top: 0}); break;
      case 'center-v': obj.centerV(); break;
      case 'bottom': obj.set({top: canvas.height - (obj.height * obj.scaleY)}); break;
    }
    obj.setCoords()
    canvas.renderAll()
  }

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
      // Calculate multiplier for high res export
      let mult = 1
      if(exportDimension === '1080x1920') mult = 2 // Export at full HD
      
      const dataURL = canvas.toDataURL({
        format: exportFormat,
        quality: 1,
        multiplier: mult
      })
      
      // Restore original background color
      canvas.setBackgroundColor(originalBgColor, () => {
        canvas.renderAll()
      })
      
      const link = document.createElement('a')
      link.href = dataURL
      link.download = `design-${Date.now()}.${exportFormat}`
      link.click()
    }, 100)
  }

  const updateLayers = () => {
    const canvas = window.fabricCanvas
    if (!canvas) return
    
    const objects = canvas.getObjects()
    const totalObjects = objects.length
    
    const layerList = objects.map((obj, idx) => {
      // Categorize into layers based on position
      let layerGroup = 'middle'
      if (idx === 0) layerGroup = 'bottom' // First object = bottom layer
      if (idx === totalObjects - 1) layerGroup = 'top' // Last object = top layer
      
      return {
        id: obj.id || `obj-${idx}`,
        name: obj.name || `${obj.type || 'Object'} ${idx}`,
        object: obj,
        locked: obj.lockMovementX || false,
        visible: obj.opacity !== 0,
        index: idx,
        zIndex: idx,
        layerGroup: layerGroup,
        canMoveUp: idx < totalObjects - 1, // Can go up if not at top
        canMoveDown: idx > 0 // Can go down if not at bottom
      }
    }).reverse() // Show newest first (top to bottom)
    
    setLayers(layerList)
  }

  const toggleLock = (obj) => {
    const isLocked = obj.lockMovementX
    obj.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      hasControls: isLocked
    })
    window.fabricCanvas.renderAll()
    updateLayers()
  }

  const toggleVisibility = (obj) => {
    obj.set({ opacity: obj.opacity === 0 ? 1 : 0 })
    window.fabricCanvas.renderAll()
    updateLayers()
  }

  const selectLayer = (obj) => {
    const canvas = window.fabricCanvas
    canvas.setActiveObject(obj)
    canvas.renderAll()
  }

  const bringForward = (obj) => {
    const canvas = window.fabricCanvas
    if (!canvas) return
    
    try {
      const idx = canvas._objects.indexOf(obj)
      console.log('[LAYERS] bringForward - current index:', idx, 'total objects:', canvas._objects.length)
      
      if (idx >= 0 && idx < canvas._objects.length - 1) {
        // Remove and re-insert one position forward
        canvas._objects.splice(idx, 1)
        canvas._objects.splice(idx + 1, 0, obj)
        canvas.renderAll()
        updateLayers()
        console.log('[LAYERS] ✓ Brought forward to index:', idx + 1)
      }
    } catch (e) {
      console.error('[LAYERS] bringForward error:', e)
    }
  }

  const sendBackward = (obj) => {
    const canvas = window.fabricCanvas
    if (!canvas) return
    
    try {
      const idx = canvas._objects.indexOf(obj)
      console.log('[LAYERS] sendBackward - current index:', idx)
      
      if (idx > 0) {
        // Remove and re-insert one position backward
        canvas._objects.splice(idx, 1)
        canvas._objects.splice(idx - 1, 0, obj)
        canvas.renderAll()
        updateLayers()
        console.log('[LAYERS] ✓ Sent backward to index:', idx - 1)
      }
    } catch (e) {
      console.error('[LAYERS] sendBackward error:', e)
    }
  }

  const getLayerGroupLabel = (group) => {
    switch(group) {
      case 'bottom': return '🔵 BOTTOM LAYER (Foundation)'
      case 'top': return '🔴 TOP LAYER (Enforcement)'
      case 'middle': return '🟡 MIDDLE LAYERS (Workspace)'
      default: return group
    }
  }

  const getLayerGroupColor = (group) => {
    switch(group) {
      case 'bottom': return 'bg-blue-50 border-blue-200'
      case 'top': return 'bg-red-50 border-red-200'
      case 'middle': return 'bg-amber-50 border-amber-200'
      default: return 'bg-white'
    }
  }

  // Update layers when canvas changes
  useEffect(() => {
    const canvas = window.fabricCanvas
    if (!canvas) return
    
    const updateOnChange = () => updateLayers()
    
    canvas.on('object:added', updateOnChange)
    canvas.on('object:removed', updateOnChange)
    canvas.on('object:modified', updateOnChange)
    
    updateLayers()
    
    return () => {
      canvas.off('object:added', updateOnChange)
      canvas.off('object:removed', updateOnChange)
      canvas.off('object:modified', updateOnChange)
    }
  }, [])

  // --- RENDER ---
  return (
    <div className="w-72 h-full bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col font-sans text-slate-800 dark:text-slate-100 shadow-xl z-30 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Properties</h2>
        
        {/* Segmented Control */}
        <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-600 transition-colors duration-300">
          <button 
            onClick={() => setActivePanel('layers')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activePanel === 'layers' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Layers
          </button>
          <button 
            onClick={() => setActivePanel('properties')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activePanel === 'properties' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Edit
          </button>
          <button 
            onClick={() => setActivePanel('export')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activePanel === 'export' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        
        {/* === LAYERS PANEL === */}
        {activePanel === 'layers' && (
          <div className="space-y-4">
            {/* Layer Architecture Info */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3 mb-4 transition-colors duration-300">
              <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase mb-2">📚 Stack of Glass</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-relaxed">
                Layers work like transparent glass sheets stacked on top of each other. Opaque pixels block what's below, transparent pixels show through.
              </p>
            </div>

            {layers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mb-3">
                  <span className="text-xl">📋</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">No layers yet. Add images or shapes to the canvas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Group layers by type */}
                {['top', 'middle', 'bottom'].map((group) => {
                  const groupLayers = layers.filter(l => l.layerGroup === group)
                  if (groupLayers.length === 0) return null
                  
                  return (
                    <div key={group} className="space-y-2">
                      {/* Group Header */}
                      <div className={`p-2 rounded-lg border ${getLayerGroupColor(group)}`}>
                        <p className="text-xs font-bold text-slate-700">{getLayerGroupLabel(group)}</p>
                      </div>
                      
                      {/* Layers in Group */}
                      <div className="space-y-2 ml-2">
                        {groupLayers.map((layer) => (
                          <div
                            key={layer.id}
                            onClick={() => selectLayer(layer.object)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                              selectedObject === layer.object
                                ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-600 shadow-md ring-1 ring-indigo-200 dark:ring-indigo-700'
                                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Layer Name & Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{layer.name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">Z-Index: {layer.zIndex}</p>
                              </div>

                              {/* Z-Order Controls */}
                              <div className="flex gap-0.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    bringForward(layer.object)
                                  }}
                                  disabled={!layer.canMoveUp}
                                  className={`p-1 rounded transition-colors ${
                                    layer.canMoveUp 
                                      ? 'hover:bg-blue-100 cursor-pointer' 
                                      : 'opacity-30 cursor-not-allowed'
                                  }`}
                                  title="Bring Forward (Move Up)"
                                >
                                  <span className="text-xs">⬆️</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    sendBackward(layer.object)
                                  }}
                                  disabled={!layer.canMoveDown}
                                  className={`p-1 rounded transition-colors ${
                                    layer.canMoveDown 
                                      ? 'hover:bg-blue-100 cursor-pointer' 
                                      : 'opacity-30 cursor-not-allowed'
                                  }`}
                                  title="Send Backward (Move Down)"
                                >
                                  <span className="text-xs">⬇️</span>
                                </button>
                              </div>

                              {/* Visibility Toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleVisibility(layer.object)
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                title={layer.visible ? 'Hide layer' : 'Show layer'}
                              >
                                {layer.visible ? (
                                  <span className="text-sm">👁️</span>
                                ) : (
                                  <span className="text-sm opacity-30">👁️</span>
                                )}
                              </button>

                              {/* Lock Toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLock(layer.object)
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                              >
                                {layer.locked ? (
                                  <span className="text-sm">🔒</span>
                                ) : (
                                  <span className="text-sm opacity-40">🔓</span>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {/* === PROPERTIES PANEL === */}
        {activePanel === 'properties' && (
          <div className="space-y-6">
            {!selectedObject ? (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-50">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mb-3">
                  <span className="text-xl">👆</span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select an element<br/>to edit properties</p>
              </div>
            ) : (
              <>
                {/* 1. LAYOUT / ALIGNMENT */}
                <div className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm transition-colors duration-300">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Alignment</p>
                  <div className="grid grid-cols-3 gap-1">
                    {['left', 'center-h', 'right', 'top', 'center-v', 'bottom'].map((align) => (
                      <button 
                        key={align} 
                        onClick={() => alignObject(align)}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-center border border-transparent hover:border-slate-300 dark:hover:border-slate-500"
                        title={align}
                      >
                        {/* Simple Icons using text/symbols for efficiency */}
                        {align === 'left' && '⇤'}
                        {align === 'center-h' && '↔'}
                        {align === 'right' && '⇥'}
                        {align === 'top' && '⤒'}
                        {align === 'center-v' && '↕'}
                        {align === 'bottom' && '⤓'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. FILL / COLOR */}
                <div className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Fill</p>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded uppercase">{selectedColor}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="relative w-10 h-10 rounded-full border border-slate-300 dark:border-slate-500 shadow-inner overflow-hidden">
                      <input 
                        type="color" 
                        value={selectedColor} 
                        onChange={(e) => applyColor(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 flex gap-1">
                      {/* Quick Presets */}
                      {['#000000', '#ffffff', '#ef4444', '#3b82f6'].map(c => (
                        <button key={c} onClick={()=>applyColor(c)} className="w-6 h-6 rounded-full border border-slate-200 shadow-sm" style={{backgroundColor:c}} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. SIZE & OPACITY */}
                <div className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm space-y-4 transition-colors duration-300">
                  
                  {/* Size Slider */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Size</p>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{size}px</span>
                    </div>
                    <input 
                      type="range" min="10" max="500" value={size} 
                      onChange={(e) => applySize(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Opacity</p>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{opacity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={opacity} 
                      onChange={(e) => applyOpacity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* === EXPORT PANEL === */}
        {activePanel === 'export' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm space-y-4 transition-colors duration-300">
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 block">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['png', 'jpg'].map(fmt => (
                    <button 
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        exportFormat === fmt 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 block">Size Preset</label>
                <div className="space-y-2">
                  {[
                    { id: '1080x1920', label: 'Story / Reel', dim: '1080 x 1920' },
                    { id: '1080x1080', label: 'Square Post', dim: '1080 x 1080' },
                    { id: '500x500', label: 'Preview', dim: '500 x 500' }
                  ].map((opt) => (
                    <button 
                      key={opt.id}
                      onClick={() => setExportDimension(opt.id)}
                      className={`w-full p-2 text-left rounded-lg border transition-all flex justify-between items-center ${
                        exportDimension === opt.id 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900' 
                        : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <span className={`text-xs font-medium ${exportDimension === opt.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{opt.dim}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button 
              onClick={handleExport}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all transform active:scale-95"
            >
              Download Design ⬇
            </button>
          </div>
        )}

      </div>

      {/* Dark Mode Toggle - Bottom Right Corner */}
      <div className="absolute bottom-4 right-4 z-40">
        <DarkModeToggle position="relative" />
      </div>
    </div>
  )
}