import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX, Timer } from 'lucide-react'

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

// ── localStorage keys ────────────────────────────────────────────────────────
const LS_END_TIME   = 'jcc_focus_endTime'
const LS_MODE       = 'jcc_focus_mode'
const LS_IS_WORK    = 'jcc_focus_isWork'
const LS_RUNNING    = 'jcc_focus_running'

function saveSession(endTime: number, mode: number, isWork: boolean) {
  localStorage.setItem(LS_END_TIME, String(endTime))
  localStorage.setItem(LS_MODE,     String(mode))
  localStorage.setItem(LS_IS_WORK,  String(isWork))
  localStorage.setItem(LS_RUNNING,  'true')
}

function clearSession() {
  localStorage.removeItem(LS_END_TIME)
  localStorage.removeItem(LS_MODE)
  localStorage.removeItem(LS_IS_WORK)
  localStorage.removeItem(LS_RUNNING)
}

function loadSession(): { seconds: number; mode: number; isWork: boolean } | null {
  const endTime  = Number(localStorage.getItem(LS_END_TIME))
  const mode     = Number(localStorage.getItem(LS_MODE) ?? '0')
  const isWork   = localStorage.getItem(LS_IS_WORK) !== 'false'
  const wasRunning = localStorage.getItem(LS_RUNNING) === 'true'

  if (!wasRunning || !endTime) return null
  const remaining = Math.floor((endTime - Date.now()) / 1000)
  if (remaining <= 0) {
    clearSession()
    return null
  }
  return { seconds: remaining, mode, isWork }
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function FocusMode() {
  const { addXP, streakDays } = useStore()

  // ── Restore from localStorage on first mount ─────────────────────────────
  const restored = loadSession()

  const [mode, setMode]                     = useState(restored?.mode ?? 0)
  const [isWork, setIsWork]                 = useState(restored?.isWork ?? true)
  const [running, setRunning]               = useState(!!restored)
  const [seconds, setSeconds]               = useState(restored?.seconds ?? MODES[0].work * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(6)
  const [selectedAmbient, setSelectedAmbient]       = useState<string | null>(null)
  const [totalToday, setTotalToday]                 = useState(4.5)
  const [resumed, setResumed]               = useState(!!restored)

  const intervalRef  = useRef<number | null>(null)
  const endTimeRef   = useRef<number>(restored ? Date.now() + restored.seconds * 1000 : 0)
  const currentMode  = MODES[mode]
  const totalSeconds = (isWork ? currentMode.work : currentMode.break) * 60
  const progress     = 1 - seconds / totalSeconds

  // ── Tick: derive remaining time from wall clock ──────────────────────────
  const tick = useCallback(() => {
    const remaining = Math.floor((endTimeRef.current - Date.now()) / 1000)
    if (remaining <= 0) {
      clearInterval(intervalRef.current!)
      clearSession()
      setRunning(false)
      if (isWork) {
        setCompletedPomodoros(p => p + 1)
        setTotalToday(t => +(t + currentMode.work / 60).toFixed(1))
        addXP(currentMode.work * 2)
        setIsWork(false)
        const breakSecs = currentMode.break * 60
        setSeconds(breakSecs)
        endTimeRef.current = Date.now() + breakSecs * 1000
        // auto-start break and persist
        intervalRef.current = window.setInterval(tick, 500)
        setRunning(true)
        saveSession(endTimeRef.current, mode, false)
      } else {
        setIsWork(true)
        setSeconds(currentMode.work * 60)
      }
    } else {
      setSeconds(remaining)
    }
  }, [isWork, mode, currentMode, addXP])

  // ── Start / stop interval ────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(tick, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  // ── Page visibility: resync when tab is brought back into focus ──────────
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && running) {
        const remaining = Math.floor((endTimeRef.current - Date.now()) / 1000)
        if (remaining > 0) setSeconds(remaining)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  // ── Reset mode when mode selector changes ────────────────────────────────
  useEffect(() => {
    if (running) return
    setIsWork(true)
    setSeconds(MODES[mode].work * 60)
  }, [mode])

  const handleStart = () => {
    endTimeRef.current = Date.now() + seconds * 1000
    saveSession(endTimeRef.current, mode, isWork)
    setRunning(true)
    setResumed(false)
  }

  const handlePause = () => {
    clearSession()
    setRunning(false)
  }

  const handleReset = () => {
    clearSession()
    setRunning(false)
    setIsWork(true)
    setResumed(false)
    const secs = MODES[mode].work * 60
    setSeconds(secs)
    endTimeRef.current = 0
  }

  const toggleRunning = () => {
    if (running) { handlePause() } else { handleStart() }
  }

  // SVG circle
  const R = 90, C = 2 * Math.PI * R
  const dashOffset = C * (1 - progress)

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>FOCUS ENGINE</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Focus Mode</h1>
          </div>
          <img src="/logo2.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 8px #39ff1466)', opacity: 0.8, flexShrink: 0 }} />
        </div>

        {/* Resumed banner */}
        {resumed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 10, border: '1px solid var(--neon)', background: '#39ff1410',
              marginBottom: 16, fontSize: 12, color: 'var(--neon)', fontWeight: 600,
            }}
          >
            <Timer size={14} />
            Session restored — your timer kept running while you were away!
            <button
              onClick={() => setResumed(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >×</button>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Timer */}
          <div>
            {/* Mode selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {MODES.map((m, i) => (
                <button key={m.label} onClick={() => { if (!running) setMode(i) }}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: running ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: 13, opacity: running && mode !== i ? 0.4 : 1,
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
              }} onClick={() => { if (!running) { setIsWork(true); setSeconds(currentMode.work * 60) } }}>
                <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
                Work · {currentMode.work}m
              </div>
              <div style={{
                flex: 1, padding: '8px', textAlign: 'center', borderRadius: 8, cursor: 'pointer',
                background: !isWork ? '#3b82f615' : 'var(--bg-elevated)',
                border: !isWork ? '1px solid var(--blue)' : '1px solid var(--border)',
                color: !isWork ? 'var(--blue)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              }} onClick={() => { if (!running) { setIsWork(false); setSeconds(currentMode.break * 60) } }}>
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
                  {running && (
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--neon)', animation: 'pulse 1.2s infinite' }} />
                      PERSISTED
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleReset} className="btn-ghost"
                style={{ width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={18} />
              </button>
              <button onClick={toggleRunning}
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
              <button className="btn-ghost"
                onClick={() => setSelectedAmbient(selectedAmbient ? null : 'Deep Focus')}
                style={{
                  width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  borderColor: selectedAmbient ? currentMode.color : undefined,
                  color: selectedAmbient ? currentMode.color : undefined,
                }}>
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

            {/* Persistence note */}
            <div style={{
              marginTop: 20, padding: '8px 12px', borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
            }}>
              Timer saves to your browser — closes and reopens exactly where you left off.
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stats */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Today's Focus</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Hours',    value: totalToday + 'h', color: 'var(--neon)' },
                  { label: 'Sessions', value: completedPomodoros, color: 'var(--blue)' },
                  { label: 'Streak',   value: streakDays + 'd', color: 'var(--amber)' },
                  { label: 'Focus %',  value: '89%',            color: 'var(--purple)' },
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
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  paddingBottom: 8, marginBottom: 8,
                  borderBottom: i < sessionHistory.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
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
