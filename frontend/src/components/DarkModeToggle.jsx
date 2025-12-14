import React, { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { updateCanvasTheme } from '../utils/updateCanvasTheme'

export default function DarkModeToggle({ position = 'fixed' }) {
  const [theme, toggleTheme] = useDarkMode()

  // Update canvas theme whenever theme changes
  useEffect(() => {
    const canvas = window.fabricCanvas
    if (canvas) {
      console.log('[DarkModeToggle] Updating canvas:', theme)
      updateCanvasTheme(canvas, theme === 'dark')
    }
  }, [theme])

  const handleClick = () => {
    console.log('[DarkModeToggle] Click - current theme:', theme)
    toggleTheme()
  }

  const positionClasses = position === 'fixed' ? 'fixed top-4 left-4 z-50' : 'relative'

  return (
    <button
      onClick={handleClick}
      className={`
        ${positionClasses} px-3 py-2 rounded-lg shadow-lg 
        transition-all duration-300 font-medium text-sm
        ${
          theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
            : 'bg-white hover:bg-slate-100 text-slate-700'
        }
        border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title="Toggle Dark Mode"
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        {theme === 'dark' ? (
          <>
            <Sun size={16} />
            {position === 'fixed' && <span>Light</span>}
          </>
        ) : (
          <>
            <Moon size={16} />
            {position === 'fixed' && <span>Dark</span>}
          </>
        )}
      </div>
    </button>
  )
}
