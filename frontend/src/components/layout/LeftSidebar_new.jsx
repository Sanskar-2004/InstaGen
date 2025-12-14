import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { fabric } from 'fabric'

function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('uploads') // 'uploads' | 'ai'
  const [assets, setAssets] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [logoStyle, setLogoStyle] = useState('Minimalist')
  const [generatedLogo, setGeneratedLogo] = useState(null)
  
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [adTone, setAdTone] = useState('Professional')
  const [generatedText, setGeneratedText] = useState(null)

  useEffect(() => { fetchAssets() }, [])

  const fetchAssets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/assets')
      setAssets(res.data)
    } catch (e) { console.error(e) }
  }

  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', e.target.files[0])
    try {
        await axios.post('http://localhost:8000/api/assets/upload-asset', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        fetchAssets()
    } catch (e) { alert("Upload error") }
    setIsUploading(false)
  }

  // --- AI HANDLERS ---
  
  const generateLogo = async () => {
    if (!brandName) return
    setAiLoading(true)
    try {
        const res = await axios.post('http://localhost:8000/api/ai/generate-logo', {
            brand_name: brandName, style: logoStyle
        })
        setGeneratedLogo(res.data.url)
    } catch (e) { alert("AI Error: " + e.message) }
    setAiLoading(false)
  }

  const generateText = async () => {
    if (!productName) return
    setAiLoading(true)
    try {
        const res = await axios.post('http://localhost:8000/api/ai/generate-text', {
            product_name: productName, description: productDesc, tone: adTone
        })
        setGeneratedText(res.data)
    } catch (e) { alert("AI Error: " + e.message) }
    setAiLoading(false)
  }

  const addTextToCanvas = (text, type) => {
    if (!window.fabricCanvas) return
    const opts = {
        left: 540, originX: 'center', textAlign: 'center',
        top: type === 'headline' ? 400 : 800,
        fontSize: type === 'headline' ? 60 : 32,
        fontWeight: type === 'headline' ? 'bold' : 'normal',
        fill: '#000000',
        width: 800,
        splitByGrapheme: true
    }
    const obj = new fabric.Textbox(text, opts)
    window.fabricCanvas.add(obj)
    window.fabricCanvas.setActiveObject(obj)
    window.fabricCanvas.renderAll()
  }

  return (
    <div className="w-80 h-full bg-white border-r flex flex-col shadow-xl z-30">
      {/* TABS */}
      <div className="flex border-b">
        <button onClick={() => setActiveTab('uploads')} 
          className={`flex-1 py-3 font-bold text-sm ${activeTab==='uploads' ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          📂 Uploads
        </button>
        <button onClick={() => setActiveTab('ai')} 
          className={`flex-1 py-3 font-bold text-sm ${activeTab==='ai' ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600' : 'text-gray-500'}`}>
          ✨ AI Tools
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
           <>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <span className="text-2xl block mb-2">☁️</span>
                <span className="text-sm font-medium text-gray-600">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
               {assets.map(a => (
                 <img key={a.id} src={a.url || a.src} alt="asset" className="w-full h-24 object-cover rounded cursor-pointer border hover:border-blue-500" 
                      onClick={() => {
                        fabric.Image.fromURL(a.url || a.src, img => {
                            img.scaleToWidth(400); img.set({left:540, top:960, originX:'center', originY:'center'});
                            window.fabricCanvas.add(img);
                        }, {crossOrigin:'anonymous'})
                      }} />
               ))}
             </div>
           </>
        )}

        {/* AI TOOLS TAB */}
        {activeTab === 'ai' && (
           <>
             {/* LOGO MAKER */}
             <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
               <h3 className="font-bold text-purple-900 mb-3">🎨 Logo Generator</h3>
               <input className="w-full p-2 text-sm border rounded mb-2" placeholder="Brand Name" value={brandName} onChange={e=>setBrandName(e.target.value)} />
               <select className="w-full p-2 text-sm border rounded mb-3" value={logoStyle} onChange={e=>setLogoStyle(e.target.value)}>
                 <option>Minimalist</option><option>Vintage</option><option>Modern</option><option>3D Render</option>
               </select>
               <button onClick={generateLogo} disabled={aiLoading} className="w-full py-2 bg-purple-600 text-white rounded font-bold text-sm hover:bg-purple-700 disabled:opacity-50">
                 {aiLoading ? 'Generating...' : 'Generate Logo'}
               </button>
               {generatedLogo && (
                 <img src={generatedLogo} alt="logo" className="mt-3 w-full rounded border cursor-pointer hover:opacity-90" 
                      onClick={() => {
                        fabric.Image.fromURL(generatedLogo, img => {
                            img.scaleToWidth(400); img.set({left:540, top:500, originX:'center', originY:'center'});
                            window.fabricCanvas.add(img);
                        }, {crossOrigin:'anonymous'})
                      }} />
               )}
             </div>

             {/* TEXT WRITER */}
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
               <h3 className="font-bold text-blue-900 mb-3">✍️ Ad Copy Writer</h3>
               <input className="w-full p-2 text-sm border rounded mb-2" placeholder="Product Name" value={productName} onChange={e=>setProductName(e.target.value)} />
               <textarea className="w-full p-2 text-sm border rounded mb-2 h-16" placeholder="Description..." value={productDesc} onChange={e=>setProductDesc(e.target.value)} />
               <select className="w-full p-2 text-sm border rounded mb-3" value={adTone} onChange={e=>setAdTone(e.target.value)}>
                 <option>Professional</option><option>Casual</option><option>Friendly</option><option>Urgent</option>
               </select>
               <button onClick={generateText} disabled={aiLoading} className="w-full py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                 {aiLoading ? 'Thinking...' : 'Write Copy'}
               </button>
               {generatedText && (
                 <div className="mt-3 space-y-2">
                   {Object.entries(generatedText).map(([key, val]) => (
                     typeof val === 'string' && (
                       <div key={key} onClick={() => addTextToCanvas(val, key)} className="p-2 bg-white rounded border hover:border-blue-500 cursor-pointer">
                          <span className="text-xs font-bold text-gray-400 uppercase">{key}</span>
                          <p className="text-sm text-gray-800">{val}</p>
                       </div>
                     )
                   ))}
                 </div>
               )}
             </div>
           </>
        )}
      </div>
    </div>
  )
}

export default LeftSidebar
