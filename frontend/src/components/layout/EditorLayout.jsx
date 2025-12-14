import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

export default function EditorLayout({ children }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <LeftSidebar />
      <main className="flex-1 overflow-hidden bg-white">
        {children}
      </main>
      <RightSidebar />
    </div>
  )
}