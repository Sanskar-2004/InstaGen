/**
 * MODULE B: CONTENT COMPLIANCE - TEXT AUDITOR
 * Standalone text validation layer
 * 
 * Add this to your text input handlers:
 * ────────────────────────────────────
 * import { TextAuditor } from './MODULE_B_TextAuditor.js'
 * 
 * const auditor = new TextAuditor(canvas, {
 *   mistralEndpoint: 'http://localhost:8000/api/compliance/audit'
 * })
 * 
 * textInput.addEventListener('input', (e) => {
 *   auditor.checkTextCompliance(e.target.value, textObject)
 * })
 */

const DEFAULT_CONFIG = {
  mistralEndpoint: 'http://localhost:8000/api/compliance/audit',
  debounceMs: 1000,
  pricePattern: /[0-9]+[$£€]/,
  datePattern: /^(\d{2})\/(\d{2})$/
}

class TextAuditor {
  constructor(canvas, config = {}) {
    this.canvas = canvas
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.debounceTimer = null
    this.currentText = ''
    this.activeObject = null
  }

  // ============================================================================
  // CONSTRAINT 1: MISTRAL AUDIT HOOK (DEBOUNCED)
  // ============================================================================
  /**
   * Check text compliance via Mistral LLM
   * Debounced to 1000ms to prevent API spam
   * 
   * Usage:
   *   auditor.checkTextCompliance(textValue, fabricTextObject)
   */
  checkTextCompliance(text, fabricTextObject = null) {
    this.currentText = text
    this.activeObject = fabricTextObject

    // Clear previous timer
    clearTimeout(this.debounceTimer)

    // Debounce: wait 1000ms before sending to API
    this.debounceTimer = setTimeout(() => {
      this._auditWithMistral(text, fabricTextObject)
    }, this.config.debounceMs)
  }

  /**
   * Internal: Send to Mistral API
   */
  async _auditWithMistral(text, fabricTextObject) {
    if (!text || text.trim().length === 0) {
      console.log('[TextAuditor] Empty text, skipping audit')
      return
    }

    try {
      const response = await fetch(this.config.mistralEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          prompt:
            'Does this text contain a refund promise, a lottery, or an eco-claim? Answer YES/NO only.'
        })
      })

      const data = await response.json()

      if (data.response && data.response.includes('YES')) {
        console.warn('[TextAuditor] Compliance violation found:', text)

        // Apply warning style to the text object
        if (fabricTextObject && this.canvas) {
          fabricTextObject.set({
            stroke: '#FCD34D',
            strokeWidth: 2
          })
          this.canvas.renderAll()
          console.log('[TextAuditor] Yellow warning stroke applied')
        }

        return { flagged: true, reason: 'Compliance violation' }
      } else {
        // Clear warning if text is now compliant
        if (fabricTextObject) {
          fabricTextObject.set({ stroke: null, strokeWidth: 0 })
          this.canvas.renderAll()
        }
        return { flagged: false }
      }
    } catch (error) {
      console.error('[TextAuditor] Mistral audit failed:', error.message)
      console.log('[TextAuditor] Falling back to regex patterns')
      return this._auditWithRegex(text, fabricTextObject)
    }
  }

  /**
   * Fallback: Regex-based audit if Mistral is unavailable
   */
  _auditWithRegex(text, fabricTextObject) {
    const violations = []

    // Check for refund promises
    if (/money back|refund|satisfaction guarantee/i.test(text)) {
      violations.push('refund_promise')
    }

    // Check for lottery
    if (/lottery|prize|win|contest/i.test(text)) {
      violations.push('lottery')
    }

    // Check for eco-claims
    if (/organic|eco-friendly|natural|sustainable/i.test(text)) {
      violations.push('eco_claim')
    }

    if (violations.length > 0) {
      console.warn('[TextAuditor] Regex violations found:', violations)

      if (fabricTextObject && this.canvas) {
        fabricTextObject.set({ stroke: '#FCD34D', strokeWidth: 2 })
        this.canvas.renderAll()
      }

      return { flagged: true, violations }
    }

    return { flagged: false }
  }

  // ============================================================================
  // CONSTRAINT 2: PRICE FILTER
  // ============================================================================
  /**
   * Detect pricing content
   * Call in: textbox:changed event
   * 
   * Usage:
   *   canvas.on('text:changed', (e) => {
   *     auditor.detectPrice(e.target.text, e.target)
   *   })
   */
  detectPrice(text, fabricTextObject = null) {
    if (this.config.pricePattern.test(text)) {
      console.warn('[TextAuditor] Price detected:', text)

      if (fabricTextObject) {
        fabricTextObject.set({ fill: '#FF6B6B' })
        if (this.canvas) this.canvas.renderAll()
      }

      alert('⚠️ Pricing content detected. May require regulatory review.')
      return true
    }

    return false
  }

  // ============================================================================
  // CONSTRAINT 3: DATE MASK (DD/MM FORMAT)
  // ============================================================================
  /**
   * Enforce DD/MM date format
   * Call in: text:changed event for date fields
   * 
   * Usage:
   *   if (textObject.type === 'date_field') {
   *     auditor.validateDateFormat(e.target.text, e.target)
   *   }
   */
  validateDateFormat(text, fabricTextObject = null) {
    if (!text) return { valid: false, message: 'Date required' }

    // Reject month names
    if (/january|february|march|april|may|june|july|august|september|october|november|december/i.test(text)) {
      console.warn('[TextAuditor] Month name detected, rejecting:', text)

      if (fabricTextObject) {
        fabricTextObject.set({ fill: '#FF6B6B' })
        if (this.canvas) this.canvas.renderAll()
      }

      return {
        valid: false,
        message: 'Month names not allowed. Use DD/MM format (e.g., 25/12)'
      }
    }

    // Validate DD/MM format
    if (!this.config.datePattern.test(text)) {
      if (fabricTextObject) {
        fabricTextObject.set({ fill: '#FF6B6B' })
        if (this.canvas) this.canvas.renderAll()
      }

      return {
        valid: false,
        message: 'Invalid format. Use DD/MM (e.g., 25/12)'
      }
    }

    // Valid date
    if (fabricTextObject) {
      fabricTextObject.set({ fill: '#000000' }) // Reset to normal
      if (this.canvas) this.canvas.renderAll()
    }

    return { valid: true, formatted: text }
  }

  /**
   * Auto-replace month names with placeholder
   * 
   * Usage:
   *   fabricTextObject.text = auditor.sanitizeDateInput(fabricTextObject.text)
   */
  sanitizeDateInput(text) {
    // Replace month names with empty
    return text.replace(
      /january|february|march|april|may|june|july|august|september|october|november|december/gi,
      ''
    )
  }

  // ============================================================================
  // UTILITY
  // ============================================================================
  /**
   * Reset auditor state
   */
  reset() {
    clearTimeout(this.debounceTimer)
    this.currentText = ''
    this.activeObject = null
    console.log('[TextAuditor] Reset')
  }
}

export default TextAuditor
