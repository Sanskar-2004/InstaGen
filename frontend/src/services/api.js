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
export const compositeLogoWithText = (emblemUrl, brandName, styles = ['Modern']) => {
  return new Promise((resolve) => {
    if (!brandName || !brandName.trim()) {
      resolve(emblemUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const size = img.width || 512
        canvas.width = size
        canvas.height = size

        // 1. Draw raw AI generated logo artwork
        ctx.drawImage(img, 0, 0, size, size)

        // 2. Sculpt exact brand text using Compound Style Configuration
        const name = brandName.trim().toUpperCase()
        const selectedStyles = Array.isArray(styles) ? styles : [styles]
        const cfg = buildFusedStyleConfig(selectedStyles, 'Dark')

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let fontSize = 110
        if (name.length === 1) fontSize = 160
        if (name.length === 2) fontSize = 130
        if (name.length >= 3 && name.length <= 5) fontSize = 90
        if (name.length > 5) fontSize = 50

        ctx.font = `${cfg.fontStyle} ${cfg.fontWeight} ${fontSize}px ${cfg.fontFamily}`

        // Multi-stop linear gradient fill
        const grad = ctx.createLinearGradient(0, 0, size, size)
        const step = 1 / (cfg.gradientColors.length - 1)
        cfg.gradientColors.forEach((color, idx) => {
          grad.addColorStop(idx * step, color)
        })

        // Render 3D Extruded Shadow Layer
        if (cfg.has3DShadow) {
          ctx.fillStyle = 'rgba(0,0,0,0.65)'
          ctx.fillText(name, size / 2 + cfg.shadowOffset, size / 2 + cfg.shadowOffset)
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.5)'
          ctx.fillText(name, size / 2 + 3, size / 2 + 3)
        }

        // Render Glow if Tech or 3D selected
        if (cfg.hasGlow) {
          ctx.shadowColor = cfg.glowColor
          ctx.shadowBlur = cfg.glowBlur
        }

        ctx.fillStyle = grad
        ctx.fillText(name, size / 2, size / 2)

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

// --- COMPOUND STYLE FUSION ENGINE ---
function buildFusedStyleConfig(styles = ['Modern'], background = 'Dark') {
  const isLight = background === 'Light'
  
  const config = {
    gradientColors: isLight ? ['#0f172a', '#3b82f6'] : ['#3b82f6', '#8b5cf6'],
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '900',
    fontStyle: 'normal',
    hasGlow: false,
    glowColor: '#06b6d4',
    glowBlur: 25,
    has3DShadow: false,
    shadowOffset: 6,
    hasCyberBorder: false,
    hasDiamondBorder: false,
    hasBadgeBorder: false,
    hasShieldBorder: false,
    hasRoundSquareBorder: false,
    borderWidth: 8
  }

  const selected = Array.isArray(styles) ? styles : [styles]

  selected.forEach(s => {
    if (s === 'Luxury') {
      config.gradientColors = ['#f59e0b', '#fbbf24', '#d97706']
      config.fontFamily = 'Georgia, serif'
      config.fontWeight = 'bold'
      config.hasDiamondBorder = true
    }
    if (s === 'Tech') {
      config.hasGlow = true
      config.glowColor = '#06b6d4'
      config.hasCyberBorder = true
      if (config.fontFamily === 'system-ui, sans-serif') {
        config.fontFamily = '"Courier New", monospace'
      }
    }
    if (s === '3D') {
      config.has3DShadow = true
      config.hasGlow = true
      if (!selected.includes('Tech')) config.glowColor = '#3b82f6'
    }
    if (s === 'Vintage') {
      config.hasBadgeBorder = true
      config.fontFamily = 'Georgia, serif'
      if (!selected.includes('Luxury')) config.gradientColors = ['#d97706', '#b45309']
    }
    if (s === 'Sports') {
      config.hasShieldBorder = true
      config.fontStyle = 'italic'
      config.fontWeight = '900'
      if (!selected.includes('Luxury') && !selected.includes('Tech')) {
        config.gradientColors = ['#ef4444', '#f97316']
      }
    }
    if (s === 'Playful') {
      if (!selected.includes('Luxury')) config.gradientColors = ['#ec4899', '#8b5cf6', '#06b6d4']
      config.fontFamily = '"Comic Sans MS", cursive, sans-serif'
    }
    if (s === 'Minimalist') {
      config.borderWidth = 4
      if (selected.length === 1) {
        config.gradientColors = isLight ? ['#0f172a', '#334155'] : ['#ffffff', '#cbd5e1']
      }
    }
  })

  if (!config.hasDiamondBorder && !config.hasCyberBorder && !config.hasBadgeBorder && !config.hasShieldBorder) {
    config.hasRoundSquareBorder = true
  }

  return config
}

export const generateVectorMonogramLogo = (brandName, styles = ['Modern'], background = 'Dark') => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 600
    canvas.width = size
    canvas.height = size

    const cleanText = brandName.trim()
    if (!cleanText) {
      resolve('')
      return
    }

    // 1. Background Settings
    let bgColor = '#0b0f19'
    if (background === 'Light') {
      bgColor = '#f8fafc'
    } else if (background === 'Transparent') {
      bgColor = '#ffffff'
    }

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // 2. Build Fused Style Configuration
    const cfg = buildFusedStyleConfig(styles, background)
    
    // Create multi-stop gradient
    const grad = ctx.createLinearGradient(60, 60, size - 60, size - 60)
    const step = 1 / (cfg.gradientColors.length - 1)
    cfg.gradientColors.forEach((color, idx) => {
      grad.addColorStop(idx * step, color)
    })

    // 3. Render Layered Frames
    ctx.save()
    ctx.strokeStyle = grad
    ctx.lineWidth = cfg.borderWidth

    if (cfg.hasGlow) {
      ctx.shadowColor = cfg.glowColor
      ctx.shadowBlur = cfg.glowBlur
    }

    if (cfg.hasBadgeBorder) {
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, 220, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, 205, 0, Math.PI * 2)
      ctx.lineWidth = 3
      ctx.stroke()
    }
    
    if (cfg.hasCyberBorder) {
      ctx.beginPath()
      const radius = 220
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = size / 2 + radius * Math.cos(angle)
        const y = size / 2 + radius * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
      
      ctx.fillStyle = cfg.glowColor
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = size / 2 + radius * Math.cos(angle)
        const y = size / 2 + radius * Math.sin(angle)
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    if (cfg.hasDiamondBorder) {
      ctx.beginPath()
      const r = 210
      ctx.moveTo(size / 2, size / 2 - r)
      ctx.lineTo(size / 2 + r, size / 2)
      ctx.lineTo(size / 2, size / 2 + r)
      ctx.lineTo(size / 2 - r, size / 2)
      ctx.closePath()
      ctx.stroke()
    }
    
    if (cfg.hasShieldBorder) {
      ctx.beginPath()
      ctx.moveTo(size / 2 - 180, size / 2 - 180)
      ctx.lineTo(size / 2 + 180, size / 2 - 180)
      ctx.lineTo(size / 2 + 180, size / 2 + 60)
      ctx.quadraticCurveTo(size / 2, size / 2 + 240, size / 2, size / 2 + 240)
      ctx.quadraticCurveTo(size / 2 - 180, size / 2 + 60, size / 2 - 180, size / 2 + 60)
      ctx.closePath()
      ctx.stroke()
    }

    if (cfg.hasRoundSquareBorder) {
      const r = 40
      const x = 70
      const y = 70
      const w = size - 140
      const h = size - 140
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + w, y, x + w, y + h, r)
      ctx.arcTo(x + w, y + h, x, y + h, r)
      ctx.arcTo(x, y + h, x, y, r)
      ctx.arcTo(x, y, x + w, y, r)
      ctx.closePath()
      ctx.stroke()
    }
    ctx.restore()

    // 4. Render Fused Monogram Letters
    const textToDraw = cleanText.length <= 4 ? cleanText.toUpperCase() : cleanText.substring(0, 3).toUpperCase()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    let fontSize = 190
    if (textToDraw.length === 1) fontSize = 240
    if (textToDraw.length === 2) fontSize = 190
    if (textToDraw.length >= 3) fontSize = 140

    ctx.font = `${cfg.fontStyle} ${cfg.fontWeight} ${fontSize}px ${cfg.fontFamily}`

    // Render 3D Extruded Shadow Layer
    if (cfg.has3DShadow) {
      ctx.fillStyle = background === 'Light' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.65)'
      ctx.fillText(textToDraw, size / 2 + cfg.shadowOffset, size / 2 + cfg.shadowOffset)
      ctx.fillText(textToDraw, size / 2 + (cfg.shadowOffset / 2), size / 2 + (cfg.shadowOffset / 2))
    }

    if (cfg.hasGlow) {
      ctx.shadowColor = cfg.glowColor
      ctx.shadowBlur = cfg.glowBlur
    }

    ctx.fillStyle = grad
    ctx.fillText(textToDraw, size / 2, size / 2)

    resolve(canvas.toDataURL('image/png'))
  })
}

