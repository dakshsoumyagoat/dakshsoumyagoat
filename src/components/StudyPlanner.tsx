import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Task } from '../store/useStore'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Brain, AlertTriangle, RefreshCw } from 'lucide-react'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const aiSuggestions = [
  { type: 'reschedule', text: 'Missed yesterday\'s Optics session. Auto-rescheduled to Thursday 7 PM.' },
  { type: 'burnout', text: 'Burnout risk detected: 9+ hour sessions this week. Tomorrow\'s plan lightened.' },
  { type: 'suggest', text: 'Organic Chemistry revision due — 21 days since last session. Added to Friday.' },
  { type: 'optimize', text: 'Your focus peaks at 7 PM. High-difficulty tasks moved to evening slots.' },
]

function TaskCard({ task }: { task: Task }) {
  const { toggleTask } = useStore()
  const colors: Record<string, string> = {
    Physics: 'var(--blue)', Chemistry: 'var(--amber)',
    Mathematics: 'var(--neon)', General: 'var(--purple)'
  }
  const typeColors: Record<string, string> = {
    Theory: 'var(--blue)', Practice: 'var(--neon)',
    Revision: 'var(--amber)', Mock: 'var(--purple)'
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 8, background: 'var(--bg-elevated)',
      opacity: task.completed ? 0.5 : 1, transition: 'all 0.2s',
      border: '1px solid var(--border)',
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
  const { tasks, addTask } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [activeDay, setActiveDay] = useState(6)
  const [newTask, setNewTask] = useState({ title: '', subject: 'Physics', type: 'Theory', duration: 60 })

  const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0])
  const completedToday = todayTasks.filter(t => t.completed).length

  const handleAdd = () => {
    if (!newTask.title.trim()) return
    addTask({
      id: `t-${Date.now()}`,
      title: newTask.title,
      subject: newTask.subject as any,
      type: newTask.type as any,
      date: new Date().toISOString().split('T')[0],
      duration: newTask.duration,
      completed: false,
    })
    setNewTask({ title: '', subject: 'Physics', type: 'Theory', duration: 60 })
    setShowAdd(false)
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>PLANNER</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Adaptive Study Planner</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div>
            {/* Day selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {WEEK_DAYS.map((day, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                const isToday = i === 6
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

            {/* Today progress */}
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
                  No tasks for this day. Add one below.
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
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <select value={newTask.subject} onChange={e => setNewTask({ ...newTask, subject: e.target.value })}>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                    <option>General</option>
                  </select>
                  <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}>
                    <option>Theory</option>
                    <option>Practice</option>
                    <option>Revision</option>
                    <option>Mock</option>
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

          {/* AI Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Brain size={14} color="var(--neon)" />
                <span style={{ fontWeight: 700, fontSize: 13 }}>AI Planner</span>
              </div>
              {aiSuggestions.map((s, i) => (
                <div key={i} style={{
                  marginBottom: 8, padding: '8px 10px', borderRadius: 8,
                  background: s.type === 'burnout' ? '#ff444408' : s.type === 'reschedule' ? '#3b82f608' : '#39ff1408',
                  borderLeft: `2px solid ${s.type === 'burnout' ? 'var(--red)' : s.type === 'reschedule' ? 'var(--blue)' : 'var(--neon)'}`,
                  fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5,
                }}>
                  {s.text}
                </div>
              ))}
              <button className="btn-ghost" style={{ width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 12 }}>
                <RefreshCw size={12} /> Regenerate Plan
              </button>
            </div>

            {/* Weekly load */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Weekly Load</div>
              {[
                { day: 'Mon', hours: 6.5, type: 'Heavy' },
                { day: 'Tue', hours: 4.2, type: 'Light' },
                { day: 'Wed', hours: 7.8, type: 'Heavy' },
                { day: 'Thu', hours: 5.5, type: 'Medium' },
                { day: 'Fri', hours: 8.2, type: 'Heavy' },
                { day: 'Sat', hours: 9.1, type: 'Peak' },
                { day: 'Sun', hours: 3.0, type: 'Rest' },
              ].map(d => (
                <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, fontSize: 11, color: 'var(--text-muted)' }}>{d.day}</div>
                  <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(d.hours / 10) * 100}%`, height: '100%', borderRadius: 3,
                      background: d.type === 'Rest' ? 'var(--text-muted)' : d.type === 'Peak' ? 'var(--neon)' : d.type === 'Heavy' ? 'var(--blue)' : 'var(--border-bright)',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{d.hours}h</div>
                </div>
              ))}
            </div>

            {/* Burnout meter */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={14} color="var(--amber)" />
                <span style={{ fontWeight: 700, fontSize: 13 }}>Burnout Risk</span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--amber)' }}>38%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Moderate risk</div>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div style={{ width: '38%', height: '100%', background: 'linear-gradient(90deg, var(--neon), var(--amber))', borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Take a lighter day tomorrow. Rest improves retention by 23%.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
