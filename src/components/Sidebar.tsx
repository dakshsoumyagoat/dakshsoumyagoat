import { useStore } from '../store/useStore'
import {
  LayoutDashboard, BookOpen, Calendar, BarChart3,
  Target, Zap, BookMarked, FlaskConical, Flame, Trophy, ChevronRight
} from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'syllabus', label: 'Syllabus Tracker', icon: BookOpen },
  { id: 'planner', label: 'Study Planner', icon: Calendar },
  { id: 'tests', label: 'Test Analytics', icon: BarChart3 },
  { id: 'revision', label: 'Revision System', icon: Target },
  { id: 'focus', label: 'Focus Mode', icon: Zap },
  { id: 'questions', label: 'Question Bank', icon: BookMarked },
  { id: 'vault', label: 'Formula Vault', icon: FlaskConical },
]

export default function Sidebar() {
  const { activeView, setActiveView, streakDays, xp, productivityScore } = useStore()

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--neon)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 12,
          }}>JCC</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.1 }}>JEE Command</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--neon)', lineHeight: 1.1 }}>Center</div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 6, padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <Flame size={11} color="var(--amber)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber)' }}>{streakDays}</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>STREAK</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <Trophy size={11} color="var(--neon)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon)' }}>{(xp / 1000).toFixed(1)}k</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>XP</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: productivityScore > 70 ? 'var(--neon)' : 'var(--amber)' }}>{productivityScore}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>SCORE</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        <div className="section-title" style={{ padding: '8px 6px 6px' }}>NAVIGATION</div>
        {NAV.map(item => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <div
              key={item.id}
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
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
