import { useState, useEffect } from 'react'

/**
 * Custom Hook: useDarkMode
 * Manages dark mode state with localStorage persistence
 * Automatically adds/removes 'dark' class to document.documentElement
 * 
 * Usage:
 *   const [theme, toggleTheme] = useDarkMode()
 *   // theme = 'light' or 'dark'
 *   // toggleTheme() to switch
 */
export function useDarkMode() {
  const [theme, setTheme] = useState('light')

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const initialTheme = saved || 'light'
    
    setTheme(initialTheme)
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    console.log('[useDarkMode] Initialized with:', initialTheme)
  }, [])

  // Update DOM when theme changes
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      document.body.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
    console.log('[useDarkMode] Theme updated to:', theme)
    console.log('[useDarkMode] Dark class on html:', root.classList.contains('dark'))
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return [theme, toggleTheme]
}

export default useDarkMode
