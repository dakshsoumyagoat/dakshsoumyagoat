import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import SyllabusTracker from './components/SyllabusTracker'
import StudyPlanner from './components/StudyPlanner'
import TestAnalytics from './components/TestAnalytics'
import RevisionSystem from './components/RevisionSystem'
import FocusMode from './components/FocusMode'
import QuestionBank from './components/QuestionBank'
import FormulaVault from './components/FormulaVault'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

const VIEWS: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  syllabus: SyllabusTracker,
  planner: StudyPlanner,
  tests: TestAnalytics,
  revision: RevisionSystem,
  focus: FocusMode,
  questions: QuestionBank,
  vault: FormulaVault,
}

export default function App() {
  const { activeView } = useStore()
  const View = VIEWS[activeView] || Dashboard

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
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
