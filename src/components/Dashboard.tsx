import { useStore } from '../store/useStore'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { Brain, Clock, AlertTriangle, CheckCircle2, Zap, BookOpen, BarChart2, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const studyHours = [6.5, 4.2, 7.8, 5.5, 8.2, 9.1, 4.5]
const scoreData = [
  { week: 'W1', score: 145 },
  { week: 'W2', score: 162 },
  { week: 'W3', score: 158 },
  { week: 'W4', score: 178 },
  { week: 'W5', score: 185 },
  { week: 'W6', score: 201 },
  { week: 'W7', score: 198 },
  { week: 'W8', score: 215 },
]

const radarData = [
  { subject: 'Physics', score: 72 },
  { subject: 'Chemistry', score: 65 },
  { subject: 'Maths', score: 81 },
  { subject: 'PYQs', score: 58 },
  { subject: 'Revision', score: 44 },
  { subject: 'Mocks', score: 69 },
]

const aiInsights = [
  { type: 'warning', text: 'Rotational mechanics accuracy drops after 90 min sessions. Consider splitting into 45-min blocks.' },
  { type: 'info', text: 'You perform best between 7 PM – 10 PM. Schedule hard topics then.' },
  { type: 'danger', text: 'Organic chemistry retention weakening. Last revised 12 days ago.' },
  { type: 'success', text: 'Integration problem speed improved 23% this week. Keep the momentum.' },
]

// Generate heatmap for last 12 weeks
const generateHeatmap = () => {
  const cells: { week: number; day: number; hours: number }[] = []
  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 7; d++) {
      cells.push({ week: w, day: d, hours: Math.random() > 0.15 ? Math.random() * 10 : 0 })
    }
  }
  return cells
}
const heatmapData = generateHeatmap()

function getHeatColor(h: number) {
  if (h === 0) return '#0d0d0d'
  if (h < 2) return '#0a3d00'
  if (h < 4) return '#145200'
  if (h < 6) return '#1a6e00'
  if (h < 8) return '#25a000'
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
  const { chapters, tasks, mockTests, studyHoursToday, productivityScore, streakDays } = useStore()

  const completedTasks = tasks.filter(t => t.completed).length
  const latestTest = mockTests[mockTests.length - 1]
  const weakChapters = chapters.filter(c => c.mastery === 'Weak' || c.mastery === 'Not Started').slice(0, 4)
  const overallProgress = Math.round(chapters.reduce((a, c) => a + c.theory, 0) / chapters.length)

  const fade = { hidden: { opacity: 0, y: 12 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }) }

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fade} style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Command Center
        </h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
          Your JEE preparation, engineered.
        </div>
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Study Hours Today', value: studyHoursToday + 'h', icon: Clock, color: 'var(--neon)', sub: '+0.5h vs avg' },
          { label: 'Productivity Score', value: productivityScore, icon: Zap, color: 'var(--amber)', sub: '↑ 4pts this week' },
          { label: 'Syllabus Done', value: overallProgress + '%', icon: BookOpen, color: 'var(--blue)', sub: 'Across all subjects' },
          { label: 'Day Streak', value: streakDays + ' days', icon: Flame, color: '#ff6b35', sub: 'Personal best: 21' },
          { label: 'Mock Score', value: latestTest ? latestTest.total : '—', icon: BarChart2, color: 'var(--purple)', sub: latestTest ? `/${latestTest.maxMarks} marks` : 'No tests yet' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} className="card" custom={i + 1} initial="hidden" animate="visible" variants={fade}
              style={{ padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ color: stat.color, opacity: 0.3, position: 'absolute', right: 12, top: 12 }}>
                  <Icon size={28} />
                </div>
                <div className="section-title">{stat.label}</div>
              </div>
              <div className="stat-number" style={{ color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.sub}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16, marginBottom: 16 }}>
        {/* Score Trend */}
        <motion.div className="card" custom={6} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title">SCORE PROGRESSION</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>Mock Test Trend</div>
            </div>
            <span className="badge badge-neon">+48 pts</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={scoreData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39ff14" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} domain={[100, 300]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#39ff14" strokeWidth={2} fill="url(#scoreGrad)" name="Score" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Study Hours */}
        <motion.div className="card" custom={7} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title">THIS WEEK</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>Study Hours</div>
            </div>
            <span className="badge badge-blue">{studyHours.reduce((a, b) => a + b, 0).toFixed(0)}h total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
            {DAYS.map((day, i) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', height: `${(studyHours[i] / 10) * 100}%`,
                  background: i === 6 ? 'var(--neon)' : '#1a1a1a',
                  borderRadius: '4px 4px 0 0',
                  boxShadow: i === 6 ? '0 0 8px var(--neon)' : 'none',
                  minHeight: 4,
                  transition: 'height 0.4s',
                  position: 'relative',
                }}>
                  {i === 6 && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--neon)', fontWeight: 700, whiteSpace: 'nowrap' }}>{studyHours[i]}h</div>}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{day}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar */}
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
        {/* AI Insights */}
        <motion.div className="card" custom={9} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Brain size={16} color="var(--neon)" />
            <div style={{ fontWeight: 700, fontSize: 14 }}>AI Insights</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aiInsights.map((insight, i) => (
              <div key={i} style={{
                padding: '8px 10px', borderRadius: 8,
                background: insight.type === 'danger' ? '#ff444408' : insight.type === 'warning' ? '#ffaa0008' : insight.type === 'success' ? '#39ff1408' : '#3b82f608',
                borderLeft: `2px solid ${insight.type === 'danger' ? 'var(--red)' : insight.type === 'warning' ? 'var(--amber)' : insight.type === 'success' ? 'var(--neon)' : 'var(--blue)'}`,
                fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                {insight.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div className="card" custom={10} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Today's Targets</div>
            <span className="badge badge-neon">{completedTasks}/{tasks.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.slice(0, 5).map(task => {
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
        </motion.div>

        {/* Weak Chapters */}
        <motion.div className="card" custom={11} initial="hidden" animate="visible" variants={fade} style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={15} color="var(--red)" />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Weak Chapters</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weakChapters.map(ch => (
              <div key={ch.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{ch.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ch.subject}</div>
                  </div>
                  <span className={`badge ${ch.mastery === 'Not Started' ? 'badge-red' : 'badge-amber'}`}>{ch.mastery}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${ch.theory}%`, background: ch.theory < 30 ? 'var(--red)' : 'var(--amber)' }} />
                </div>
              </div>
            ))}
          </div>
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
            {[0, 2, 4, 6, 8.5].map(v => (
              <div key={v} className="heatmap-cell" style={{ background: getHeatColor(v) }} />
            ))}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>More</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 12 }, (_, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Array.from({ length: 7 }, (_, d) => {
                const cell = heatmapData.find(c => c.week === w && c.day === d)!
                return (
                  <div key={d} className="heatmap-cell" title={`${cell.hours.toFixed(1)}h`}
                    style={{ background: getHeatColor(cell.hours) }} />
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
