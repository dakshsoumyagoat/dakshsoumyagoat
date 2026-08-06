import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import type { Subject } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Timer, Plus, Minus, Settings, Music2, Upload, SkipBack, SkipForward, Trash2, ChevronUp, ChevronDown, X, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const PRESETS = [
  { label: 'Pomodoro',     work: 25,  break: 5,  color: 'var(--neon)' },
  { label: 'Deep Work',    work: 90,  break: 20, color: 'var(--blue)' },
  { label: 'Quick Sprint', work: 15,  break: 3,  color: 'var(--amber)' },
  { label: 'Custom',       work: 45,  break: 10, color: 'var(--purple)' },
]

const SUBJECTS: { label: string; value: Subject | 'General'; color: string }[] = [
  { label: 'Physics',  value: 'Physics',     color: 'var(--blue)' },
  { label: 'Chem',     value: 'Chemistry',   color: 'var(--amber)' },
  { label: 'Maths',    value: 'Mathematics', color: 'var(--neon)' },
  { label: 'General',  value: 'General',     color: 'var(--purple)' },
]

// ── localStorage keys ─────────────────────────────────────────────────────────
const LS_END_TIME = 'jcc_focus_endTime'
const LS_MODE     = 'jcc_focus_mode'
const LS_IS_WORK  = 'jcc_focus_isWork'
const LS_RUNNING  = 'jcc_focus_running'
const LS_WORK_MIN = 'jcc_focus_workMin'
const LS_BRK_MIN  = 'jcc_focus_brkMin'
const LS_SUBJECT  = 'jcc_focus_subject'

function saveSession(endTime: number, mode: number, isWork: boolean, workMin: number, brkMin: number, subject: string) {
  localStorage.setItem(LS_END_TIME, String(endTime))
  localStorage.setItem(LS_MODE,     String(mode))
  localStorage.setItem(LS_IS_WORK,  String(isWork))
  localStorage.setItem(LS_RUNNING,  'true')
  localStorage.setItem(LS_WORK_MIN, String(workMin))
  localStorage.setItem(LS_BRK_MIN,  String(brkMin))
  localStorage.setItem(LS_SUBJECT,  subject)
}

function clearSession() {
  ;[LS_END_TIME, LS_MODE, LS_IS_WORK, LS_RUNNING, LS_WORK_MIN, LS_BRK_MIN, LS_SUBJECT].forEach(k => localStorage.removeItem(k))
}

