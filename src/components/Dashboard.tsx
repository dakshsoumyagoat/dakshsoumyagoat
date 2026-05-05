import { useStore } from '../store/useStore'
import type { Subject } from '../store/useStore'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { Brain, Clock, AlertTriangle, CheckCircle2, Zap, BookOpen, BarChart2, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MASTERY_SCORE: Record<string, number> = {
  'Not Started': 0, 'Weak': 20, 'Average': 50, 'Strong': 75, 'Mastered': 100,
}

function getHeatColor(h: number) {
  if (h === 0) return 'var(--bg-elevated)'
  if (h < 1)  return '#0a3d00'
  if (h < 2)  return '#145200'
  if (h < 4)  return '#1a6e00'
  if (h < 6)  return '#25a000'
  return '#39ff14'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ color: 'var(--neon)', fontWeight: 700 }}>{payload[0].value}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{payload[0].name}</div>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { chapters, tasks, mockTests, focusSessions, streakDays } = useStore()

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

  const overallProgress = chapters.length > 0
    ? Math.round(chapters.reduce((a, c) => a + c.theory, 0) / chapters.length)
    : 0

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

  // ── Mock test trend ─────────────────────────────────────────────────────────
  const scoreData = mockTests.slice(-8).map((t, i) => ({ week: `T${i + 1}`, score: t.total }))
  const scoreDelta = mockTests.length >= 2
    ? mockTests[mockTests.length - 1].total - mockTests[mockTests.length - 2].total
    : null

  // ── Radar: mastery by subject + PYQs + Revision + Mocks ───────────────────
  const subjectAvg = (sub: Subject) => {
    const sc = chapters.filter(c => c.subject === sub)
    return sc.length > 0 ? Math.round(sc.reduce((a, c) => a + MASTERY_SCORE[c.mastery], 0) / sc.length) : 0
  }
  const pyqAvg = chapters.length > 0
    ? Math.round(chapters.reduce((a, c) => a + c.pyqs, 0) / chapters.length) : 0
  const revisionAvg = chapters.filter(c => c.revisionCount > 0).length > 0
    ? Math.round(chapters.filter(c => c.revisionCount > 0)
        .reduce((a, c) => a + Math.min(c.revisionCount / 5, 1) * 100, 0)
        / chapters.filter(c => c.revisionCount > 0).length)
    : 0
  const mockAvg = mockTests.length > 0
    ? Math.round(mockTests.reduce((a, t) => a + t.accuracy, 0) / mockTests.length) : 0

  const radarData = [
    { subject: 'Physics',   score: subjectAvg('Physics') },
    { subject: 'Chemistry', score: subjectAvg('Chemistry') },
    { subject: 'Maths',     score: subjectAvg('Mathematics') },
    { subject: 'PYQs',      score: pyqAvg },
    { subject: 'Revision',  score: revisionAvg },
    { subject: 'Mocks',     score: mockAvg },
  ]

  // ── Weak chapters — mastery === 'Weak' only, by subject ───────────────────
  const weakChapters = chapters.filter(c => c.mastery === 'Weak')
  const weakBySubject: Record<string, typeof weakChapters> = { Physics: [], Chemistry: [], Mathematics: [] }
  weakChapters.forEach(c => weakBySubject[c.subject]?.push(c))
  const subjectColors: Record<string, string> = {
    Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)',
  }

  // ── AI Insights: data-driven ───────────────────────────────────────────────
  const insights: { type: string; text: string }[] = []
  const notStarted = chapters.filter(c => c.mastery === 'Not Started').length
  const weakCount  = chapters.filter(c => c.mastery === 'Weak').length
  const dueToday   = chapters.filter(c => {
    if (!c.nextRevision) return false
    return new Date(c.nextRevision).getTime() <= Date.now()
  }).length

  const lowestSub = (['Physics', 'Chemistry', 'Mathematics'] as Subject[])
    .sort((a, b) => subjectAvg(a) - subjectAvg(b))[0]
  const lowestAvg = subjectAvg(lowestSub)

  if (weakCount > 0)
    insights.push({ type: 'danger', text: `${weakCount} chapter${weakCount > 1 ? 's' : ''} marked Weak — review these before your next mock.` })
  if (dueToday > 0)
    insights.push({ type: 'warning', text: `${dueToday} revision${dueToday > 1 ? 's' : ''} due today. Open Revision System to mark them done.` })

  if (lowestAvg < 30)
    insights.push({ type: 'warning', text: `${lowestSub} needs the most attention — avg mastery is at ${lowestAvg}%.` })
  if (completedTasks > 0 && todayTaskTotal > 0)
    insights.push({ type: 'success', text: `${completedTasks}/${todayTaskTotal} tasks done today. ${completedTasks === todayTaskTotal ? 'All done — great work!' : 'Keep going!'}` })

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
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fade}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Command Center</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>Your JEE preparation, engineered.</div>
        </div>
        <img src="./logo2.png" alt="JEE Dashboard Globe"
          style={{ width: 64, height: 64, objectFit: 'contain', filter: 'drop-shadow(0 0 12px #39ff1466)', opacity: 0.85, flexShrink: 0 }} />
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Focus Today',        value: studyHoursToday > 0 ? studyHoursToday.toFixed(1) + 'h' : '0h', icon: Clock, color: 'var(--neon)', sub: 'From completed sessions' },
          { label: 'Productivity Score', value: productivityScore, icon: Zap, color: 'var(--amber)', sub: 'Tasks + focus combined' },
          { label: 'Syllabus Done',      value: overallProgress + '%', icon: BookOpen, color: 'var(--blue)', sub: 'Across all subjects' },
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, marginBottom: 16 }}>

        {/* Mock Test Trend */}
        <motion.div className="card" custom={6} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title">SCORE PROGRESSION</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>Mock Test Trend</div>
            </div>
            {scoreDelta !== null && (
              <span className={`badge ${scoreDelta >= 0 ? 'badge-neon' : 'badge-red'}`}>
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
              </span>
            )}
          </div>
          {scoreData.length < 2 ? (
            <div style={{ height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, gap: 6 }}>
              <BarChart2 size={28} opacity={0.3} />
              <span>No mock tests recorded yet</span>
              <span style={{ fontSize: 10 }}>Add tests in Test Analytics to see your trend</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={scoreData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39ff14" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 360]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#39ff14" strokeWidth={2} fill="url(#scoreGrad)" name="Score" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

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

        {/* Skill Radar */}
        <motion.div className="card" custom={8} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div className="section-title" style={{ marginBottom: 4 }}>SKILL RADAR</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Mastery Overview</div>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a1a1a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#39ff14" fill="#39ff14" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Smart Insights */}
        <motion.div className="card" custom={9} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Brain size={16} color="var(--neon)" />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Smart Insights</div>
          </div>
          {insights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              <Brain size={24} opacity={0.3} style={{ margin: '0 auto 8px' }} />
              <div>Start studying to get personalized insights.</div>
              <div style={{ fontSize: 10, marginTop: 4 }}>Mark chapters, complete tasks, or run focus sessions.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {insights.slice(0, 4).map((insight, i) => (
                <div key={i} style={{
                  padding: '8px 10px', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
                  background: insight.type === 'danger' ? '#ff444408' : insight.type === 'warning' ? '#ffaa0008' : insight.type === 'success' ? '#39ff1408' : '#3b82f608',
                  borderLeft: `2px solid ${insight.type === 'danger' ? 'var(--red)' : insight.type === 'warning' ? 'var(--amber)' : insight.type === 'success' ? 'var(--neon)' : 'var(--blue)'}`,
                }}>
                  {insight.text}
                </div>
              ))}
            </div>
          )}
        </motion.div>

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

        {/* Weak Chapters — only mastery === 'Weak', by subject */}
        <motion.div className="card" custom={11} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={15} color="var(--red)" />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Weak Chapters</div>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{weakChapters.length}</span>
          </div>
          {weakChapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              <CheckCircle2 size={24} color="var(--neon)" opacity={0.4} style={{ margin: '0 auto 8px' }} />
              <div>No weak chapters!</div>
              <div style={{ fontSize: 10, marginTop: 4 }}>Mark chapters as Weak in Syllabus Tracker to track them here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['Physics', 'Chemistry', 'Mathematics'] as (keyof typeof weakBySubject)[]).map(sub => {
                const list = weakBySubject[sub]
                if (!list || list.length === 0) return null
                return (
                  <div key={sub}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: subjectColors[sub], marginBottom: 4, letterSpacing: '0.06em' }}>
                      {sub.toUpperCase()} · {list.length}
                    </div>
                    {list.slice(0, 3).map(ch => (
                      <div key={ch.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{ch.name}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{ch.unit}</div>
                        </div>
                        <div style={{ width: 50, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${ch.theory}%`, height: '100%', background: 'var(--red)', borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                    {list.length > 3 && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>+{list.length - 3} more</div>
                    )}
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
    </div>
  )
}
