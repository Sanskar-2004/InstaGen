import axios from 'axios'

// 1. Determine API Base URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  }
  // In dev mode, default to local FastAPI server
  if (import.meta.env.DEV) {
    return 'http://localhost:8000'
  }
  // In production (Vercel static build), default to relative path
  return ''
}

export const API_BASE_URL = getApiBaseUrl()

// Helper to convert relative server paths (/static/uploads/...) to absolute URLs
export const getAbsoluteUrl = (url) => {
  if (!url) return ''
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url
  }
  
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath
}

// --- FALLBACK CONSTANTS & UTILITIES FOR OFFLINE / VERCEL DIRECT OPERABILITY ---

const FALLBACK_HEADLINES = [
  "Stop Scrolling! {product} is Here 🔥",
  "Upgrade Your Life with {product} ✨",
  "The Secret to {desc} is Here 🤫",
  "Why Everyone is Talking About {product} 🚀",
  "Don't Miss Out on {product} 💎",
  "Finally, {product} is Here! 🎉",
  "Game-Changer Alert: {product} 🚀",
  "You Need {product} in Your Life 💯"
]

const FALLBACK_BODIES = [
  "Experience premium quality. {desc} Join thousands of satisfied customers.",
  "Tired of mediocrity? {product} is the upgrade you've been waiting for.",
  "Transform your experience today. {desc} Limited stock available!",
  "Designed specifically for you. {desc} Don't wait, get it now!",
  "This is what excellence looks like. {product} is your answer.",
  "Stop settling for less. {product} is the difference maker.",
  "The results speak for themselves. {desc} Be part of the movement!"
]

const FALLBACK_CTAS = [
  "Shop Now 🛒",
  "Get Yours 👇",
  "Learn More 💡",
  "Claim Offer 🎁",
  "Join Today ✨",
  "Discover More 🔍",
  "Start Now 🚀"
]

// Helper for local file to Data URL conversion
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

// Client-side dominant color extraction fallback using Canvas
export const extractColorsClientSide = (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 100
        canvas.height = 100
        ctx.drawImage(img, 0, 0, 100, 100)
        
        const imageData = ctx.getImageData(0, 0, 100, 100).data
        const colorCounts = {}
        
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i]
          const g = imageData[i + 1]
          const b = imageData[i + 2]
          const a = imageData[i + 3]
          
          if (a < 128) continue // ignore transparent pixels
          
          // Quantize to step of 32 for color grouping
          const qr = Math.round(r / 32) * 32
          const qg = Math.round(g / 32) * 32
          const qb = Math.round(b / 32) * 32
          
          const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`
          colorCounts[hex] = (colorCounts[hex] || 0) + 1
        }
        
        const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a])
        const defaultPalette = ["#1e293b", "#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
        const result = sortedColors.slice(0, 5)
        
        while (result.length < 5) {
          result.push(defaultPalette[result.length])
        }
        
        URL.revokeObjectURL(url)
        resolve(result)
      } catch (err) {
        URL.revokeObjectURL(url)
        resolve(["#1e293b", "#3b82f6", "#ef4444", "#10b981", "#f59e0b"])
      }
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(["#1e293b", "#3b82f6", "#ef4444", "#10b981", "#f59e0b"])
    }
    
    img.src = url
  })
}

// Composite AI Emblem + Exact Brand Name Text into a unified high-res PNG image
export const compositeLogoWithText = (emblemUrl, brandName, styleName = 'Modern') => {
  return new Promise((resolve) => {
    if (!brandName || !brandName.trim()) {
      return resolve(emblemUrl)
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const size = 600
        canvas.width = size
        canvas.height = size

        // Elegant dark card background
        ctx.fillStyle = '#0b0f19'
        ctx.fillRect(0, 0, size, size)

        // Accent inner border line
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 4
        ctx.strokeRect(16, 16, size - 32, size - 32)

        // Draw Emblem Icon centered
        const emblemSize = 340
        const emblemX = (size - emblemSize) / 2
        const emblemY = 35

        ctx.drawImage(img, emblemX, emblemY, emblemSize, emblemSize)

        // Render Brand Name Text
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const name = brandName.trim().toUpperCase()
        let fontSize = 38
        if (name.length > 15) fontSize = 30
        if (name.length > 25) fontSize = 22

        ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
        ctx.fillStyle = '#ffffff'

        const textY = size - 90
        ctx.fillText(name, size / 2, textY)

        // Subtitle line
        ctx.font = '500 12px sans-serif'
        ctx.fillStyle = '#64748b'
        ctx.fillText('BRAND IDENTITY', size / 2, textY + 36)

        const compositeDataUrl = canvas.toDataURL('image/png')
        resolve(compositeDataUrl)
      } catch (err) {
        console.warn('Canvas composite fallback to raw image:', err)
        resolve(emblemUrl)
      }
    }

    img.onerror = () => {
      resolve(emblemUrl)
    }

    img.src = emblemUrl
  })
}

// --- API METHODS WITH AUTOMATIC FALLBACK FOR VERCEL / OFFLINE MODE ---

const STYLE_MAP = {
  "Modern": "minimalist, sleek, vector art, flat design, clean lines, contemporary, professional",
  "Vintage": "retro, 70s aesthetic, vintage badge, nostalgic, warm colors, classic, timeless",
  "Minimalist": "minimal, simple, geometric shapes, monochrome, icon-like, bold sans-serif, stark",
  "Luxury": "luxurious, premium, gold accents, sophisticated, elegant, high-end, exclusive, upscale",
  "Tech": "futuristic, neon, cyberpunk, geometric shapes, circuit lines, gradient, tech startup",
  "Playful": "cute, vibrant colors, friendly, cheerful, fun, cartoon style, energetic, approachable",
  "Organic": "natural, eco-friendly, flowing curves, earth tones, botanical, sustainable, green",
  "Abstract": "abstract art, artistic, creative, unique, contemporary, expressionist, modern art",
  "3D": "three-dimensional, realistic shading, depth, glossy, metallic, modern, sculptural",
  "Sports": "athletic, dynamic, energetic, powerful, bold, strength, competitive, movement",
}

export const generateLogoApi = async ({ brand_name, styles = ['Modern'], style = 'Modern' }) => {
  const endpointUrl = `${API_BASE_URL}/api/ai/generate-logo`
  const selectedStyles = Array.isArray(styles) && styles.length > 0 ? styles : [style]
  
  try {
    const res = await axios.post(endpointUrl, {
      brand_name,
      styles: selectedStyles,
      style: selectedStyles[0]
    }, { timeout: 12000 })
    
    if (res.data && res.data.url) {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend generate-logo unavailable or failed, using client-side Pollinations.ai fallback:', err.message)
  }
  
  // Client-side fallback via Pollinations.ai (Flux model with style mix & match and wordmark brand text)
  const styleNames = selectedStyles.join(' and ')
  const styleKeywords = selectedStyles.map(s => STYLE_MAP[s] || STYLE_MAP["Modern"]).join(', ')
  
  const prompt = `Professional typographic wordmark logo created of the brand text '${brand_name}', styled in a mix of ${styleNames.toLowerCase()} aesthetic, ${styleKeywords}, creative lettering forming the brand logo for '${brand_name}', vector graphic emblem, centered on solid dark background`
  const seed = Math.floor(Math.random() * 999999999)
  const encodedPrompt = encodeURIComponent(prompt)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&model=flux`
  
  return {
    status: 'success',
    url: imageUrl,
    brand_name,
    styles: selectedStyles,
    style: selectedStyles[0],
    seed,
    mode: 'client_fallback'
  }
}

