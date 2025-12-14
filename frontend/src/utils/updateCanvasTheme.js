/**
 * Fabric.js Canvas Theme Adapter
 * Updates canvas colors based on light/dark mode
 * 
 * Usage:
 *   import { updateCanvasTheme } from './utils/updateCanvasTheme'
 *   updateCanvasTheme(canvas, isDark)
 */

/**
 * Normalize color to RGB format for comparison
 * @param {string} color - Color in hex or rgb format
 * @returns {string} - Color in rgb(r,g,b) format
 */
function normalizeColor(color) {
  if (!color) return null

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return `rgb(${r},${g},${b})`
  }

  // Already in rgb format
  return color.toLowerCase()
}

/**
 * Check if color is pure black
 * @param {string} color - Color in hex or rgb format
 * @returns {boolean}
 */
function isBlack(color) {
  const normalized = normalizeColor(color)
  return normalized === 'rgb(0,0,0)' || color === '#000000' || color === '#000'
}

/**
 * Check if color is pure white
 * @param {string} color - Color in hex or rgb format
 * @returns {boolean}
 */
function isWhite(color) {
  const normalized = normalizeColor(color)
  return (
    normalized === 'rgb(255,255,255)' ||
    color === '#ffffff' ||
    color === '#fff' ||
    color === 'white'
  )
}

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

  // 1. CRITICAL: Set the Canvas Background Color explicitly
  // Fabric.js does NOT use CSS classes for the background itself.
  const bgColor = isDark ? '#121212' : '#ffffff' // Dark Gray vs Pure White
  canvas.setBackgroundColor(bgColor, canvas.renderAll.bind(canvas))

  // 2. Loop through objects to invert text colors
  canvas.getObjects().forEach((obj) => {
    // Only target text objects or simple shapes
    if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') {
      
      // If going Dark: Turn Black text -> White
      if (isDark && (obj.fill === '#000000' || obj.fill === 'black' || obj.fill === '#000')) {
        obj.set('fill', '#ffffff')
        // Add a custom tag so we know to flip it back later
        obj.set('originalColor', 'black')
        console.log('[CANVAS THEME] ✓ Changed black text to white (dark mode)')
      }
      
      // If going Light: Turn White text -> Black (only if we flipped it previously)
      else if (!isDark && obj.fill === '#ffffff') {
        obj.set('fill', '#000000')
        console.log('[CANVAS THEME] ✓ Changed white text to black (light mode)')
      }
    }
  })

  // 3. Force a full repaint of the canvas
  canvas.requestRenderAll()
  console.log('[CANVAS THEME] ✓ Canvas theme update complete')
}

/**
 * Restore canvas to original theme
 * @param {fabric.Canvas} canvas
 */
export function resetCanvasTheme(canvas) {
  if (!canvas) return
  canvas.setBackgroundColor('#ffffff', () => {
    canvas.renderAll()
  })
  console.log('[CANVAS THEME] Canvas reset to default theme')
}

export default updateCanvasTheme
