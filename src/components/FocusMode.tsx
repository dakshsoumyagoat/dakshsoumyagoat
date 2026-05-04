import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX, Timer, Plus, Minus, Settings } from 'lucide-react'

const PRESETS = [
  { label: 'Pomodoro',     work: 25,  break: 5,  color: 'var(--neon)' },
  { label: 'Deep Work',    work: 90,  break: 20, color: 'var(--blue)' },
  { label: 'Quick Sprint', work: 15,  break: 3,  color: 'var(--amber)' },
  { label: 'Custom',       work: 45,  break: 10, color: 'var(--purple)' },
]

const AMBIENT = ['Deep Focus', 'Rain', 'White Noise', 'Cafe', 'Forest']

const sessionHistory = [
  { time: '09:00 AM', duration: 25, subject: 'Mathematics', type: 'Pomodoro' },
  { time: '09:30 AM', duration: 90, subject: 'Physics',     type: 'Deep Work' },
  { time: '11:10 AM', duration: 25, subject: 'Chemistry',   type: 'Pomodoro' },
  { time: '11:40 AM', duration: 25, subject: 'Mathematics', type: 'Pomodoro' },
]

// ── localStorage keys ─────────────────────────────────────────────────────────
const LS_END_TIME = 'jcc_focus_endTime'
const LS_MODE     = 'jcc_focus_mode'
const LS_IS_WORK  = 'jcc_focus_isWork'
const LS_RUNNING  = 'jcc_focus_running'
const LS_WORK_MIN = 'jcc_focus_workMin'
const LS_BRK_MIN  = 'jcc_focus_brkMin'

function saveSession(endTime: number, mode: number, isWork: boolean, workMin: number, brkMin: number) {
  localStorage.setItem(LS_END_TIME, String(endTime))
  localStorage.setItem(LS_MODE,     String(mode))
  localStorage.setItem(LS_IS_WORK,  String(isWork))
  localStorage.setItem(LS_RUNNING,  'true')
  localStorage.setItem(LS_WORK_MIN, String(workMin))
  localStorage.setItem(LS_BRK_MIN,  String(brkMin))
}

function clearSession() {
  ;[LS_END_TIME, LS_MODE, LS_IS_WORK, LS_RUNNING, LS_WORK_MIN, LS_BRK_MIN].forEach(k => localStorage.removeItem(k))
}

