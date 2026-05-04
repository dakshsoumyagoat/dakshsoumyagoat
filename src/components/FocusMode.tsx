import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX } from 'lucide-react'

const MODES = [
  { label: 'Pomodoro', work: 25, break: 5, color: 'var(--neon)' },
  { label: 'Deep Work', work: 90, break: 20, color: 'var(--blue)' },
  { label: 'Quick Sprint', work: 15, break: 3, color: 'var(--amber)' },
]

const AMBIENT = ['Deep Focus', 'Rain', 'White Noise', 'Cafe', 'Forest']

const sessionHistory = [
  { time: '09:00 AM', duration: 25, subject: 'Mathematics', type: 'Pomodoro' },
  { time: '09:30 AM', duration: 90, subject: 'Physics', type: 'Deep Work' },
  { time: '11:10 AM', duration: 25, subject: 'Chemistry', type: 'Pomodoro' },
  { time: '11:40 AM', duration: 25, subject: 'Mathematics', type: 'Pomodoro' },
]

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function FocusMode() {
  const { addXP, streakDays } = useStore()
  const [mode, setMode] = useState(0)
  const [isWork, setIsWork] = useState(true)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(MODES[0].work * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(6)
  const [selectedAmbient, setSelectedAmbient] = useState<string | null>(null)
  const [totalToday, setTotalToday] = useState(4.5)
  const intervalRef = useRef<number | null>(null)

  const currentMode = MODES[mode]
  const totalSeconds = (isWork ? currentMode.work : currentMode.break) * 60
  const progress = 1 - seconds / totalSeconds

  useEffect(() => {
    setSeconds((isWork ? currentMode.work : currentMode.break) * 60)
    setRunning(false)
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (isWork) {
              setCompletedPomodoros(p => p + 1)
              setTotalToday(t => +(t + currentMode.work / 60).toFixed(1))
              addXP(currentMode.work * 2)
              setIsWork(false)
              setSeconds(currentMode.break * 60)
            } else {
              setIsWork(true)
              setSeconds(currentMode.work * 60)
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, isWork, mode])

  const handleReset = () => {
    setRunning(false)
    setIsWork(true)
    setSeconds(currentMode.work * 60)
  }

  // SVG circle
  const R = 90, C = 2 * Math.PI * R
  const dashOffset = C * (1 - progress)

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>FOCUS ENGINE</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Focus Mode</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Timer */}
          <div>
            {/* Mode selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {MODES.map((m, i) => (
                <button key={m.label} onClick={() => setMode(i)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    background: mode === i ? m.color : 'var(--bg-elevated)',
                    color: mode === i ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Phase indicator */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              <div style={{
                flex: 1, padding: '8px', textAlign: 'center', borderRadius: 8, cursor: 'pointer',
                background: isWork ? '#39ff1415' : 'var(--bg-elevated)',
                border: isWork ? '1px solid var(--neon)' : '1px solid var(--border)',
                color: isWork ? 'var(--neon)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              }} onClick={() => { setIsWork(true); setSeconds(currentMode.work * 60); setRunning(false) }}>
                <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
                Work · {currentMode.work}m
              </div>
              <div style={{
                flex: 1, padding: '8px', textAlign: 'center', borderRadius: 8, cursor: 'pointer',
                background: !isWork ? '#3b82f615' : 'var(--bg-elevated)',
                border: !isWork ? '1px solid var(--blue)' : '1px solid var(--border)',
                color: !isWork ? 'var(--blue)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              }} onClick={() => { setIsWork(false); setSeconds(currentMode.break * 60); setRunning(false) }}>
                <Coffee size={14} style={{ display: 'inline', marginRight: 6 }} />
                Break · {currentMode.break}m
              </div>
            </div>

            {/* Timer circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ position: 'relative', width: 220, height: 220 }}>
                <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth={4} />
                  <circle cx="110" cy="110" r={R} fill="none" stroke={currentMode.color} strokeWidth={4}
                    strokeDasharray={C} strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.5s',
                      filter: `drop-shadow(0 0 8px ${currentMode.color})`,
                    }} />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <div className="timer-display" style={{ color: currentMode.color }}>{formatTime(seconds)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {isWork ? 'FOCUS' : 'BREAK'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleReset} className="btn-ghost" style={{ width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={18} />
              </button>
              <button onClick={() => setRunning(!running)}
                style={{
                  width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: running ? 'transparent' : currentMode.color,
                  color: running ? currentMode.color : '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 900,
                  outline: running ? `2px solid ${currentMode.color}` : 'none',
                  boxShadow: running ? 'none' : `0 0 20px ${currentMode.color}66`,
                  transition: 'all 0.2s',
                }}>
                {running ? <Pause size={28} /> : <Play size={28} fill={running ? 'none' : '#000'} />}
              </button>
              <button className="btn-ghost" onClick={() => setSelectedAmbient(selectedAmbient ? null : 'Deep Focus')}
                style={{ width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: selectedAmbient ? currentMode.color : undefined, color: selectedAmbient ? currentMode.color : undefined }}>
                {selectedAmbient ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            {/* Pomodoro dots */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i < completedPomodoros % 8 ? currentMode.color : 'var(--border)',
                  boxShadow: i < completedPomodoros % 8 ? `0 0 6px ${currentMode.color}` : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stats */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Today's Focus</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Hours', value: totalToday + 'h', color: 'var(--neon)' },
                  { label: 'Sessions', value: completedPomodoros, color: 'var(--blue)' },
                  { label: 'Streak', value: streakDays + 'd', color: 'var(--amber)' },
                  { label: 'Focus %', value: '89%', color: 'var(--purple)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div className="section-title" style={{ marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambient */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Ambient Sounds</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {AMBIENT.map(a => (
                  <button key={a} onClick={() => setSelectedAmbient(a === selectedAmbient ? null : a)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: selectedAmbient === a ? '#39ff1415' : 'var(--bg-elevated)',
                      color: selectedAmbient === a ? 'var(--neon)' : 'var(--text-secondary)',
                      textAlign: 'left', fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: selectedAmbient === a ? 'var(--neon)' : 'var(--border)', flexShrink: 0 }} />
                    {a}
                    {selectedAmbient === a && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>PLAYING</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Session history */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Session History</div>
              {sessionHistory.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, marginBottom: 8, borderBottom: i < sessionHistory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{s.subject}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.time} · {s.type}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon)' }}>{s.duration}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