function loadSession() {
  const endTime    = Number(localStorage.getItem(LS_END_TIME))
  const mode       = Number(localStorage.getItem(LS_MODE) ?? '0')
  const isWork     = localStorage.getItem(LS_IS_WORK) !== 'false'
  const wasRunning = localStorage.getItem(LS_RUNNING) === 'true'
  const workMin    = Number(localStorage.getItem(LS_WORK_MIN) ?? PRESETS[0].work)
  const brkMin     = Number(localStorage.getItem(LS_BRK_MIN)  ?? PRESETS[0].break)
  const subject    = localStorage.getItem(LS_SUBJECT) ?? 'General'

  if (!wasRunning || !endTime) return null
  const remaining = Math.floor((endTime - Date.now()) / 1000)
  if (remaining <= 0) { clearSession(); return null }
  return { seconds: remaining, mode, isWork, workMin, brkMin, subject }
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface AudioTrack {
  id: string
  name: string
  url: string
  duration?: number
}

function formatAudioTime(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function TimeStepper({
  label, value, onChange, min = 1, max = 180, disabled, color,
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; disabled: boolean; color: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(String(value))
  useEffect(() => { if (!editing) setDraft(String(value)) }, [value, editing])

  const commit = (raw: string) => {
    const n = Math.max(min, Math.min(max, parseInt(raw) || value))
    onChange(n); setDraft(String(n)); setEditing(false)
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
      background: disabled ? 'var(--bg-elevated)' : `${color}12`,
      border: `1px solid ${disabled ? 'var(--border)' : color + '40'}`,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, minWidth: 36 }}>{label}</div>
      <button disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 22, height: 22, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'transparent' : 'var(--bg-elevated)', color: disabled ? 'var(--border)' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Minus size={11} />
      </button>
      {editing ? (
        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
          onBlur={() => commit(draft)} onKeyDown={e => { if (e.key === 'Enter') commit(draft); if (e.key === 'Escape') setEditing(false) }}
          style={{ width: 38, textAlign: 'center', background: 'var(--bg)', border: `1px solid ${color}`, borderRadius: 6, color, fontWeight: 700, fontSize: 14, padding: '2px 4px' }} />
      ) : (
        <button disabled={disabled} onClick={() => !disabled && setEditing(true)} title={disabled ? 'Stop timer to edit' : 'Click to type'}
          style={{ minWidth: 38, textAlign: 'center', background: 'none', border: 'none', color: disabled ? 'var(--text-muted)' : color,
            fontWeight: 800, fontSize: 16, cursor: disabled ? 'default' : 'text', padding: '0 2px' }}>
          {value}
        </button>
      )}
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>min</span>
      <button disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 22, height: 22, borderRadius: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'transparent' : 'var(--bg-elevated)', color: disabled ? 'var(--border)' : 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={11} />
      </button>
    </div>
  )
}

export default function FocusMode({ onExit }: { onExit: () => void }) {
  const { addXP, addFocusSession, focusSessions } = useStore()

  const restored = loadSession()

  const [mode,    setMode]    = useState(restored?.mode    ?? 0)
  const [isWork,  setIsWork]  = useState(restored?.isWork  ?? true)
  const [running, setRunning] = useState(!!restored)
  const [resumed, setResumed] = useState(!!restored)
  const [subject, setSubject] = useState<Subject | 'General'>((restored?.subject as any) ?? 'General')

  const [workMin, setWorkMinRaw] = useState(restored?.workMin ?? PRESETS[0].work)
  const [brkMin,  setBrkMinRaw]  = useState(restored?.brkMin  ?? PRESETS[0].break)
  const [seconds, setSeconds]    = useState(restored?.seconds ?? PRESETS[0].work * 60)

  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [queue, setQueue] = useState<AudioTrack[]>([])
  const [activeTrack, setActiveTrack] = useState(0)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [queueOpen, setQueueOpen] = useState(true)

  const intervalRef = useRef<number | null>(null)
  const endTimeRef  = useRef<number>(restored ? Date.now() + restored.seconds * 1000 : 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef<string[]>([])
  const audioIntentRef = useRef(false)

  const currentPreset = PRESETS[mode]
  const totalSeconds  = (isWork ? workMin : brkMin) * 60
  const progress      = totalSeconds > 0 ? 1 - seconds / totalSeconds : 0

  // ── Today's stats from store ──────────────────────────────────────────────
  const today    = new Date().toISOString().split('T')[0]
  const todaySessions = focusSessions.filter(s => s.date === today)
  const totalToday    = todaySessions.reduce((a, s) => a + s.duration / 60, 0)
  const sessionCount  = todaySessions.length

  const currentTrack = queue[activeTrack]

  const addAudioFiles = (files: FileList | File[]) => {
    const mp3Files = Array.from(files).filter(file =>
      file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3'),
    )
    const tracks = mp3Files.map((file, index) => {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.push(url)
      return { id: `${file.name}-${file.lastModified}-${index}`, name: file.name, url }
    })
    if (tracks.length) {
      setQueue(previous => [...previous, ...tracks])
      if (!queue.length) setActiveTrack(0)
    }
  }

  const playAudio = () => {
    if (!audioRef.current || !currentTrack) return
    audioIntentRef.current = true
    void audioRef.current.play().catch(() => setAudioPlaying(false))
  }

  const pauseAudio = () => {
    audioIntentRef.current = false
    audioRef.current?.pause()
  }

  const selectTrack = (index: number, shouldPlay = false) => {
    if (!queue.length) return
    audioIntentRef.current = shouldPlay
    setActiveTrack((index + queue.length) % queue.length)
  }

  const removeTrack = (id: string) => {
    const removedIndex = queue.findIndex(track => track.id === id)
    const removed = queue[removedIndex]
    if (removed) URL.revokeObjectURL(removed.url)
    const nextQueue = queue.filter(track => track.id !== id)
    if (!nextQueue.length) {
      audioIntentRef.current = false
      audioRef.current?.pause()
      if (audioRef.current) audioRef.current.src = ''
      setAudioPlaying(false)
      setActiveTrack(0)
    } else if (removedIndex < activeTrack) {
      setActiveTrack(activeTrack - 1)
    } else if (removedIndex === activeTrack) {
      setActiveTrack(Math.min(activeTrack, nextQueue.length - 1))
    }
    setQueue(nextQueue)
  }

  const moveTrack = (index: number, direction: -1 | 1) => {
    const destination = index + direction
    if (destination < 0 || destination >= queue.length) return
    const nextQueue = [...queue]
    const [track] = nextQueue.splice(index, 1)
    nextQueue.splice(destination, 0, track)
    setQueue(nextQueue)
    if (activeTrack === index) setActiveTrack(destination)
    else if (activeTrack === destination) setActiveTrack(index)
  }

  const clearQueue = () => {
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    objectUrlsRef.current = []
    audioIntentRef.current = false
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.src = ''
    setQueue([])
    setActiveTrack(0)
    setAudioPlaying(false)
  }

  useEffect(() => {
    const audio = audioRef.current
    const track = queue[activeTrack]
    if (!audio || !track) return
    audio.src = track.url
    audio.load()
    if (audioIntentRef.current) void audio.play().catch(() => setAudioPlaying(false))
  }, [activeTrack, currentTrack?.url])

  useEffect(() => () => {
    audioRef.current?.pause()
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
  }, [])

  // ── Switch preset ─────────────────────────────────────────────────────────
  const switchMode = (i: number) => {
    if (running) return
    setMode(i); const p = PRESETS[i]
    setWorkMinRaw(p.work); setBrkMinRaw(p.break)
    setIsWork(true); setSeconds(p.work * 60); endTimeRef.current = 0
  }

  const setWorkMin = (v: number) => {
    setWorkMinRaw(v); if (isWork) setSeconds(v * 60); if (mode < 3) setMode(3)
  }
  const setBrkMin = (v: number) => {
    setBrkMinRaw(v); if (!isWork) setSeconds(v * 60); if (mode < 3) setMode(3)
  }

  // ── Tick ─────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const remaining = Math.floor((endTimeRef.current - Date.now()) / 1000)
    if (remaining <= 0) {
      clearInterval(intervalRef.current!); clearSession(); setRunning(false)
      if (isWork) {
        addFocusSession({ id: `fs-${Date.now()}`, date: today, subject, duration: workMin, mode: PRESETS[mode].label })
        addXP(workMin * 2)
        setCompletedPomodoros(p => p + 1)
        toast.success(`${workMin}m ${PRESETS[mode].label} session complete! Break time.`, { duration: 3000 })
        setIsWork(false)
        const brkSecs = brkMin * 60
        setSeconds(brkSecs); endTimeRef.current = Date.now() + brkSecs * 1000
        intervalRef.current = window.setInterval(tick, 500); setRunning(true)
        saveSession(endTimeRef.current, mode, false, workMin, brkMin, subject)
      } else {
        toast('Break over — ready for the next session!', { icon: '⚡', duration: 2500 })
        setIsWork(true); setSeconds(workMin * 60)
      }
    } else { setSeconds(remaining) }
  }, [isWork, mode, workMin, brkMin, subject, today, addXP, addFocusSession])

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
    saveSession(endTimeRef.current, mode, isWork, workMin, brkMin, subject)
    setRunning(true); setResumed(false)
  }
  const handlePause = () => { clearSession(); setRunning(false) }
  const handleReset = () => {
    clearSession(); setRunning(false); setIsWork(true); setResumed(false)
    setSeconds(workMin * 60); endTimeRef.current = 0
  }

  const R = 120, C = 2 * Math.PI * R
  const dashOffset = C * (1 - progress)

  return (
    <div className="focus-workspace">
      <audio
        ref={audioRef}
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onEnded={() => {
          if (queue.length > 1) selectTrack(activeTrack + 1, true)
          else if (audioRef.current) {
            audioRef.current.currentTime = 0
            void audioRef.current.play().catch(() => setAudioPlaying(false))
          }
        }}
        onLoadedMetadata={event => {
          const duration = event.currentTarget.duration
          if (currentTrack) setQueue(previous => previous.map(track => track.id === currentTrack.id ? { ...track, duration } : track))
        }}
      />
      <header className="focus-topbar">
        <div className="focus-identity">
          <div className="focus-mark">JEE</div>
          <div>
            <div className="focus-kicker">FOCUS ENGINE</div>
            <div className="focus-title">Quiet cockpit</div>
          </div>
        </div>
        <div className="focus-context">
          <span className="focus-status-dot" />
          {subject} <span>·</span> {isWork ? 'Focus session' : 'Break'}
          {running && <span className="focus-saved">Saved locally</span>}
        </div>
        <button className="focus-exit" onClick={onExit} aria-label="Exit focus mode">
          <LogOut size={15} /> Exit focus
        </button>
      </header>

      <main className="focus-main">
        <motion.section className="focus-stage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="focus-stage-heading">
            <div>
              <div className="section-title">CURRENT SESSION</div>
              <div className="focus-stage-label">{isWork ? 'Deep work, one minute at a time.' : 'Recharge before the next round.'}</div>
            </div>
            <div className="focus-pomodoro-count">
              {String(completedPomodoros).padStart(2, '0')} <span>completed</span>
            </div>
          </div>

          <AnimatePresence>
            {resumed && (
              <motion.div className="focus-resumed" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Timer size={14} /> Session restored — your timer kept running while you were away.
                <button onClick={() => setResumed(false)} aria-label="Dismiss session restored message"><X size={14} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="focus-timer-wrap" role="timer" aria-label={`${isWork ? 'Focus' : 'Break'} timer, ${formatTime(seconds)} remaining`}>
            <div className={`focus-orbit ${running ? 'is-running' : ''}`} style={{ '--phase-color': currentPreset.color } as React.CSSProperties}>
              <svg className="focus-ring" viewBox="0 0 300 300" aria-hidden="true">
                <circle cx="150" cy="150" r={R} fill="none" stroke="var(--border)" strokeWidth={5} />
                <circle cx="150" cy="150" r={R} fill="none" stroke={currentPreset.color} strokeWidth={5}
                  strokeDasharray={C} strokeDashoffset={dashOffset} strokeLinecap="round" />
              </svg>
              <div className="focus-timer-content">
                <div className="timer-display" style={{ color: currentPreset.color }}>{formatTime(seconds)}</div>
                <div className="focus-phase">{isWork ? 'FOCUS' : 'BREAK'}</div>
                <div className="focus-subject" style={{ color: SUBJECTS.find(s => s.value === subject)?.color }}>{subject}</div>
                <div className={`focus-save-state ${running ? 'visible' : ''}`}><span /> {running ? 'SAVED LOCALLY' : 'READY WHEN YOU ARE'}</div>
              </div>
            </div>
          </div>

          <div className="focus-controls">
            <button className="focus-round-button" onClick={handleReset} aria-label="Reset timer"><RotateCcw size={18} /></button>
            <button className="focus-play-button" onClick={() => running ? handlePause() : handleStart()} aria-label={running ? 'Pause timer' : 'Start timer'} aria-pressed={running} style={{ '--phase-color': currentPreset.color } as React.CSSProperties}>
              {running ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
            </button>
            <div className="focus-round-spacer" />
          </div>

          <div className="focus-dots" aria-label={`${completedPomodoros} completed focus sessions`}>
            {Array.from({ length: 8 }, (_, i) => <span key={i} className={i < completedPomodoros % 8 ? 'complete' : ''} style={{ '--dot-color': currentPreset.color } as React.CSSProperties} />)}
          </div>

          <section className="focus-setup">
            <div className="focus-setup-header">
              <div><div className="section-title">SESSION SETUP</div><div className="focus-setup-hint">Choose a pace before you begin.</div></div>
              <Settings size={16} />
            </div>
            <div className="focus-preset-row">
              {PRESETS.map((preset, index) => (
                <button key={preset.label} className={`focus-preset ${mode === index ? 'selected' : ''}`} onClick={() => switchMode(index)} disabled={running} aria-pressed={mode === index} style={{ '--phase-color': preset.color } as React.CSSProperties}>
                  {index === 3 && <Settings size={12} />}{preset.label}
                </button>
              ))}
            </div>
            <div className="focus-subject-row">
              {SUBJECTS.map(item => (
                <button key={item.value} className={`focus-subject-option ${subject === item.value ? 'selected' : ''}`} onClick={() => !running && setSubject(item.value)} disabled={running} aria-pressed={subject === item.value} style={{ '--subject-color': item.color } as React.CSSProperties}>{item.label}</button>
              ))}
            </div>
            <div className="focus-stepper-row">
              <TimeStepper label="Work" value={workMin} onChange={setWorkMin} min={1} max={180} disabled={running} color={currentPreset.color} />
              <TimeStepper label="Break" value={brkMin} onChange={setBrkMin} min={1} max={60} disabled={running} color="var(--blue)" />
            </div>
          </section>
        </motion.section>

        <aside className={`focus-queue-panel ${queueOpen ? 'open' : ''}`}>
          <div className="focus-queue-header">
            <div className="focus-queue-heading"><div className="focus-queue-icon"><Music2 size={17} /></div><div><div className="focus-queue-title">Sound queue</div><div className="focus-queue-meta">{queue.length ? `${queue.length} MP3${queue.length === 1 ? '' : 's'} · loops continuously` : 'Optional study atmosphere'}</div></div></div>
            <button className="focus-mobile-close" onClick={() => setQueueOpen(false)} aria-label="Close sound queue"><X size={16} /></button>
          </div>
          <div className="focus-audio-now">
            <div className="focus-audio-now-icon"><Music2 size={18} /></div>
            <div className="focus-audio-now-copy"><div className="section-title">NOW PLAYING</div><strong>{currentTrack?.name ?? 'No track selected'}</strong><span>{currentTrack ? formatAudioTime(currentTrack.duration) : 'Drop MP3s below to begin'}</span></div>
            {currentTrack && <button className="focus-audio-toggle" onClick={audioPlaying ? pauseAudio : playAudio} aria-label={audioPlaying ? 'Pause audio' : 'Play audio'} aria-pressed={audioPlaying}>{audioPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}</button>}
          </div>
          <div className="focus-audio-controls">
            <button onClick={() => selectTrack(activeTrack - 1, audioPlaying)} disabled={!queue.length} aria-label="Previous track"><SkipBack size={15} /></button>
            <button onClick={audioPlaying ? pauseAudio : playAudio} disabled={!queue.length} className="focus-audio-main-toggle" aria-label={audioPlaying ? 'Pause queue' : 'Play queue'}>{audioPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}</button>
            <button onClick={() => selectTrack(activeTrack + 1, audioPlaying)} disabled={!queue.length} aria-label="Next track"><SkipForward size={15} /></button>
          </div>
          <div className="focus-dropzone" onClick={() => fileInputRef.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addAudioFiles(event.dataTransfer.files) }}>
            <Upload size={18} /><strong>Add MP3 files</strong><span>Drop files here or browse your device</span>
            <input ref={fileInputRef} type="file" accept="audio/mpeg,.mp3" multiple onChange={event => { if (event.target.files) addAudioFiles(event.target.files); event.target.value = '' }} />
          </div>
          {queue.length > 0 && <div className="focus-queue-actions"><span>QUEUE</span><button onClick={clearQueue}><Trash2 size={12} /> Clear all</button></div>}
          <div className="focus-track-list">
            {queue.length === 0 ? <div className="focus-empty-queue"><Music2 size={22} /><span>Drop MP3s here to study with sound.</span></div> : queue.map((track, index) => (
              <div className={`focus-track ${index === activeTrack ? 'active' : ''}`} key={track.id} aria-current={index === activeTrack ? 'true' : undefined} onClick={() => selectTrack(index, audioPlaying)}>
                <button className="focus-track-play" onClick={event => { event.stopPropagation(); selectTrack(index, index === activeTrack ? !audioPlaying : true) }} aria-label={`${index === activeTrack && audioPlaying ? 'Pause' : 'Play'} ${track.name}`}>{index === activeTrack && audioPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}</button>
                <div className="focus-track-copy"><strong>{track.name}</strong><span>{formatAudioTime(track.duration)}</span></div>
                <div className="focus-track-actions">
                  <button onClick={event => { event.stopPropagation(); moveTrack(index, -1) }} disabled={index === 0} aria-label={`Move ${track.name} up`}><ChevronUp size={13} /></button>
                  <button onClick={event => { event.stopPropagation(); moveTrack(index, 1) }} disabled={index === queue.length - 1} aria-label={`Move ${track.name} down`}><ChevronDown size={13} /></button>
                  <button onClick={event => { event.stopPropagation(); removeTrack(track.id) }} aria-label={`Remove ${track.name}`}><X size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </aside>
        {!queueOpen && <button className="focus-open-queue" onClick={() => setQueueOpen(true)}><Music2 size={15} /> Sound queue {queue.length ? `(${queue.length})` : ''}</button>}
      </main>

      <footer className="focus-footer">
        <div className="focus-today-summary"><span className="section-title">TODAY</span><strong>{totalToday > 0 ? totalToday.toFixed(1) : '0'}h focused</strong><span>·</span><strong>{sessionCount} sessions</strong></div>
        <div className="focus-footer-note">Your timer and queue stay local to this device.</div>
      </footer>
    </div>
  )
}
