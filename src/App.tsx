import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import StudyPlanner from './components/StudyPlanner'
import TestAnalytics from './components/TestAnalytics'
import RevisionSystem from './components/RevisionSystem'
import FocusMode from './components/FocusMode'
import CalendarView from './components/CalendarView'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  planner: StudyPlanner,
  calendar: CalendarView,
  tests: TestAnalytics,
  revision: RevisionSystem,
  focus: FocusMode,
}

export default function App() {
  const { activeView } = useStore()
  const View = VIEWS[activeView] || Dashboard

  return (
    <div className="app-shell">
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
            <View />
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
