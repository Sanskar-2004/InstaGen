import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { fabric } from 'fabric'

function LeftSidebar() {
  // --- ASSET STATE ---
  const [activeTab, setActiveTab] = useState('assets') // 'assets' | 'ai'
  const [assets, setAssets] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [productCategory, setProductCategory] = useState('General') // NEW: Track product category
  const fileInputRef = useRef(null)
  const [paletteColors, setPaletteColors] = useState(['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'])

  // --- AI LOGO STATE ---
  const [aiBrandName, setAiBrandName] = useState('')
  const [selectedStyles, setSelectedStyles] = useState(['Modern'])
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [generatedLogo, setGeneratedLogo] = useState(null)
  const [logoImageData, setLogoImageData] = useState(null)
  
  // Style options for mix & match
  const logoStyles = [
    'Modern', 'Vintage', 'Minimalist', 'Luxury', 'Tech',
    'Playful', 'Organic', 'Abstract', '3D', 'Sports'
  ]
  
  // Toggle style selection for mix & match
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

  // 2. Load logo image - try fetch first, fall back to proxy
  useEffect(() => {
    if (!generatedLogo || logoImageData) return
    
    const loadLogoImage = async () => {
      try {
        console.log('Loading logo from:', generatedLogo.url.substring(0, 80))
        
        // Try no-cors fetch first
        try {
          const response = await fetch(generatedLogo.url, {
            mode: 'no-cors'
          })
          const blob = await response.blob()
          
          if (blob.size > 0) {
            const dataUrl = URL.createObjectURL(blob)
            setLogoImageData(dataUrl)
            console.log('Logo loaded directly')
            return
          }
        } catch (fetchErr) {
          console.warn('Direct fetch failed, trying proxy...')
        }
        
        // Fallback: use proxy endpoint
        console.log('Using proxy endpoint...')
        const proxyRes = await axios.post('http://localhost:8000/api/proxy-image', {
          url: generatedLogo.url
        })
        
        if (proxyRes.data.status === 'success') {
          setLogoImageData(proxyRes.data.data)
          console.log('Logo loaded via proxy')
        } else {
          throw new Error(proxyRes.data.detail)
        }
      } catch (e) {
        console.error('Logo loading error:', e.message)
        // Check if it's a Pollinations.ai backend issue (502 Bad Gateway)
        if (e.message.includes('502')) {
          setLogoError('Pollinations.ai service is temporarily unavailable. Please try again in a moment.')
        } else {
          setLogoError('Could not load image: ' + e.message)
        }
      }
    }
    
    loadLogoImage()
  }, [generatedLogo, logoImageData])

  // 4. Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
        // Upload original image (without processing)
        const res = await axios.post('http://localhost:8000/api/assets/upload-original', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        const assetId = res.data.id || Date.now()
        const originalUrl = res.data.url
        
        // Create original asset
        const originalAsset = { 
          id: `${assetId}_orig`, 
          url: originalUrl,
          type: 'original'
        }
        setAssets(prev => [...prev, originalAsset])
        
        // Try to remove background
        try {
          const bgFormData = new FormData()
          bgFormData.append('file', file)
          const bgRes = await axios.post('http://localhost:8000/api/assets/remove-background', bgFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          
          if (bgRes.data.url) {
            const processedAsset = {
              id: `${assetId}_processed`,
              url: bgRes.data.url,
              type: 'processed',
              originalId: `${assetId}_orig`
            }
            setAssets(prev => [...prev, processedAsset])
          }
        } catch (bgError) {
          console.log('Background removal not available, skipping')
        }
        
        // Extract colors
        const colorFormData = new FormData()
        colorFormData.append('file', file)
        const colorRes = await axios.post('http://localhost:8000/api/assets/extract-colors', colorFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (colorRes.data.colors) {
          setPaletteColors(colorRes.data.colors)
        }
    } catch (e) { 
        alert("Upload Failed. Check Backend Terminal.") 
    }
    setIsUploading(false)
  }

  // 5. Handle Color Click
  const handleColorClick = (hex) => {
    const canvas = window.fabricCanvas
    if (!canvas) return alert("Canvas not ready")
    
    const active = canvas.getActiveObject()
    if (!active) return alert("Select an object first!")
    
    if (active.type === 'i-text' || active.type === 'textbox') {
      active.set('fill', hex)
    } else if (active.type === 'image') {
      active.set('opacity', 0.8)
      // Note: overlayColor is not standard fabric.js image property, using opacity tint concept for now
      // For true tinting, filters are needed, but keeping logic as requested
    } else {
      active.set('fill', hex)
      if (!active.stroke || active.stroke === 'transparent') {
        active.set('stroke', hex)
        active.set('strokeWidth', 2)
      }
    }
    canvas.renderAll()
  }

  // 6. AI: Generate Logo
  const generateLogo = async () => {
    if (!aiBrandName.trim()) return setLogoError('Enter brand name')
    if (selectedStyles.length === 0) return setLogoError('Select at least one style')
    
    setGeneratedLogo(null)
    setLogoImageData(null)
    setLogoLoading(true)
    setLogoError('')

    try {
        // Send selected styles array to backend
        const res = await axios.post('http://localhost:8000/api/ai/generate-logo', {
            brand_name: aiBrandName, 
            styles: selectedStyles,  // Send array of selected styles for mix & match
            style: selectedStyles[0]  // Keep single style for backward compatibility
        })
        setGeneratedLogo({ url: res.data.url, originalUrl: res.data.url })
    } catch (e) { 
        setLogoError("AI Error: " + (e.response?.data?.detail || e.message)) 
    }
    setLogoLoading(false)
  }

  // 5. AI: Generate Copy
  const generateAdCopy = async () => {
    if (!aiProduct.trim()) return setCopyError('Enter product name')
    
    setGeneratedCopy(null)
    setCopyLoading(true)
    setCopyError('')
    
    try {
        const res = await axios.post('http://localhost:8000/api/ai/generate-text', {
            product_name: aiProduct, description: productDesc, tone: aiTone
        })
        setGeneratedCopy(res.data)
    } catch (e) { 
        setCopyError("AI Error: " + (e.response?.data?.detail || e.message)) 
    }
    setCopyLoading(false)
  }

  // 6. Helpers to Add to Canvas
  const addImage = (url) => {
      const canvas = window.fabricCanvas
      if (!canvas) return
      
      const absoluteUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`
      
      fabric.Image.fromURL(absoluteUrl, (img) => {
          if(!img) return
          img.scaleToWidth(400)
          img.set({left: 540, top: 960, originX:'center', originY:'center'})
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
      }, {crossOrigin:'anonymous'})
  }

  const addText = (text, isHeadline) => {
      const canvas = window.fabricCanvas
      if (!canvas) return
      const t = new fabric.IText(text, { 
          left: 540, top: isHeadline?400:800, originX:'center', 
          fontSize: isHeadline?60:30, width: 800, textAlign:'center'
      })
      canvas.add(t)
      canvas.setActiveObject(t)
      canvas.renderAll()
  }

  return (
    <div className="w-80 h-full bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* APP NAME HEADER */}
      <div className="px-6 pt-6 pb-3 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">InstaGen</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Design Studio</p>
      </div>
      
      {/* HEADER / TABS */}
      <div className="px-6 pt-4 pb-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Library</h2>
        <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-600 transition-colors duration-300">
          <button 
            onClick={()=>setActiveTab('assets')} 
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab==='assets' ? 'bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Assets
          </button>
          <button 
            onClick={()=>setActiveTab('ai')} 
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab==='ai' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            AI Tools
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 custom-scrollbar">
        
        {/* === TAB: ASSETS === */}
        {activeTab === 'assets' && (
           <>
             {/* Upload Area */}
             <div 
               onClick={() => fileInputRef.current.click()}
               className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition-all bg-slate-100/50 dark:bg-slate-700/30"
             >
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept="image/*"/>
                <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="text-xl text-indigo-500">☁️</span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {isUploading ? 'Uploading...' : 'Click to Upload'}
                </span>
             </div>

             {/* Product Category Selector - for Compliance */}
             <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3 transition-colors duration-300">
               <label className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide block mb-2">🍺 Product Category</label>
               <select 
                 value={productCategory} 
                 onChange={(e) => setProductCategory(e.target.value)}
                 className="w-full px-2 py-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors duration-300"
               >
                 <option>General</option>
                 <option>Alcohol</option>
                 <option>Food & Beverage</option>
                 <option>Beauty</option>
                 <option>Health</option>
                 <option>Other</option>
               </select>
               {productCategory === 'Alcohol' && (
                 <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1.5 font-medium">⚠️ Drinkaware warning will be added to canvas</p>
               )}
             </div>

             {/* Color Palette */}
             <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Brand Colors</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Auto-extracted</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {paletteColors.map((c, idx) => (
                        <button key={idx} onClick={()=>handleColorClick(c)} 
                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm hover:scale-110 hover:shadow-md transition-all focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-slate-800" 
                                style={{backgroundColor:c}} title="Click to apply color" />
                    ))}
                </div>
             </div>

             {/* Asset Grid */}
             <div>
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Your Uploads</p>
               <div className="space-y-4">
                 {assets.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                      No assets yet. Upload one above!
                    </div>
                 ) : (
                   (() => {
                     // Group assets by original ID - be explicit about type
                     const grouped = {}
                     assets.forEach(a => {
                       let groupId, isProcessed
                       
                       // Check ID pattern first
                       if (a.id.includes('_orig')) {
                         groupId = a.id
                         isProcessed = false
                       } else if (a.id.includes('_processed')) {
                         groupId = a.originalId || a.id.replace('_processed', '_orig')
                         isProcessed = true
                       } else {
                         groupId = a.type === 'original' ? a.id : a.originalId || a.id
                         isProcessed = a.type === 'processed'
                       }
                       
                       if (!grouped[groupId]) grouped[groupId] = {}
                       if (isProcessed) grouped[groupId].processed = a
                       else grouped[groupId].original = a
                     })
                     
                     return Object.entries(grouped).map(([groupId, group]) => (
                       <div key={groupId} className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm">
                         
                         {/* Section Header */}
                         <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                           <p className="text-xs font-semibold text-slate-600">Image {Object.entries(grouped).findIndex(([id]) => id === groupId) + 1}</p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 p-3">
                           {/* ORIGINAL IMAGE */}
                           {group.original && (
                             <div>
                               <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase">Original</p>
                               <div className="group relative rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-slate-200 hover:shadow-md transition-all aspect-video"
                                    draggable="true"
                                    onDragStart={(e) => {
                                      const imageUrl = group.original.url.startsWith('http') ? group.original.url : `http://localhost:8000${group.original.url}`
                                      e.dataTransfer.setData('assetURL', imageUrl)
                                      e.dataTransfer.setData('imageUrl', imageUrl)
                                      e.dataTransfer.setData('category', productCategory)
                                      console.log('[DRAG START] Category being passed:', productCategory)
                                    }}>
                                 <img src={group.original.url.startsWith('http') ? group.original.url : `http://localhost:8000${group.original.url}`} className="w-full h-full object-cover" alt="original" />
                                 <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                      onClick={() => addImage(group.original.url.startsWith('http') ? group.original.url : `http://localhost:8000${group.original.url}`)}>
                                   <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                                     <span className="text-indigo-600 font-bold leading-none">+</span>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}
                           
                           {/* PROCESSED IMAGE */}
                           <div>
                             <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase">Processed</p>
                             {group.processed ? (
                               <div className="group relative rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-slate-200 hover:shadow-md transition-all aspect-video"
                                    draggable="true"
                                    onDragStart={(e) => {
                                      const imageUrl = group.processed.url.startsWith('http') ? group.processed.url : `http://localhost:8000${group.processed.url}`
                                      e.dataTransfer.setData('assetURL', imageUrl)
                                      e.dataTransfer.setData('imageUrl', imageUrl)
                                      e.dataTransfer.setData('category', productCategory)
                                      console.log('[DRAG START] Category being passed:', productCategory)
                                    }}>
                                 <img src={group.processed.url.startsWith('http') ? group.processed.url : `http://localhost:8000${group.processed.url}`} className="w-full h-full object-cover" alt="processed" />
                                 <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                      onClick={() => addImage(group.processed.url.startsWith('http') ? group.processed.url : `http://localhost:8000${group.processed.url}`)}>
                                   <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                                     <span className="text-indigo-600 font-bold leading-none">+</span>
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               <div className="w-full h-16 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-dashed border-slate-300 flex items-center justify-center">
                                 <div className="text-center">
                                   <div className="text-sm mb-0.5">⏳</div>
                                   <div className="text-[10px] text-slate-500">Processing...</div>
                                 </div>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     ))
                   })()
                 )}
               </div>
             </div>
           </>
        )}

        {/* === TAB: AI TOOLS === */}
        {activeTab === 'ai' && (
           <div className="space-y-8">
             
             {/* LOGO GENERATOR */}
             <div className="space-y-3">
               <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">🎨 Logo Generator</h3>
               
               <div className="space-y-3">
                 <div>
                   <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Brand Name</label>
                   <input className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-transparent transition-all" 
                          placeholder="e.g. Acme Corp" 
                          value={aiBrandName} onChange={e=>setAiBrandName(e.target.value)} />
                 </div>
                 
                 <div>
                   <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">🎭 Style Mix & Match</label>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Select one or more styles to combine</p>
                   <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-700 p-2 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors duration-300">
                     {logoStyles.map(style => (
                       <label key={style} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 p-1 rounded transition">
                         <input 
                           type="checkbox" 
                           checked={selectedStyles.includes(style)}
                           onChange={() => toggleStyle(style)}
                           className="w-4 h-4 rounded cursor-pointer accent-slate-600 dark:accent-slate-400"
                         />
                         <span className="text-xs text-slate-700 dark:text-slate-300">{style}</span>
                       </label>
                     ))}
                   </div>
                   {selectedStyles.length > 0 && (
                     <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">✨ Selected: {selectedStyles.join(', ')}</p>
                   )}
                 </div>

                 <button onClick={generateLogo} disabled={logoLoading} 
                         className="w-full py-2 px-3 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                   {logoLoading ? '✨ Generating...' : 'Generate Logo'}
                 </button>

                 {logoError && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800">{logoError}</p>}

                 {generatedLogo && !logoLoading && (
                   <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      {logoImageData ? (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 transition-colors duration-300">
                          <img 
                            src={logoImageData} 
                            className="w-full" 
                            alt="Generated Logo"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all cursor-pointer flex items-center justify-center"
                               onClick={() => addImage(generatedLogo.originalUrl)}>
                             <span className="opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold px-3 py-2 rounded-lg shadow-md transform scale-90 group-hover:scale-100 transition-all">
                               Add to Canvas
                             </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center transition-colors duration-300">
                          <div className="text-center">
                            <div className="animate-spin h-6 w-6 border-2 border-slate-300 dark:border-slate-600 border-t-slate-900 dark:border-t-slate-100 rounded-full mx-auto mb-2"></div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Loading image...</p>
                          </div>
                        </div>
                      )}
                   </div>
                 )}
               </div>
             </div>

             {/* AD COPY WRITER */}
             <div className="space-y-3">
               <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">✍️ Copywriter</h3>

               <div className="space-y-3">
                 <input className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all" 
                        placeholder="Product Name" 
                        value={aiProduct} onChange={e=>setAiProduct(e.target.value)} />
                 
                 <input className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all" 
                        placeholder="Description (Optional)" 
                        value={productDesc} onChange={e=>setProductDesc(e.target.value)} />

                 <select className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all appearance-none cursor-pointer" 
                         value={aiTone} onChange={e=>setAiTone(e.target.value)}>
                   <option>Professional</option><option>Casual</option><option>Exciting</option><option>Luxury</option>
                 </select>

                 <button onClick={generateAdCopy} disabled={copyLoading} 
                         className="w-full py-2 px-3 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                   {copyLoading ? '🤔 Generating...' : 'Generate Copy'}
                 </button>

                 {copyError && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800">{copyError}</p>}

                 {generatedCopy && !copyLoading && (
                   <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div onClick={()=>addText(generatedCopy.headline, true)} 
                          className="group p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Headline</span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-200">{generatedCopy.headline}</p>
                     </div>
                     <div onClick={()=>addText(generatedCopy.body, false)} 
                          className="group p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Body</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 leading-relaxed">{generatedCopy.body}</p>
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