import { useEffect, useState } from 'react'
import EditorLayout from './components/layout/EditorLayout'
import CanvasEditor from './components/CanvasEditor'

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize dark mode on mount
    const theme = localStorage.getItem('theme') || 'light'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <EditorLayout>
      <CanvasEditor />
    </EditorLayout>
  )
}

export default App
