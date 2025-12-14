/**
 * MODULE A: VISUAL LAYOUT CONSTRAINTS
 * Standalone Fabric.js constraint layer
 * 
 * Add this to your canvas initialization:
 * ────────────────────────────────────────
 * import { applyLayoutConstraints } from './MODULE_A_LayoutConstraints.js'
 * 
 * canvas.on('object:added', (e) => {
 *   applyLayoutConstraints(canvas)
 * })
 */

import { fabric } from 'fabric'

// ============================================================================
// CONSTRAINT 1: LOCKED VALUE TILES
// ============================================================================
/**
 * Locks all objects marked as 'value_tile' to prevent movement/scaling
 * Call this in: canvas.on('object:modified', ...) or after object:added
 * 
 * Usage:
 *   lockValueTiles(canvas)
 */
export function lockValueTiles(canvas) {
  if (!canvas) return

  canvas.forEachObject((obj) => {
    if (obj.type === 'value_tile' || obj.complianceTag === 'ValueTile') {
      // Force to top layer
      canvas.bringToFront(obj)

      // Lock all interactions
      obj.set({
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasControls: false
      })

      console.log('[LayoutConstraints] Value tile locked:', obj.name || obj.id)
    }
  })

  canvas.renderAll()
}

// ============================================================================
// CONSTRAINT 2: PACKSHOT LIMITER
// ============================================================================
let packshottCount = 0

/**
 * Check if a new product can be added (max 3 packshots)
 * Call this BEFORE adding an object to canvas
 * 
 * Usage:
 *   if (canAddProduct()) {
 *     canvas.add(newProductImage)
 *   }
 */
export function canAddProduct() {
  if (packshottCount >= 3) {
    alert('❌ Max 3 packshots allowed')
    console.warn('[LayoutConstraints] Packshot limit reached (3/3)')
    return false
  }
  return true
}

/**
 * Track product additions/removals
 * Add this to your canvas:
 * 
 *   canvas.on('object:added', (e) => {
 *     if (e.target.type === 'product' || e.target.complianceTag === 'Packshot') {
 *       incrementPackshotCount()
 *     }
 *   })
 *
 *   canvas.on('object:removed', (e) => {
 *     if (e.target.type === 'product' || e.target.complianceTag === 'Packshot') {
 *       decrementPackshotCount()
 *     }
 *   })
 */
export function incrementPackshotCount() {
  packshottCount++
  console.log(`[LayoutConstraints] Packshots: ${packshottCount}/3`)
}

export function decrementPackshotCount() {
  packshottCount = Math.max(0, packshottCount - 1)
  console.log(`[LayoutConstraints] Packshots: ${packshottCount}/3`)
}

export function resetPackshotCount() {
  packshottCount = 0
}

export function getPackshotCount() {
  return packshottCount
}

// ============================================================================
// CONSTRAINT 3: ALCOHOL MANDATE
// ============================================================================
let drinkAwareObject = null

/**
 * Injects Drinkaware SVG into canvas
 * Call this when product category is 'Alcohol'
 * 
 * Usage:
 *   if (category === 'Alcohol') {
 *     toggleAlcoholMode(canvas, true)
 *   }
 */
export function toggleAlcoholMode(canvas, isActive) {
  if (!canvas) {
    console.error('[LayoutConstraints] Canvas required for alcohol mode')
    return { success: false, message: 'No canvas' }
  }

  if (isActive) {
    if (drinkAwareObject) {
      console.log('[LayoutConstraints] Drinkaware already active')
      return { success: true, message: 'Already active' }
    }

    try {
      // Create Drinkaware box
      drinkAwareObject = new fabric.Rect({
        width: 130,
        height: 40,
        fill: '#1F2937',
        stroke: '#FCD34D',
        strokeWidth: 2,
        rx: 4,
        left: canvas.width - 140,
        top: canvas.height - 50,
        selectable: false,
        evented: false,
        hasControls: false,
        complianceTag: 'DrinkAware'
      })

      // Add text: "Drinkaware.co.uk"
      const text = new fabric.Text('Drinkaware.co.uk', {
        fontSize: 11,
        fontWeight: 'bold',
        fill: '#FCD34D',
        fontFamily: 'Arial'
      })

      // Group them
      const group = new fabric.Group([drinkAwareObject, text], {
        left: canvas.width - 140,
        top: canvas.height - 50,
        selectable: false,
        evented: false
      })

      canvas.add(group)

      // Add scaling constraint
      canvas.on('object:scaling', (e) => {
        if (e.target === group || e.target.complianceTag === 'DrinkAware') {
          if (group.height < 20) {
            group.set({ height: 20, scaleY: 1 })
            console.warn('[LayoutConstraints] Drinkaware height locked to 20px minimum')
          }
        }
      })

      canvas.renderAll()
      console.log('[LayoutConstraints] Alcohol mode: Drinkaware injected')

      return {
        success: true,
        message: 'Drinkaware SVG added',
        object: group
      }
    } catch (error) {
      console.error('[LayoutConstraints] Alcohol mode failed:', error)
      return { success: false, message: error.message }
    }
  } else {
    // Deactivate
    if (drinkAwareObject) {
      canvas.remove(drinkAwareObject)
      drinkAwareObject = null
      canvas.renderAll()
      console.log('[LayoutConstraints] Alcohol mode: Drinkaware removed')
    }

    return { success: true, message: 'Drinkaware removed' }
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================
/**
 * Apply all layout constraints to canvas
 * Call this in: canvas.on('object:added') or canvas.on('object:modified')
 */
export function applyLayoutConstraints(canvas) {
  if (!canvas) return

  lockValueTiles(canvas)
}

/**
 * Export all functions as default for convenience
 */
export default {
  applyLayoutConstraints,
  lockValueTiles,
  canAddProduct,
  incrementPackshotCount,
  decrementPackshotCount,
  resetPackshotCount,
  getPackshotCount,
  toggleAlcoholMode
}
