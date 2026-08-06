import { useStore } from '../store/useStore'
import {
  LayoutDashboard, CalendarDays, Calendar, BarChart3,
  Target, Zap, StickyNote, Flame, Trophy, ChevronRight
} from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'planner', label: 'Study Planner', icon: Calendar },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'tests', label: 'Test Analytics', icon: BarChart3 },
  { id: 'revision', label: 'Revision System', icon: Target },
  { id: 'notes', label: 'Important Notes', icon: StickyNote },
  { id: 'focus', label: 'Focus Mode', icon: Zap },
]

export default function Sidebar() {
  const { activeView, setActiveView, streakDays, xp, tasks, focusSessions } = useStore()
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => task.date === today)
  const completedTasks = todayTasks.filter(task => task.completed).length
  const studyHoursToday = focusSessions
    .filter(session => session.date === today)
    .reduce((total, session) => total + session.duration / 60, 0)
  const productivityScore = Math.min(100,
    (studyHoursToday > 0 ? Math.round((studyHoursToday / 8) * 50) : 0) +
    (todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 50) : 0)
  )
  const handleNavigation = (view: string) => {
    setActiveView(view)
    if (view === 'focus' && document.fullscreenElement === null) {
      const request = document.documentElement.requestFullscreen?.()
      if (request) void request.catch(() => undefined)
    }
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-mark">JEE</div>
        <div>
          <div className="sidebar-brand-name">COMMAND CENTER</div>
          <div className="sidebar-brand-sub">Preparation, engineered.</div>
        </div>
      </div>

      <div className="sidebar-stats">
        <div className="sidebar-stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <Flame size={11} color="var(--amber)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber)' }}>{streakDays}</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>STREAK</div>
        </div>
        <div className="sidebar-stat">
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <Trophy size={11} color="var(--neon)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon)' }}>{(xp / 1000).toFixed(1)}k</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>XP</div>
        </div>
        <div className="sidebar-stat">
          <div style={{ fontSize: 13, fontWeight: 800, color: productivityScore > 70 ? 'var(--neon)' : 'var(--amber)' }}>{productivityScore}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>SCORE</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="section-title sidebar-nav-label">NAVIGATION</div>
        {NAV.map(item => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <div
              key={item.id}
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => handleNavigation(item.id)}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={15} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={12} />}
            </div>
          )
        })}
      </nav>

    </aside>
  )
}