export const generateLogoApi = async ({ brand_name, styles = ['Modern'], style = 'Modern', background = 'Dark', model = 'hf-flux' }) => {
  const selectedStyles = Array.isArray(styles) && styles.length > 0 ? styles : [style]
  const styleDescriptors = selectedStyles.map(s => STYLE_MAP[s] || STYLE_MAP["Modern"]).join(', ')

  let bgPrompt = "centered on dark background"
  if (background === 'Light') bgPrompt = "centered on clean white background"
  if (background === 'Transparent') bgPrompt = "isolated on clean white background"

  // AI Style Fusion Prompt: explicitly instructs AI models on blending all selected styles
  const styleFusionTitle = selectedStyles.join(' + ')
  const prompt = `A hybrid 3D vector monogram logo mark of the letters "${brand_name}". Styled in a fused aesthetic of ${styleFusionTitle} (${styleDescriptors}), ${bgPrompt}`

  // Option 1: Vector Monogram Engine (100% Instant Letter Accuracy)
  if (model === 'vector') {
    const logoDataUrl = await generateVectorMonogramLogo(brand_name, selectedStyles, background)
    return {
      status: 'success',
      url: logoDataUrl,
      brand_name,
      styles: selectedStyles,
      style: selectedStyles[0],
      background,
      model: 'vector_monogram',
      mode: 'vector_monogram'
    }
  }

  // Option 2: Try Backend API (Handles Gemini Imagen 3 / Server-side AI models)
  const endpointUrl = `${API_BASE_URL}/api/ai/generate-logo`
  try {
    const res = await axios.post(endpointUrl, {
      brand_name,
      styles: selectedStyles,
      style: selectedStyles[0],
      background,
      model
    }, { timeout: 12000 })
    
    if (res.data && res.data.url) {
      return res.data
    }
  } catch (err) {
    console.warn('[API] Backend generate-logo unavailable, using multi-provider client fallback:', err.message)
  }

  // Option 3: Direct Multi-Provider Fallbacks (HuggingFace FLUX / SDXL / Free Engines)
  const seed = Math.floor(Math.random() * 999999999)
  const encodedPrompt = encodeURIComponent(prompt)
  
  let targetModelParam = "flux"
  if (model === 'sdxl') targetModelParam = "turbo"
  if (model === 'imagen') targetModelParam = "flux-realism"
  if (model === 'pollinations') targetModelParam = "unity"

  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&model=${targetModelParam}&nologo=true`
  
  return {
    status: 'success',
    url: imageUrl,
    brand_name,
    styles: selectedStyles,
    style: selectedStyles[0],
    background,
    model,
    seed,
    mode: 'multi_provider_ai'
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