function loadSession() {
  const endTime    = Number(localStorage.getItem(LS_END_TIME))
  const mode       = Number(localStorage.getItem(LS_MODE) ?? '0')
  const isWork     = localStorage.getItem(LS_IS_WORK) !== 'false'
  const wasRunning = localStorage.getItem(LS_RUNNING) === 'true'
  const workMin    = Number(localStorage.getItem(LS_WORK_MIN) ?? PRESETS[mode].work)
  const brkMin     = Number(localStorage.getItem(LS_BRK_MIN)  ?? PRESETS[mode].break)

  if (!wasRunning || !endTime) return null
  const remaining = Math.floor((endTime - Date.now()) / 1000)
  if (remaining <= 0) { clearSession(); return null }
  return { seconds: remaining, mode, isWork, workMin, brkMin }
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Stepper: +/- button with number input ─────────────────────────────────────
function TimeStepper({
  label, value, onChange, min = 1, max = 180, disabled, color,
}: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; disabled: boolean; color: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(String(value))
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!editing) setDraft(String(value)) }, [value, editing])

  const commit = (raw: string) => {
    const n = Math.max(min, Math.min(max, parseInt(raw) || value))
    onChange(n)
    setDraft(String(n))
    setEditing(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 12px', borderRadius: 10,
      background: disabled ? 'var(--bg-elevated)' : `${color}12`,
      border: `1px solid ${disabled ? 'var(--border)' : color + '40'}`,
      transition: 'all 0.15s',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, minWidth: 36 }}>{label}</div>

      <button
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 22, height: 22, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'transparent' : 'var(--bg-elevated)',
          color: disabled ? 'var(--border)' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      ><Minus size={11} /></button>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          autoFocus
          onChange={e => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={e => { if (e.key === 'Enter') commit(draft); if (e.key === 'Escape') setEditing(false) }}
          style={{
            width: 38, textAlign: 'center', background: 'var(--bg)', border: `1px solid ${color}`,
            borderRadius: 6, color: color, fontWeight: 700, fontSize: 14, padding: '2px 4px',
          }}
        />
      ) : (
        <button
          disabled={disabled}
          onClick={() => !disabled && setEditing(true)}
          title={disabled ? 'Stop timer to edit' : 'Click to type a value'}
          style={{
            minWidth: 38, textAlign: 'center', background: 'none', border: 'none',
            color: disabled ? 'var(--text-muted)' : color,
            fontWeight: 800, fontSize: 16, cursor: disabled ? 'default' : 'text',
            padding: '0 2px',
          }}
        >
          {value}
        </button>
      )}

      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>min</span>

      <button
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 22, height: 22, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'transparent' : 'var(--bg-elevated)',
          color: disabled ? 'var(--border)' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      ><Plus size={11} /></button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FocusMode() {
  const { addXP, streakDays } = useStore()

  const restored = loadSession()

  const [mode, setMode]         = useState(restored?.mode ?? 0)
  const [isWork, setIsWork]     = useState(restored?.isWork ?? true)
  const [running, setRunning]   = useState(!!restored)
  const [resumed, setResumed]   = useState(!!restored)

  // ── Customisable durations (persist across browser close) ─────────────────
  const [workMin, setWorkMinRaw] = useState(restored?.workMin ?? PRESETS[0].work)
  const [brkMin,  setBrkMinRaw]  = useState(restored?.brkMin  ?? PRESETS[0].break)

  const [seconds, setSeconds]   = useState(restored?.seconds ?? workMin * 60)

  const [completedPomodoros, setCompletedPomodoros] = useState(6)
  const [selectedAmbient,    setSelectedAmbient]    = useState<string | null>(null)
  const [totalToday,         setTotalToday]         = useState(4.5)

  const intervalRef  = useRef<number | null>(null)
  const endTimeRef   = useRef<number>(restored ? Date.now() + (restored.seconds * 1000) : 0)

  const currentPreset = PRESETS[mode]
  const totalSeconds  = (isWork ? workMin : brkMin) * 60
  const progress      = totalSeconds > 0 ? 1 - seconds / totalSeconds : 0

  // ── When mode button changes, snap to that preset's defaults (if stopped) ─
  const switchMode = (i: number) => {
    if (running) return
    setMode(i)
    const p = PRESETS[i]
    setWorkMinRaw(p.work)
    setBrkMinRaw(p.break)
    setIsWork(true)
    setSeconds(p.work * 60)
    endTimeRef.current = 0
  }

  // ── Setters that also reset the timer display ─────────────────────────────
  const setWorkMin = (v: number) => {
    setWorkMinRaw(v)
    if (isWork) setSeconds(v * 60)
    // Switch to Custom preset automatically when user edits a non-custom mode
    if (mode < 3) setMode(3)
  }
  const setBrkMin = (v: number) => {
    setBrkMinRaw(v)
    if (!isWork) setSeconds(v * 60)
    if (mode < 3) setMode(3)
  }

  // ── Tick ─────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const remaining = Math.floor((endTimeRef.current - Date.now()) / 1000)
    if (remaining <= 0) {
      clearInterval(intervalRef.current!)
      clearSession()
      setRunning(false)
      if (isWork) {
        setCompletedPomodoros(p => p + 1)
        setTotalToday(t => +(t + workMin / 60).toFixed(1))
        addXP(workMin * 2)
        setIsWork(false)
        const brkSecs = brkMin * 60
        setSeconds(brkSecs)
        endTimeRef.current = Date.now() + brkSecs * 1000
        intervalRef.current = window.setInterval(tick, 500)
        setRunning(true)
        saveSession(endTimeRef.current, mode, false, workMin, brkMin)
      } else {
        setIsWork(true)
        setSeconds(workMin * 60)
      }
    } else {
      setSeconds(remaining)
    }
  }, [isWork, mode, workMin, brkMin, addXP])

  useEffect(() => {
    if (running) { intervalRef.current = window.setInterval(tick, 500) }
    else { if (intervalRef.current) clearInterval(intervalRef.current) }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

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

  const handleStart = () => {
    endTimeRef.current = Date.now() + seconds * 1000
    saveSession(endTimeRef.current, mode, isWork, workMin, brkMin)
    setRunning(true)
    setResumed(false)
  }
  const handlePause = () => { clearSession(); setRunning(false) }
  const handleReset = () => {
    clearSession(); setRunning(false); setIsWork(true); setResumed(false)
    setSeconds(workMin * 60); endTimeRef.current = 0
  }
  const toggleRunning = () => running ? handlePause() : handleStart()

  const R = 90, C = 2 * Math.PI * R
  const dashOffset = C * (1 - progress)

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>FOCUS ENGINE</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Focus Mode</h1>
          </div>
          <img src="./logo2.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 8px #39ff1466)', opacity: 0.8, flexShrink: 0 }} />
        </div>

        {/* Resumed banner */}
        <AnimatePresence>
          {resumed && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 10, border: '1px solid var(--neon)', background: '#39ff1410',
                marginBottom: 16, fontSize: 12, color: 'var(--neon)', fontWeight: 600,
              }}>
              <Timer size={14} />
              Session restored — your timer kept running while you were away!
              <button onClick={() => setResumed(false)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* ── Left: Timer ── */}
          <div>
            {/* Preset selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {PRESETS.map((p, i) => (
                <button key={p.label} onClick={() => switchMode(i)}
                  disabled={running}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    cursor: running ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: 13,
                    opacity: running && mode !== i ? 0.35 : 1,
                    background: mode === i ? p.color : 'var(--bg-elevated)',
                    color: mode === i ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                  {i === 3 && <Settings size={12} />}
                  {p.label}
                </button>
              ))}
            </div>

            {/* ── Customizable time controls ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <TimeStepper
                  label="Work"
                  value={workMin}
                  onChange={setWorkMin}
                  min={1} max={180}
                  disabled={running}
                  color={currentPreset.color}
                />
              </div>
              <div style={{ flex: 1 }}>
                <TimeStepper
                  label="Break"
                  value={brkMin}
                  onChange={setBrkMin}
                  min={1} max={60}
                  disabled={running}
                  color="var(--blue)"
                />
              </div>
            </div>

            {!running && (
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: -16, marginBottom: 20 }}>
                Click the number to type, or use +/− to adjust · Changes are saved automatically
              </div>
            )}

            {/* Phase pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              <div style={{
                flex: 1, padding: '8px', textAlign: 'center', borderRadius: 8, cursor: 'pointer',
                background: isWork ? '#39ff1415' : 'var(--bg-elevated)',
                border: isWork ? '1px solid var(--neon)' : '1px solid var(--border)',
                color: isWork ? 'var(--neon)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              }} onClick={() => { if (!running) { setIsWork(true); setSeconds(workMin * 60) } }}>
                <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
                Work · {workMin}m
              </div>
              <div style={{
                flex: 1, padding: '8px', textAlign: 'center', borderRadius: 8, cursor: 'pointer',
                background: !isWork ? '#3b82f615' : 'var(--bg-elevated)',
                border: !isWork ? '1px solid var(--blue)' : '1px solid var(--border)',
                color: !isWork ? 'var(--blue)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              }} onClick={() => { if (!running) { setIsWork(false); setSeconds(brkMin * 60) } }}>
                <Coffee size={14} style={{ display: 'inline', marginRight: 6 }} />
                Break · {brkMin}m
              </div>
            </div>

            {/* Timer circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <div style={{ position: 'relative', width: 220, height: 220 }}>
                <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth={4} />
                  <circle cx="110" cy="110" r={R} fill="none" stroke={currentPreset.color} strokeWidth={4}
                    strokeDasharray={C} strokeDashoffset={dashOffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s', filter: `drop-shadow(0 0 8px ${currentPreset.color})` }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="timer-display" style={{ color: currentPreset.color }}>{formatTime(seconds)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {isWork ? 'FOCUS' : 'BREAK'}
                  </div>
                  {running && (
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--neon)', animation: 'pulse 1.2s infinite' }} />
                      SAVED
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
                  background: running ? 'transparent' : currentPreset.color,
                  color: running ? currentPreset.color : '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900,
                  outline: running ? `2px solid ${currentPreset.color}` : 'none',
                  boxShadow: running ? 'none' : `0 0 20px ${currentPreset.color}66`,
                  transition: 'all 0.2s',
                }}>
                {running ? <Pause size={28} /> : <Play size={28} fill={running ? 'none' : '#000'} />}
              </button>
              <button className="btn-ghost"
                onClick={() => setSelectedAmbient(selectedAmbient ? null : 'Deep Focus')}
                style={{
                  width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderColor: selectedAmbient ? currentPreset.color : undefined,
                  color:       selectedAmbient ? currentPreset.color : undefined,
                }}>
                {selectedAmbient ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            {/* Pomodoro dots */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i < completedPomodoros % 8 ? currentPreset.color : 'var(--border)',
                  boxShadow: i < completedPomodoros % 8 ? `0 0 6px ${currentPreset.color}` : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stats */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Today's Focus</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Hours',    value: totalToday + 'h',       color: 'var(--neon)' },
                  { label: 'Sessions', value: completedPomodoros,     color: 'var(--blue)' },
                  { label: 'Streak',   value: streakDays + 'd',       color: 'var(--amber)' },
                  { label: 'Focus %',  value: '89%',                  color: 'var(--purple)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div className="section-title" style={{ marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambient sounds */}
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
