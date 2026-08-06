import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import StudyPlanner from './components/StudyPlanner'
import TestAnalytics from './components/TestAnalytics'
import RevisionSystem from './components/RevisionSystem'
import FocusMode from './components/FocusMode'
import CalendarView from './components/CalendarView'
import ImportantNotes from './components/ImportantNotes'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useEffect, useRef } from 'react'

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  planner: StudyPlanner,
  calendar: CalendarView,
  tests: TestAnalytics,
  revision: RevisionSystem,
  notes: ImportantNotes,
}

export default function App() {
  const { activeView, setActiveView } = useStore()
  const View = VIEWS[activeView] || Dashboard
  const previousViewRef = useRef('dashboard')

  useEffect(() => {
    if (activeView !== 'focus') previousViewRef.current = activeView
  }, [activeView])

  useEffect(() => {
    if (activeView !== 'focus') return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) setActiveView(previousViewRef.current)
    }
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && activeView === 'focus') setActiveView(previousViewRef.current)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [activeView, setActiveView])

  const exitFocus = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    setActiveView(previousViewRef.current)
  }

  return (
    <div className={`app-shell ${activeView === 'focus' ? 'focus-active' : ''}`}>
      <Sidebar />
      <main className="app-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'focus' ? <FocusMode onExit={exitFocus} /> : <View />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}
