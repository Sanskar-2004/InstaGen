import React, { useState } from 'react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import DarkModeToggle from '../DarkModeToggle'

export default function EditorLayout({ children }) {
  const [activeMobileDrawer, setActiveMobileDrawer] = useState(null) // null | 'left' | 'right'

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden select-none">
      
      {/* MOBILE TOP NAVBAR (< md screens) */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs z-30 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-600 dark:from-indigo-600 dark:to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
            ✨
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              InstaGen
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/50 dark:border-indigo-800/50 uppercase">
              STUDIO
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DarkModeToggle position="relative" />
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (Shown on md+ screens) */}
      <div className="hidden md:flex w-80 h-full flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <LeftSidebar />
      </div>

      {/* MOBILE LEFT SIDEBAR DRAWER (< md screens) */}
      <div className={`
        md:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
        ${activeMobileDrawer === 'left' ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex-shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">🎨 Generator Tools</span>
          <button 
            onClick={() => setActiveMobileDrawer(null)}
            className="px-2 py-1 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold"
          >
            ✕ Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <LeftSidebar />
        </div>
      </div>

      {/* MAIN CANVAS WORKSPACE */}
      <main className="flex-1 h-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 flex flex-col min-w-0">
        {children}
      </main>

      {/* DESKTOP RIGHT SIDEBAR (Shown on md+ screens) */}
      <div className="hidden md:flex w-80 h-full flex-shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <RightSidebar />
      </div>

      {/* MOBILE RIGHT SIDEBAR DRAWER (< md screens) */}
      <div className={`
        md:hidden fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
        ${activeMobileDrawer === 'right' ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex-shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">⚙️ Inspector & Layers</span>
          <button 
            onClick={() => setActiveMobileDrawer(null)}
            className="px-2 py-1 rounded-md text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold"
          >
            ✕ Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <RightSidebar />
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {activeMobileDrawer && (
        <div 
          onClick={() => setActiveMobileDrawer(null)}
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* MOBILE BOTTOM TOOLBAR (< md screens) */}
      <nav className="md:hidden flex items-center justify-around bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-2 px-4 z-30 shadow-lg flex-shrink-0">
        <button
          onClick={() => setActiveMobileDrawer(activeMobileDrawer === 'left' ? null : 'left')}
          className={`flex flex-col items-center space-y-1 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
            activeMobileDrawer === 'left' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="text-base">🎨</span>
          <span>Tools</span>
        </button>

        <button
          onClick={() => setActiveMobileDrawer(null)}
          className={`flex flex-col items-center space-y-1 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
            activeMobileDrawer === null ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="text-base">🎯</span>
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setActiveMobileDrawer(activeMobileDrawer === 'right' ? null : 'right')}
          className={`flex flex-col items-center space-y-1 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all ${
            activeMobileDrawer === 'right' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="text-base">⚙️</span>
          <span>Layers</span>
        </button>
      </nav>

    </div>
  )
}