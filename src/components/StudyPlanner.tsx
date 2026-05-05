import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Task } from '../store/useStore'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Brain, AlertTriangle } from 'lucide-react'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function TaskCard({ task }: { task: Task }) {
  const { toggleTask } = useStore()
  const colors: Record<string, string> = {
    Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)', General: 'var(--purple)',
  }
  const typeColors: Record<string, string> = {
    Theory: 'var(--blue)', Practice: 'var(--neon)', Revision: 'var(--amber)', Mock: 'var(--purple)',
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 8, background: 'var(--bg-elevated)', opacity: task.completed ? 0.5 : 1,
      transition: 'all 0.2s', border: '1px solid var(--border)',
    }}>
      <button onClick={() => toggleTask(task.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.completed ? 'var(--neon)' : 'var(--text-muted)', padding: 0 }}>
        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          <span style={{ color: colors[task.subject] }}>{task.subject}</span>
          {' · '}<span style={{ color: typeColors[task.type] }}>{task.type}</span>
          {' · '}{task.duration}m
        </div>
      </div>
      <span style={{
        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
        background: typeColors[task.type] + '15', color: typeColors[task.type],
        border: `1px solid ${typeColors[task.type]}30`,
      }}>{task.type}</span>
    </div>
  )
}

export default function StudyPlanner() {
  const { tasks, addTask, chapters } = useStore()
  const [showAdd, setShowAdd]   = useState(false)
  const [activeDay, setActiveDay] = useState(6)
  const [newTask, setNewTask]   = useState({ title: '', subject: 'Physics', type: 'Theory', duration: 60 })

  const today      = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.date === today)
  const completedToday = todayTasks.filter(t => t.completed).length

  const handleAdd = () => {
    if (!newTask.title.trim()) return
    addTask({
      id: `t-${Date.now()}`,
      title: newTask.title,
      subject: newTask.subject as any,
      type: newTask.type as any,
      date: today,
      duration: newTask.duration,
      completed: false,
    })
    setNewTask({ title: '', subject: 'Physics', type: 'Theory', duration: 60 })
    setShowAdd(false)
  }

  // ── Weekly load from real tasks ───────────────────────────────────────────
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))

  const weeklyLoad = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayTasks = tasks.filter(t => t.date === dateStr)
    const hours = dayTasks.reduce((a, t) => a + t.duration / 60, 0)
    const type = hours === 0 ? 'None' : hours < 3 ? 'Light' : hours < 5 ? 'Medium' : hours < 7 ? 'Heavy' : 'Peak'
    return { day: WEEK_DAYS[i], hours: +hours.toFixed(1), type }
  })

  const totalWeekHours = weeklyLoad.reduce((a, d) => a + d.hours, 0)
  const typeColors: Record<string, string> = {
    None: 'var(--border)', Light: 'var(--neon)', Medium: 'var(--blue)', Heavy: 'var(--amber)', Peak: 'var(--red)',
  }

  // ── Burnout risk ─────────────────────────────────────────────────────────
  const maxH = Math.max(...weeklyLoad.map(d => d.hours), 1)
  const burnoutRisk = Math.min(100, Math.round((totalWeekHours / (7 * 6)) * 100))
  const burnoutLabel = burnoutRisk < 30 ? 'Low' : burnoutRisk < 60 ? 'Moderate' : 'High'
  const burnoutColor = burnoutRisk < 30 ? 'var(--neon)' : burnoutRisk < 60 ? 'var(--amber)' : 'var(--red)'

  // ── Smart insights from real data ────────────────────────────────────────
  const weakCount   = chapters.filter(c => c.mastery === 'Weak').length
  const dueRevisions = chapters.filter(c => c.nextRevision && new Date(c.nextRevision).getTime() <= Date.now()).length
  const pendingToday = todayTasks.filter(t => !t.completed).length
  const notStarted  = chapters.filter(c => c.mastery === 'Not Started').length

  const insights: { type: string; text: string }[] = []
  if (pendingToday > 0)
    insights.push({ type: 'reschedule', text: `${pendingToday} task${pendingToday > 1 ? 's' : ''} still pending today. Complete them before the day ends.` })
  if (dueRevisions > 0)
    insights.push({ type: 'suggest', text: `${dueRevisions} revision${dueRevisions > 1 ? 's' : ''} are overdue. Open the Revision System to get back on track.` })
  if (weakCount > 0)
    insights.push({ type: 'burnout', text: `${weakCount} chapter${weakCount > 1 ? 's' : ''} marked Weak. Schedule targeted practice sessions for them.` })
  if (burnoutRisk >= 60)
    insights.push({ type: 'burnout', text: `Burnout risk is High (${totalWeekHours.toFixed(1)}h this week). Plan a lighter day — rest improves retention.` })


  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>PLANNER</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Adaptive Study Planner</h1>
          </div>
          <img src="./logo2.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 8px #39ff1466)', opacity: 0.8, flexShrink: 0 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          {/* Left: Task list */}
          <div>
            {/* Day selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {WEEK_DAYS.map((day, i) => {
                const d = new Date(startOfWeek)
                d.setDate(startOfWeek.getDate() + i)
                const isToday = i === (now.getDay() + 6) % 7
                return (
                  <button key={day} onClick={() => setActiveDay(i)}
                    style={{
                      flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: activeDay === i ? (isToday ? 'var(--neon)' : 'var(--bg-elevated)') : 'var(--bg-card)',
                      color: activeDay === i ? (isToday ? '#000' : 'var(--text-primary)') : 'var(--text-muted)',
                      fontWeight: activeDay === i ? 700 : 500, fontSize: 11, transition: 'all 0.15s',
                      outline: activeDay === i && !isToday ? '1px solid var(--border-bright)' : 'none',
                    }}>
                    <div>{day}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{d.getDate()}</div>
                  </button>
                )
              })}
            </div>

            {/* Day Progress */}
            <div className="card-elevated" style={{ padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Day Progress</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon)' }}>{completedToday}/{todayTasks.length} tasks</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: `${todayTasks.length ? (completedToday / todayTasks.length) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {todayTasks.map(task => <TaskCard key={task.id} task={task} />)}
              {todayTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>
                  No tasks for today. Add one below.
                </div>
              )}
            </div>

            <button className="btn-ghost" onClick={() => setShowAdd(!showAdd)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Plus size={14} /> Add Task
            </button>

            {showAdd && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="card-elevated" style={{ padding: 16, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Task title..." value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })
                  } onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <select value={newTask.subject} onChange={e => setNewTask({ ...newTask, subject: e.target.value })}>
                    <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>General</option>
                  </select>
                  <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}>
                    <option>Theory</option><option>Practice</option><option>Revision</option><option>Mock</option>
                  </select>
                  <input type="number" placeholder="Minutes" value={newTask.duration}
                    onChange={e => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 60 })} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={handleAdd} style={{ flex: 1 }}>Add Task</button>
                  <button className="btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Smart Planner insights */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Brain size={14} color="var(--neon)" />
                <span style={{ fontWeight: 700, fontSize: 13 }}>Smart Planner</span>
              </div>
              {insights.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  Add tasks and mark chapter progress to see insights.
                </div>
              ) : (
                insights.slice(0, 4).map((s, i) => (
                  <div key={i} style={{
                    marginBottom: 8, padding: '8px 10px', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5,
                    background: s.type === 'burnout' ? '#ff444408' : s.type === 'reschedule' ? '#3b82f608' : '#39ff1408',
                    borderLeft: `2px solid ${s.type === 'burnout' ? 'var(--red)' : s.type === 'reschedule' ? 'var(--blue)' : 'var(--neon)'}`,
                  }}>
                    {s.text}
                  </div>
                ))
              )}
            </div>

            {/* Weekly load — from real tasks */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Weekly Load</div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{totalWeekHours.toFixed(1)}h total</span>
              </div>
              {weeklyLoad.every(d => d.hours === 0) ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                  No tasks scheduled this week.
                </div>
              ) : (
                weeklyLoad.map(d => (
                  <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, fontSize: 11, color: 'var(--text-muted)' }}>{d.day}</div>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(d.hours / maxH) * 100}%`, height: '100%', borderRadius: 3,
                        background: typeColors[d.type],
                        transition: 'width 0.4s',
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 32, textAlign: 'right' }}>{d.hours}h</div>
                  </div>
                ))
              )}
            </div>

            {/* Burnout risk — from real data */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={14} color={burnoutColor} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>Burnout Risk</span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: burnoutColor }}>{burnoutRisk}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{burnoutLabel} risk</div>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div style={{
                  width: `${burnoutRisk}%`, height: '100%', borderRadius: 999,
                  background: `linear-gradient(90deg, var(--neon), ${burnoutColor})`,
                  transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                {burnoutRisk < 30
                  ? 'Good pace — consistency is key.'
                  : burnoutRisk < 60
                    ? 'Moderate load. Balance study with rest.'
                    : 'High load detected. Plan a lighter day tomorrow.'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