export const generateAdCopyApi = async ({ product_name, description = '', tone = 'Professional' }) => {
  const endpointUrl = `${API_BASE_URL}/api/ai/generate-text`
  
  try {
    const res = await axios.post(endpointUrl, {
      product_name,
      description,
      tone
    }, { timeout: 12000 })
    
    if (res.data && res.data.headline) {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend generate-text unavailable, using client-side generator fallback:', err.message)
  }
  
  // Client-side fallback text generation
  const seedIndex = Math.floor(Math.random() * FALLBACK_HEADLINES.length)
  const desc = description || `high quality ${product_name}`
  
  const headline = FALLBACK_HEADLINES[seedIndex].replace('{product}', product_name).replace('{desc}', desc)
  const body = FALLBACK_BODIES[seedIndex % FALLBACK_BODIES.length].replace('{product}', product_name).replace('{desc}', desc)
  const cta = FALLBACK_CTAS[seedIndex % FALLBACK_CTAS.length]
  
  return {
    status: 'success',
    headline,
    body,
    cta,
    mode: 'client_fallback'
  }
}

export const uploadOriginalAssetApi = async (file) => {
  const endpointUrl = `${API_BASE_URL}/api/assets/upload-original`
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await axios.post(endpointUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000
    })
    if (res.data && res.data.url) {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend upload-original failed/offline, using client-side Data URL:', err.message)
  }
  
  const dataUrl = await fileToDataUrl(file)
  const assetId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id: assetId,
    url: dataUrl,
    src: dataUrl,
    filename: file.name,
    original_name: file.name,
    size: file.size,
    message: 'Loaded locally in browser'
  }
}

export const removeBackgroundApi = async (file) => {
  const endpointUrl = `${API_BASE_URL}/api/assets/remove-background`
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await axios.post(endpointUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 25000
    })
    if (res.data && res.data.url) {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend remove-background failed/offline, fallback to original:', err.message)
  }
  
  const dataUrl = await fileToDataUrl(file)
  return {
    status: 'success',
    url: dataUrl,
    filename: file.name,
    original: file.name
  }
}

export const extractColorsApi = async (file) => {
  const endpointUrl = `${API_BASE_URL}/api/assets/extract-colors`
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const res = await axios.post(endpointUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 10000
    })
    if (res.data && res.data.colors) {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend extract-colors failed/offline, using client-side canvas extraction:', err.message)
  }
  
  const colors = await extractColorsClientSide(file)
  return {
    status: 'success',
    colors,
    count: colors.length
  }
}

export const proxyImageApi = async (url) => {
  const endpointUrl = `${API_BASE_URL}/api/proxy-image`
  
  try {
    const res = await axios.post(endpointUrl, { url }, { timeout: 15000 })
    if (res.data && res.data.status === 'success') {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend proxy-image failed, using direct URL:', err.message)
  }
  
  return {
    status: 'success',
    data: url
  }
}
