import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { fabric } from 'fabric'
import { 
  getAbsoluteUrl, 
  generateLogoApi, 
  generateAdCopyApi, 
  uploadOriginalAssetApi, 
  removeBackgroundApi, 
  extractColorsApi, 
  proxyImageApi,
  generateVectorMonogramLogo,
  compositeLogoWithText
} from '../../services/api'

function LeftSidebar() {
  // --- ASSET STATE ---
  const [activeTab, setActiveTab] = useState('assets') // 'assets' | 'ai'
  const [assets, setAssets] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [paletteColors, setPaletteColors] = useState(['#0f172a', '#3b82f6', '#10b981', '#6366f1', '#f59e0b'])

  // --- AI LOGO STATE ---
  const [aiBrandName, setAiBrandName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedStyles, setSelectedStyles] = useState(['Modern'])
  const [selectedModel, setSelectedModel] = useState('pollinations')
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [generatedLogo, setGeneratedLogo] = useState(null)
  const [logoImageData, setLogoImageData] = useState(null)
  
  // Style options for mix & match
  const logoStyles = [
    'Modern', 'Vintage', 'Minimalist', 'Luxury', 'Tech',
    'Playful', 'Organic', 'Abstract', '3D', 'Sports'
  ]
  
  const toggleStyle = (style) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  // --- AI TEXT STATE ---
  const [aiProduct, setAiProduct] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [aiTone, setAiTone] = useState('Professional')
  const [copyLoading, setCopyLoading] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [generatedCopy, setGeneratedCopy] = useState(null)

  // 1. Start with empty assets (current session only)
  useEffect(() => {
    setAssets([])
  }, [])

  // 2. Load logo image - try fetch first, fall back to proxy/monogram
  useEffect(() => {
    if (!generatedLogo || logoImageData) return
    
    const loadLogoImage = async () => {
      try {
        let rawImageData = null
        try {
          const response = await fetch(generatedLogo.url)
          if (response.ok) {
            const blob = await response.blob()
            rawImageData = await new Promise((res) => {
              const r = new FileReader()
              r.onload = () => res(r.result)
              r.readAsDataURL(blob)
            })
          }
        } catch (fetchErr) {
          console.warn('Direct fetch failed, trying proxy...')
        }
        
        if (!rawImageData) {
          const proxyRes = await proxyImageApi(generatedLogo.url)
          if (proxyRes.status === 'success' && proxyRes.data && !proxyRes.data.includes('error')) {
            rawImageData = proxyRes.data
          }
        }

        if (!rawImageData || rawImageData.includes('error')) {
          rawImageData = await generateVectorMonogramLogo(aiBrandName, selectedStyles)
        }

        setLogoImageData(rawImageData)
      } catch (e) {
        console.error('Logo loading error:', e.message)
        const vectorFallback = await generateVectorMonogramLogo(aiBrandName, selectedStyles)
        setLogoImageData(vectorFallback)
      }
    }
    
    loadLogoImage()
  }, [generatedLogo, logoImageData])

  // 3. Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)

    try {
        // Upload original image
        const res = await uploadOriginalAssetApi(file)
        const assetId = res.id || Date.now()
        const originalUrl = res.url
        
        // Create original asset
        const originalAsset = { 
          id: `${assetId}_orig`, 
          url: originalUrl,
          type: 'original',
          file: file
        }
        setAssets(prev => [...prev, originalAsset])
        
        // Background removal automatically run
        try {
          const bgRes = await removeBackgroundApi(file)
          if (bgRes && bgRes.url) {
            const processedAsset = {
              id: `${assetId}_processed`,
              url: bgRes.url,
              type: 'processed',
              originalId: `${assetId}_orig`
            }
            setAssets(prev => [...prev, processedAsset])
          }
        } catch (bgError) {
          console.log('Background removal skipped or completed inline')
        }
        
        // Extract colors
        const colorRes = await extractColorsApi(file)
        if (colorRes && colorRes.colors && colorRes.colors.length > 0) {
          setPaletteColors(colorRes.colors)
        }
    } catch (e) { 
        alert("Upload Error: " + (e.message || "Failed to process asset")) 
    }
    setIsUploading(false)
  }

  // Delete asset from session state
  const deleteAsset = (assetIdToDelete) => {
    setAssets(prev => prev.filter(a => a.id !== assetIdToDelete && a.originalId !== assetIdToDelete))
  }

  // Trigger manual background removal on demand
  const triggerManualBgRemoval = async (asset) => {
    if (!asset || !asset.file) return alert("Original file data unavailable for processing")
    try {
      const bgRes = await removeBackgroundApi(asset.file)
      if (bgRes && bgRes.url) {
        const processedAsset = {
          id: `${asset.id}_processed_${Date.now()}`,
          url: bgRes.url,
          type: 'processed',
          originalId: asset.id
        }
        setAssets(prev => [...prev, processedAsset])
      }
    } catch (err) {
      alert("Background removal error: " + err.message)
    }
  }

  // Color click
  const handleColorClick = (hex) => {
    const canvas = window.fabricCanvas
    if (!canvas) return alert("Canvas not ready")
    
    const active = canvas.getActiveObject()
    if (!active) return alert("Select an object on the canvas first!")
    
    if (active.type === 'i-text' || active.type === 'textbox') {
      active.set('fill', hex)
    } else {
      active.set('fill', hex)
      if (!active.stroke || active.stroke === 'transparent') {
        active.set('stroke', hex)
        active.set('strokeWidth', 2)
      }
    }
    canvas.renderAll()
  }

  // AI: Generate Logo
  const generateLogo = async () => {
    if (!aiBrandName.trim()) return setLogoError('Enter brand name')
    if (selectedStyles.length === 0) return setLogoError('Select at least one style')
    
    setGeneratedLogo(null)
    setLogoImageData(null)
    setLogoLoading(true)
    setLogoError('')

    try {
        const res = await generateLogoApi({
            brand_name: aiBrandName, 
            styles: selectedStyles,
            style: selectedStyles[0],
            model: selectedModel,
            custom_prompt: customPrompt
        })
        setGeneratedLogo({ url: res.url, originalUrl: res.url })
    } catch (e) { 
        setLogoError("AI Error: " + (e.response?.data?.detail || e.message)) 
    }
    setLogoLoading(false)
  }

  // AI: Generate Copy
  const generateAdCopy = async () => {
    if (!aiProduct.trim()) return setCopyError('Enter product name')
    
    setGeneratedCopy(null)
    setCopyLoading(true)
    setCopyError('')
    
    try {
        const res = await generateAdCopyApi({
            product_name: aiProduct, 
            description: productDesc, 
            tone: aiTone
        })
        setGeneratedCopy(res)
    } catch (e) { 
        setCopyError("AI Error: " + (e.response?.data?.detail || e.message)) 
    }
    setCopyLoading(false)
  }

  // Helpers to Add to Canvas
  const addImage = (url) => {
      const canvas = window.fabricCanvas
      if (!canvas) return
      
      const absoluteUrl = getAbsoluteUrl(url)
      fabric.Image.fromURL(absoluteUrl, (img) => {
          if(!img) return
          img.scaleToWidth(400)
          img.set({left: 540, top: 960, originX:'center', originY:'center'})
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
      }, {crossOrigin:'anonymous'})
  }

  const addLogoToCanvas = (url, brandName) => {
      const canvas = window.fabricCanvas
      if (!canvas) return
      
      const absoluteUrl = getAbsoluteUrl(url)
      fabric.Image.fromURL(absoluteUrl, (img) => {
          if(!img) return
          img.scaleToWidth(320)
          img.set({left: 540, top: 850, originX:'center', originY:'center'})
          canvas.add(img)
          
          if (brandName && brandName.trim()) {
            const t = new fabric.IText(brandName.trim(), { 
                left: 540, 
                top: 1050, 
                originX: 'center', 
                originY: 'center',
                fontSize: 48, 
                fontWeight: 'bold',
                fill: '#0f172a',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center'
            })
            canvas.add(t)
            canvas.setActiveObject(t)
          } else {
            canvas.setActiveObject(img)
          }
          
          canvas.renderAll()
      }, {crossOrigin:'anonymous'})
  }

  const addText = (text, isHeadline) => {
      const canvas = window.fabricCanvas
      if (!canvas) return
      const t = new fabric.IText(text, { 
          left: 540, top: isHeadline?400:800, originX:'center', 
          fontSize: isHeadline?56:28, width: 800, textAlign:'center',
          fontFamily: 'Inter, sans-serif'
      })
      canvas.add(t)
      canvas.setActiveObject(t)
      canvas.renderAll()
  }

  return (
    <div className="w-80 h-full bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200 select-none">
      
      {/* REDESIGNED LOGO & APP BRAND HEADER */}
      <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-700 dark:from-indigo-600 dark:to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            ✨
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                InstaGen
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60 uppercase">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">AI Creative Content Suite</p>
          </div>
        </div>
      </div>
      
      {/* NAVIGATION TABS */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex bg-slate-200/60 dark:bg-slate-800 rounded-xl p-1 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
          <button 
            onClick={()=>setActiveTab('assets')} 
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab==='assets' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            📁 Assets Library
          </button>
          <button 
            onClick={()=>setActiveTab('ai')} 
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab==='ai' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            ✨ AI Generator
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5 custom-scrollbar">
        
        {/* === TAB 1: ASSETS === */}
        {activeTab === 'assets' && (
           <>
             {/* Upload Dropzone */}
             <div 
               onClick={() => fileInputRef.current.click()}
               className="group flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800/80 transition-all bg-white/50 dark:bg-slate-800/40 p-4 text-center"
             >
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept="image/*"/>
                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-full shadow-xs flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <span className="text-base text-indigo-600 dark:text-indigo-400">☁️</span>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {isUploading ? 'Processing Asset...' : 'Upload Image'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">PNG, JPG, WebP supported</span>
             </div>

             {/* Brand Colors Palette */}
             <div className="bg-white dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Brand Palette</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Auto Extracted</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {paletteColors.map((c, idx) => (
                        <button key={idx} onClick={()=>handleColorClick(c)} 
                                className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 shadow-xs hover:scale-110 transition-all focus:ring-2 focus:ring-indigo-500 cursor-pointer" 
                                style={{backgroundColor:c}} title="Click to apply to active canvas selection" />
                    ))}
                </div>
             </div>

             {/* Asset Grid List */}
             <div>
               <div className="flex items-center justify-between mb-3">
                 <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Session Assets</p>
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{assets.length} items</span>
               </div>
               
               <div className="space-y-3.5">
                 {assets.length === 0 ? (
                    <div className="py-8 text-center bg-white/40 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs italic">
                      No assets uploaded yet. Upload an image above to start!
                    </div>
                 ) : (
                   (() => {
                     // Group assets by original ID
                     const grouped = {}
                     assets.forEach(a => {
                       let groupId = a.type === 'processed' ? (a.originalId || a.id) : a.id
                       if (!grouped[groupId]) grouped[groupId] = {}
                       if (a.type === 'processed') grouped[groupId].processed = a
                       else grouped[groupId].original = a
                     })
                     
                     return Object.entries(grouped).map(([groupId, group], idx) => {
                       const mainAsset = group.original || group.processed
                       return (
                         <div key={groupId} className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
                           
                           {/* Asset Card Header with DELETE button */}
                           <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                             <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                               Asset #{idx + 1}
                             </span>
                             
                             <button 
                               onClick={() => deleteAsset(groupId)}
                               className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                               title="Remove asset from session"
                             >
                               <span className="text-xs">🗑️</span>
                             </button>
                           </div>
                           
                           {/* Asset Card Image Grid */}
                           <div className="grid grid-cols-2 gap-2 p-3">
                             {/* ORIGINAL IMAGE */}
                             {group.original && (
                               <div>
                                 <div className="flex items-center justify-between mb-1.5">
                                   <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Original</span>
                                   {!group.processed && (
                                     <button 
                                       onClick={() => triggerManualBgRemoval(group.original)}
                                       className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                       title="Remove background"
                                     >
                                       ✂️ Remove BG
                                     </button>
                                   )}
                                 </div>
                                 <div 
                                   className="group relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 aspect-square"
                                   draggable="true"
                                   onDragStart={(e) => {
                                     const imageUrl = getAbsoluteUrl(group.original.url)
                                     e.dataTransfer.setData('assetURL', imageUrl)
                                   }}
                                 >
                                   <img src={getAbsoluteUrl(group.original.url)} className="w-full h-full object-contain p-1" alt="original" />
                                   <div 
                                     className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                     onClick={() => addImage(group.original.url)}
                                   >
                                     <span className="px-2 py-1 bg-white text-slate-900 rounded-md text-[10px] font-bold shadow-xs">+ Add</span>
                                   </div>
                                 </div>
                               </div>
                             )}
                             
                             {/* PROCESSED (NO-BG) IMAGE */}
                             <div>
                               <div className="flex items-center justify-between mb-1.5">
                                 <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">No-BG Cutout</span>
                               </div>
                               {group.processed ? (
                                 <div 
                                   className="group relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 aspect-square"
                                   draggable="true"
                                   onDragStart={(e) => {
                                     const imageUrl = getAbsoluteUrl(group.processed.url)
                                     e.dataTransfer.setData('assetURL', imageUrl)
                                   }}
                                 >
                                   <img src={getAbsoluteUrl(group.processed.url)} className="w-full h-full object-contain p-1" alt="processed transparent" />
                                   <div 
                                     className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                     onClick={() => addImage(group.processed.url)}
                                   >
                                     <span className="px-2 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold shadow-xs">+ Add</span>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="w-full aspect-square rounded-lg bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 text-center">
                                   <div className="text-center">
                                     <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Transparent Layer</span>
                                     <button 
                                       onClick={() => group.original && triggerManualBgRemoval(group.original)}
                                       className="mt-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded text-[9px] font-semibold hover:bg-indigo-100 transition-colors"
                                     >
                                       Cut Out
                                     </button>
                                   </div>
                                 </div>
                               )}
                             </div>
                           </div>

                         </div>
                       )
                     })
                   })()
                 )}
               </div>
             </div>
           </>
        )}

        {/* === TAB 2: AI TOOLS === */}
        {activeTab === 'ai' && (
           <div className="space-y-6">
             
             {/* AI LOGO GENERATOR */}
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-3.5">
               <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                 <span>🎨</span>
                 <span>AI Logo Generator</span>
               </h3>
               
               <div className="space-y-3">
                 <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">AI Engine Model</label>
                    <select 
                      value={selectedModel} 
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="pollinations">🌸 Pollinations FLUX.1 Engine (Free)</option>
                      <option value="sdxl">⚡ Stability AI SDXL Turbo</option>
                      <option value="imagen">🎨 Google Imagen 3</option>
                      <option value="hf-flux">🤗 Hugging Face FLUX.1</option>
                      <option value="vector">💎 Vector Monogram Engine</option>
                    </select>
                  </div>
                 
                 <div>
                   <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand Name</label>
                   <input className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                          placeholder="e.g. InstaGen Studio" 
                          value={aiBrandName} onChange={e=>setAiBrandName(e.target.value)} />
                 </div>

                 <div>
                   <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Custom Style Prompt (Optional)</label>
                   <input className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                          placeholder="e.g. Minimalist geometric emblem" 
                          value={customPrompt} onChange={e=>setCustomPrompt(e.target.value)} />
                 </div>
                 
                 <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Style Categories</label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      {logoStyles.map(style => (
                        <label key={style} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-600/60 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedStyles.includes(style)}
                            onChange={() => toggleStyle(style)}
                            className="w-3.5 h-3.5 rounded accent-indigo-600"
                          />
                          <span className="text-[11px] text-slate-700 dark:text-slate-300">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                 <button onClick={generateLogo} disabled={logoLoading} 
                         className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs disabled:opacity-50 transition-all shadow-xs">
                   {logoLoading ? '✨ Generating Logo...' : 'Generate Logo'}
                 </button>

                 {logoError && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-800">{logoError}</p>}

                 {generatedLogo && !logoLoading && (
                    <div className="pt-2 space-y-2">
                       {logoImageData ? (
                         <>
                           <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                             <img src={logoImageData} className="w-full object-contain rounded" alt="Generated Logo" />
                           </div>
                           <button 
                             onClick={() => addLogoToCanvas(generatedLogo.originalUrl, aiBrandName)}
                             className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1"
                           >
                             <span>✨ Add to Canvas</span>
                           </button>
                         </>
                       ) : (
                         <div className="w-full h-24 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                           <span className="text-xs text-slate-500">Loading Logo Image...</span>
                         </div>
                       )}
                    </div>
                 )}
               </div>
             </div>

             {/* AI COPYWRITER */}
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-3">
               <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                 <span>✍️</span>
                 <span>AI Copywriter</span>
               </h3>

               <div className="space-y-2.5">
                 <input className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Product / Brand Name" 
                        value={aiProduct} onChange={e=>setAiProduct(e.target.value)} />
                 
                 <input className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Brief Product Description" 
                        value={productDesc} onChange={e=>setProductDesc(e.target.value)} />

                 <select className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" 
                         value={aiTone} onChange={e=>setAiTone(e.target.value)}>
                   <option>Professional</option><option>Casual</option><option>Exciting</option><option>Luxury</option>
                 </select>

                 <button onClick={generateAdCopy} disabled={copyLoading} 
                         className="w-full py-2 px-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs disabled:opacity-50 transition-all shadow-xs">
                   {copyLoading ? '🤔 Generating Copy...' : 'Generate Copy'}
                 </button>

                 {copyError && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-800">{copyError}</p>}

                 {generatedCopy && !copyLoading && (
                    <div className="space-y-2 pt-2">
                       <div onClick={()=>addText(generatedCopy.headline, true)} 
                            className="group p-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-all">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Headline (Click to Add)</span>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{generatedCopy.headline}</p>
                       </div>
                       <div onClick={()=>addText(generatedCopy.body, false)} 
                            className="group p-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-all">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Body Copy</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{generatedCopy.body}</p>
                       </div>
                    </div>
                 )}
               </div>
             </div>

           </div>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar