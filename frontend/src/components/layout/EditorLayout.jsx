import React, { useState } from 'react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import DarkModeToggle from '../DarkModeToggle'

export default function EditorLayout({ children }) {
  const [activeMobileDrawer, setActiveMobileDrawer] = useState(null) // null | 'left' | 'right'

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      
      {/* MOBILE TOP NAVBAR (< md screens) */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-30">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow">
            ✨
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            InstaGen
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <DarkModeToggle />
        </div>
      </header>

      {/* DESKTOP & MOBILE LEFT SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto
        ${activeMobileDrawer === 'left' ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Mobile Drawer Close Button */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">🎨 Generator Tools</span>
          <button 
            onClick={() => setActiveMobileDrawer(null)}
            className="p-1 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold"
          >
            ✕ Close
          </button>
        </div>
        <LeftSidebar />
      </div>

      {/* MAIN CANVAS AREA */}
      <main className="flex-1 relative overflow-hidden bg-slate-100 dark:bg-slate-900 flex flex-col">
        {children}
      </main>

      {/* DESKTOP & MOBILE RIGHT SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto
        ${activeMobileDrawer === 'right' ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}
      `}>
        {/* Mobile Drawer Close Button */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">⚙️ Inspector & Layers</span>
          <button 
            onClick={() => setActiveMobileDrawer(null)}
            className="p-1 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold"
          >
            ✕ Close
          </button>
        </div>
        <RightSidebar />
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {activeMobileDrawer && (
        <div 
          onClick={() => setActiveMobileDrawer(null)}
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (< md screens) */}
      <nav className="md:hidden flex items-center justify-around bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-2 px-4 z-20 shadow-lg">
        <button
          onClick={() => setActiveMobileDrawer(activeMobileDrawer === 'left' ? null : 'left')}
          className={`flex flex-col items-center space-y-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            activeMobileDrawer === 'left' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="text-base">🎨</span>
          <span>Tools</span>
        </button>

        <button
          onClick={() => setActiveMobileDrawer(null)}
          className={`flex flex-col items-center space-y-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            activeMobileDrawer === null ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="text-base">🎯</span>
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setActiveMobileDrawer(activeMobileDrawer === 'right' ? null : 'right')}
          className={`flex flex-col items-center space-y-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            activeMobileDrawer === 'right' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="text-base">⚙️</span>
          <span>Layers</span>
        </button>
      </nav>

    </div>
  )
}