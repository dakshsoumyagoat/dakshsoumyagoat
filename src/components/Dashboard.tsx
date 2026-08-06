import { useStore } from '../store/useStore'
import { Clock, CheckCircle2, Zap, BarChart2, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader, PageShell } from './PageShell'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getHeatColor(h: number) {
  if (h === 0) return 'var(--bg-elevated)'
  if (h < 1)  return '#0a3d00'
  if (h < 2)  return '#145200'
  if (h < 4)  return '#1a6e00'
  if (h < 6)  return '#25a000'
  return '#39ff14'
}

export default function Dashboard() {
  const { tasks, mockTests, focusSessions, streakDays } = useStore()

  const today      = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.date === today)
  const completedTasks = todayTasks.filter(t => t.completed).length

  // ── Computed stats ──────────────────────────────────────────────────────────
  const studyHoursToday = focusSessions
    .filter(s => s.date === today)
    .reduce((a, s) => a + s.duration / 60, 0)

  const todayTaskTotal = todayTasks.length
  const focusScore = studyHoursToday > 0 ? Math.min(100, Math.round((studyHoursToday / 8) * 50)) : 0
  const taskScore  = todayTaskTotal  > 0 ? Math.round((completedTasks / todayTaskTotal) * 50) : 0
  const productivityScore = focusScore + taskScore

  const latestTest = mockTests.length > 0 ? mockTests[mockTests.length - 1] : null

  // ── Study hours bar (this week from focusSessions) ─────────────────────────
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const weeklyHours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    return focusSessions.filter(s => s.date === dateStr).reduce((a, s) => a + s.duration / 60, 0)
  })
  const totalWeekHours = weeklyHours.reduce((a, b) => a + b, 0)

  // ── Heatmap: last 12 weeks from focusSessions ─────────────────────────────
  const heatmapCells = Array.from({ length: 12 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date()
      date.setDate(date.getDate() - (11 - w) * 7 - ((date.getDay() + 6) % 7) + d)
      const dateStr = date.toISOString().split('T')[0]
      const hours = focusSessions
        .filter(s => s.date === dateStr)
        .reduce((a, s) => a + s.duration / 60, 0)
      return { date, hours }
    })
  )

  const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) }

  return (
    <PageShell>
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fade}
        style={{ marginBottom: 24 }}>
        <PageHeader
          eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          title="Command Center"
          description="Your JEE preparation, engineered."
        />
      </motion.div>

      {/* Top Stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Focus Today',        value: studyHoursToday > 0 ? studyHoursToday.toFixed(1) + 'h' : '0h', icon: Clock, color: 'var(--neon)', sub: 'From completed sessions' },
          { label: 'Productivity Score', value: productivityScore, icon: Zap, color: 'var(--amber)', sub: 'Tasks + focus combined' },
          { label: 'Day Streak',         value: streakDays + ' days', icon: Flame, color: '#ff6b35', sub: streakDays > 0 ? 'Keep it going!' : 'Start your streak!' },
          { label: 'Mock Score',         value: latestTest ? latestTest.total : '—', icon: BarChart2, color: 'var(--purple)', sub: latestTest ? `/${latestTest.maxMarks} marks` : 'No tests yet' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} className="card" custom={i + 1} initial="hidden" animate="visible" variants={fade}
              style={{ padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ color: stat.color, opacity: 0.2, position: 'absolute', right: 12, top: 12 }}>
                <Icon size={28} />
              </div>
              <div className="section-title" style={{ marginBottom: 8 }}>{stat.label}</div>
              <div className="stat-number" style={{ color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.sub}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="content-grid" style={{ marginBottom: 16 }}>
        {/* Study Hours this week */}
        <motion.div className="card" custom={7} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title">THIS WEEK</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>Study Hours</div>
            </div>
            <span className="badge badge-blue">{totalWeekHours.toFixed(1)}h total</span>
          </div>
          {totalWeekHours === 0 ? (
            <div style={{ height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, gap: 6 }}>
              <Clock size={28} opacity={0.3} />
              <span>No focus sessions this week</span>
              <span style={{ fontSize: 10 }}>Use Focus Mode to track study time</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
              {DAYS.map((day, i) => {
                const h = weeklyHours[i]
                const maxH = Math.max(...weeklyHours, 1)
                const isToday = i === (now.getDay() + 6) % 7
                return (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', height: `${(h / maxH) * 100}%`,
                      background: isToday ? 'var(--neon)' : 'var(--bg-elevated)',
                      borderRadius: '4px 4px 0 0',
                      boxShadow: isToday && h > 0 ? '0 0 8px var(--neon)' : 'none',
                      minHeight: h > 0 ? 4 : 2,
                      transition: 'height 0.4s',
                      position: 'relative',
                    }}>
                      {isToday && h > 0 && (
                        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--neon)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {h.toFixed(1)}h
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{day}</div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>

      {/* Bottom row */}
      <div className="content-grid" style={{ marginBottom: 16 }}>
        {/* Today's Tasks */}
        <motion.div className="card" custom={10} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Today's Targets</div>
            <span className="badge badge-neon">{completedTasks}/{todayTasks.length}</span>
          </div>
          {todayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              No tasks for today yet.<br />
              <span style={{ fontSize: 10 }}>Add tasks in Study Planner.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {todayTasks.slice(0, 5).map(task => {
                const colors: Record<string, string> = { Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)', General: 'var(--purple)' }
                return (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: task.completed ? 'var(--neon)' : 'transparent',
                      border: task.completed ? 'none' : '1.5px solid var(--border-bright)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {task.completed && <CheckCircle2 size={12} color="#000" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none', fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: 10, color: colors[task.subject] || 'var(--text-muted)' }}>{task.subject} · {task.duration}m</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>

      {/* Heatmap */}
      <motion.div className="card" custom={12} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="section-title">CONSISTENCY</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>Study Heatmap — Last 12 Weeks</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
            {[0, 0.5, 2, 4, 6].map((v, i) => (
              <div key={i} className="heatmap-cell" style={{ background: getHeatColor(v) }} />
            ))}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>More</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {heatmapCells.map((week, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((day, d) => (
                <div key={d} className="heatmap-cell"
                  title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.hours.toFixed(1)}h`}
                  style={{ background: getHeatColor(day.hours) }} />
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </PageShell>
  )
}
