import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { fabric } from 'fabric'

function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('uploads')
  const [assets, setAssets] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [paletteColors, setPaletteColors] = useState(['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'])
  
  // AI State
  const [aiProduct, setAiProduct] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [aiTone, setAiTone] = useState('Professional')
  const [copyLoading, setCopyLoading] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [generatedCopy, setGeneratedCopy] = useState(null)

  const [aiBrandName, setAiBrandName] = useState('')
  const [aiLogoStyle, setAiLogoStyle] = useState('Modern')
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [generatedLogo, setGeneratedLogo] = useState(null)

  useEffect(() => {
    setAssets([])
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('http://localhost:8000/api/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAssets(prev => [...prev, res.data])

      const colorFormData = new FormData()
      colorFormData.append('file', file)
      const colorRes = await axios.post('http://localhost:8000/api/assets/extract-colors', colorFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (colorRes.data.colors) {
        setPaletteColors(colorRes.data.colors)
      }
    } catch (e) {
      console.error(e)
      alert("Upload Failed. Check Backend Terminal for errors.")
    }
    setIsUploading(false)
  }

  const handleColorClick = (hex) => {
    const canvas = window.fabricCanvas
    if (!canvas) {
      alert("Canvas not ready")
      return
    }

    const active = canvas.getActiveObject()
    if (!active) {
      alert("Please select an object on the canvas first!")
      return
    }

    if (active.type === 'i-text' || active.type === 'textbox') {
      active.set('fill', hex)
    } else if (active.type === 'image') {
      active.set('opacity', 0.8)
      active.set('overlayColor', hex)
    } else {
      active.set('fill', hex)
      if (active.stroke === 'transparent' || !active.stroke) {
        active.set('stroke', hex)
        active.set('strokeWidth', 2)
      }
    }

    canvas.renderAll()
  }

  const generateAdCopy = async () => {
    if (!aiProduct.trim()) {
      setCopyError('Please enter a product name')
      return
    }

    setGeneratedCopy(null)
    setCopyLoading(true)
    setCopyError('')

    try {
      const res = await axios.post('http://localhost:8000/api/ai/generate-text', {
        product_name: aiProduct,
        description: productDesc,
        tone: aiTone
      })
      setGeneratedCopy(res.data)
    } catch (e) {
      const errorMsg = "AI Error: " + (e.response?.data?.detail || e.message)
      setCopyError(errorMsg)
      alert(errorMsg)
    }
    setCopyLoading(false)
  }

  const generateLogo = async () => {
    if (!aiBrandName.trim()) {
      setLogoError('Please enter a brand name')
      return
    }

    setGeneratedLogo(null)
    setLogoLoading(true)
    setLogoError('')

    try {
      const res = await axios.post('http://localhost:8000/api/ai/generate-logo', {
        brand_name: aiBrandName,
        style: aiLogoStyle
      })
      const uniqueUrl = res.data.url + "&t=" + new Date().getTime()
      setGeneratedLogo({ url: uniqueUrl })
    } catch (e) {
      const errorMsg = "AI Error: " + (e.response?.data?.detail || e.message)
      setLogoError(errorMsg)
      alert(errorMsg)
    }
    setLogoLoading(false)
  }

  const addText = (text, isHeadline) => {
    const canvas = window.fabricCanvas
    if (!canvas) return
    const t = new fabric.IText(text, {
      left: 540,
      top: isHeadline ? 400 : 800,
      originX: 'center',
      fontSize: isHeadline ? 60 : 30
    })
    canvas.add(t)
    canvas.setActiveObject(t)
    canvas.renderAll()
  }

  const addImage = (url) => {
    const canvas = window.fabricCanvas
    if (!canvas) return
    const absoluteUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`
    fabric.Image.fromURL(absoluteUrl, (img) => {
      if (!img) return
      img.scaleToWidth(400)
      img.set({ left: 540, top: 960, originX: 'center', originY: 'center' })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }, { crossOrigin: 'anonymous' })
  }

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-900">Tools</h2>
      </div>

      {/* Tab Switcher - Modern Pill Style */}
      <div className="px-6 pt-4">
        <div className="inline-flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'uploads'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📂 Assets
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'ai'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ AI Tools
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'uploads' && (
          <div className="space-y-6 p-6">
            {/* Upload Dropzone */}
            <div className="relative group">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition bg-slate-50/50">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">📤</div>
                  <p className="text-sm font-medium text-slate-700">
                    {isUploading ? 'Uploading...' : 'Drop or click'}
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, WebP</p>
                </div>
              </label>
            </div>

            {/* Color Palette */}
            <div>
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                Color Palette
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {paletteColors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleColorClick(c)}
                    className="w-full aspect-square rounded-lg border border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-md transition transform hover:scale-105"
                    style={{ backgroundColor: c }}
                    title="Select object first"
                  />
                ))}
              </div>
            </div>

            {/* Asset Gallery */}
            {assets.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                  Your Uploads
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {assets.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => addImage(a.url || a.src)}
                      className="relative group rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 transition shadow-sm hover:shadow-md"
                    >
                      <img
                        src={a.url || a.src}
                        className="w-full h-24 object-cover"
                        alt="asset"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Add</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 p-6">
            {/* Logo Generator */}
            <div className="bg-indigo-50/50 rounded-xl border border-indigo-200/50 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                🎨 Logo Generator
              </h3>

              <input
                type="text"
                placeholder="Brand name..."
                value={aiBrandName}
                onChange={(e) => setAiBrandName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
              />

              <select
                value={aiLogoStyle}
                onChange={(e) => setAiLogoStyle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
              >
                <option value="Modern">Modern</option>
                <option value="Vintage">Vintage</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Playful">Playful</option>
                <option value="Elegant">Elegant</option>
                <option value="Tech">Tech</option>
                <option value="Organic">Organic</option>
                <option value="Abstract">Abstract</option>
                <option value="Geometric">Geometric</option>
                <option value="Gradient">Gradient</option>
                <option value="Graffiti">Graffiti</option>
                <option value="Monochrome">Monochrome</option>
                <option value="Watercolor">Watercolor</option>
                <option value="3D">3D</option>
                <option value="Retro">Retro</option>
                <option value="Nature">Nature</option>
              </select>

              <button
                onClick={generateLogo}
                disabled={logoLoading}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition mb-3"
              >
                {logoLoading ? '⏳ Generating...' : '✨ Generate Logo'}
              </button>

              {logoError && <p className="text-xs text-red-600 mb-2">{logoError}</p>}

              {logoLoading && (
                <div className="h-32 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-slate-500">Creating logo...</p>
                  </div>
                </div>
              )}

              {generatedLogo && !logoLoading && (
                <div className="bg-white rounded-lg border border-slate-200 p-3">
                  <img
                    src={generatedLogo.url}
                    className="w-32 h-32 rounded-lg mx-auto mb-3 cursor-pointer hover:opacity-90 transition"
                    onClick={() => addImage(generatedLogo.url)}
                    alt="logo"
                  />
                  <button
                    onClick={() => addImage(generatedLogo.url)}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium text-xs hover:bg-indigo-700 transition"
                  >
                    Add to Canvas
                  </button>
                </div>
              )}
            </div>

            {/* Ad Copy Generator */}
            <div className="bg-blue-50/50 rounded-xl border border-blue-200/50 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                ✍️ Ad Copy
              </h3>

              <input
                type="text"
                placeholder="Product name..."
                value={aiProduct}
                onChange={(e) => setAiProduct(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />

              <input
                type="text"
                placeholder="Description (optional)..."
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              />

              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Energetic</option>
                <option>Luxury</option>
                <option>Friendly</option>
                <option>Bold</option>
                <option>Witty</option>
                <option>Inspiring</option>
              </select>

              <button
                onClick={generateAdCopy}
                disabled={copyLoading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition mb-3"
              >
                {copyLoading ? '⏳ Writing...' : '✨ Generate Copy'}
              </button>

              {copyError && <p className="text-xs text-red-600 mb-2">{copyError}</p>}

              {copyLoading && (
                <div className="h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-1"></div>
                    <p className="text-xs text-slate-500">Crafting copy...</p>
                  </div>
                </div>
              )}

              {generatedCopy && !copyLoading && (
                <div className="space-y-2">
                  <button
                    onClick={() => addText(generatedCopy.headline, true)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-left hover:border-blue-500 hover:bg-blue-50/50 transition"
                  >
                    <span className="font-semibold text-slate-900">{generatedCopy.headline}</span>
                  </button>
                  <button
                    onClick={() => addText(generatedCopy.body, false)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-left hover:border-blue-500 hover:bg-blue-50/50 transition line-clamp-2"
                  >
                    <span className="text-slate-700">{generatedCopy.body}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar
