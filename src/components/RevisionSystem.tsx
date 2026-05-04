import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Chapter } from '../store/useStore'
import { motion } from 'framer-motion'
import { RefreshCw, Clock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

// R1→1d, R2→3d, R3→7d, R4→21d, R5→30d (spaced repetition intervals)
const CYCLES = [
  { revision: 1, label: 'R1', days: 1,  nextDays: 3,  color: 'var(--neon)',   desc: 'Day 1' },
  { revision: 2, label: 'R2', days: 3,  nextDays: 7,  color: 'var(--blue)',   desc: 'Day 3' },
  { revision: 3, label: 'R3', days: 7,  nextDays: 21, color: 'var(--amber)',  desc: 'Day 7' },
  { revision: 4, label: 'R4', days: 21, nextDays: 30, color: 'var(--purple)', desc: 'Day 21' },
  { revision: 5, label: 'R5', days: 30, nextDays: 60, color: 'var(--red)',    desc: 'Day 30' },
]

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function getDaysUntil(dateStr: string | null) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function CycleDots({ revisionCount }: { revisionCount: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {CYCLES.map(c => {
        const done = revisionCount >= c.revision
        const current = revisionCount === c.revision - 1
        return (
          <div key={c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: current ? 9 : 7, height: current ? 9 : 7,
              borderRadius: '50%',
              background: done ? c.color : current ? 'transparent' : 'var(--border)',
              border: current ? `1.5px solid ${c.color}` : 'none',
              boxShadow: done ? `0 0 5px ${c.color}99` : 'none',
              transition: 'all 0.2s',
            }} title={`${c.label} — ${c.desc}`} />
          </div>
        )
      })}
    </div>
  )
}

function RevisionRow({ ch, isLast }: { ch: Chapter & { daysUntil: number | null }; isLast: boolean }) {
  const { updateChapter } = useStore()
  const [marking, setMarking] = useState(false)

  const urgency = ch.daysUntil !== null && ch.daysUntil < 0 ? 'overdue'
    : ch.daysUntil === 0 ? 'today'
    : 'upcoming'
  const urgencyColor = urgency === 'overdue' ? 'var(--red)'
    : urgency === 'today' ? 'var(--amber)'
    : 'var(--text-muted)'
  const subColor: Record<string, string> = {
    Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)'
  }

  const currentCycleLabel = CYCLES.find(c => c.revision === ch.revisionCount + 1)?.label ?? 'Done'
  const nextCycle = CYCLES.find(c => c.revision === ch.revisionCount + 1)

  const handleMarkRevised = () => {
    setMarking(true)
    const newRevisionCount = Math.min(ch.revisionCount + 1, 5)
    const nextDays = nextCycle ? nextCycle.days : 60
    const nextRevisionDate = addDays(nextDays)

    updateChapter(ch.id, {
      revisionCount: newRevisionCount,
      lastStudied: new Date().toISOString().split('T')[0],
      nextRevision: nextRevisionDate,
    })

    const nextLabel = CYCLES.find(c => c.revision === newRevisionCount + 1)?.label
    toast.success(
      nextLabel
        ? `${ch.name} marked revised! Next: ${nextLabel} in ${nextDays}d`
        : `${ch.name} completed all 5 revision cycles! 🎉`,
      { duration: 3000 }
    )
    setTimeout(() => setMarking(false), 300)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderBottom: !isLast ? '1px solid var(--border)' : 'none',
      background: marking ? 'rgba(57,255,20,0.04)' : 'transparent',
      transition: 'background 0.3s',
    }}>
      {/* Urgency strip */}
      <div style={{ width: 3, height: 40, background: urgencyColor, borderRadius: 2, flexShrink: 0 }} />

      {/* Chapter info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
        <div style={{ fontSize: 10, color: subColor[ch.subject] }}>{ch.subject} · {ch.unit}</div>
      </div>

      {/* Cycle dots R1–R5 */}
      <CycleDots revisionCount={ch.revisionCount} />

      {/* Next cycle badge */}
      <div style={{
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
        background: nextCycle ? nextCycle.color + '20' : '#39ff1420',
        color: nextCycle ? nextCycle.color : 'var(--neon)',
        border: `1px solid ${nextCycle ? nextCycle.color + '40' : '#39ff1440'}`,
        minWidth: 28, textAlign: 'center', flexShrink: 0,
      }}>
        {currentCycleLabel}
      </div>

      {/* Due label */}
      <div style={{ textAlign: 'right', minWidth: 72, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: urgencyColor }}>
          {ch.daysUntil === null ? '—' :
            ch.daysUntil < 0 ? `${Math.abs(ch.daysUntil)}d overdue` :
              ch.daysUntil === 0 ? 'Today' : `In ${ch.daysUntil}d`}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {ch.revisionCount >= 5 ? 'All done' : `Rev ${ch.revisionCount}/5`}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleMarkRevised}
        disabled={ch.revisionCount >= 5}
        className="btn-ghost"
        style={{
          padding: '5px 12px', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0,
          opacity: ch.revisionCount >= 5 ? 0.4 : 1,
          cursor: ch.revisionCount >= 5 ? 'not-allowed' : 'pointer',
          borderColor: urgency === 'overdue' ? 'var(--red)' : urgency === 'today' ? 'var(--amber)' : undefined,
          color: urgency === 'overdue' ? 'var(--red)' : urgency === 'today' ? 'var(--amber)' : undefined,
        }}
      >
        {ch.revisionCount >= 5 ? 'Complete' : 'Mark Revised'}
      </button>
    </div>
  )
}

export default function RevisionSystem() {
  const { chapters } = useStore()
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('today')

  const withRevision = chapters
    .filter(c => c.mastery !== 'Not Started')
    .map(c => ({ ...c, daysUntil: getDaysUntil(c.nextRevision) }))

  const filtered = withRevision.filter(c => {
    if (activeFilter === 'overdue')  return c.daysUntil !== null && c.daysUntil < 0
    if (activeFilter === 'today')    return c.daysUntil !== null && c.daysUntil <= 1 && c.daysUntil >= 0
    if (activeFilter === 'upcoming') return c.daysUntil !== null && c.daysUntil > 1 && c.daysUntil <= 7
    return true
  }).slice(0, 40)

  const overdue  = withRevision.filter(c => c.daysUntil !== null && c.daysUntil < 0).length
  const todayDue = withRevision.filter(c => c.daysUntil !== null && c.daysUntil <= 1 && c.daysUntil >= 0).length
  const upcoming = withRevision.filter(c => c.daysUntil !== null && c.daysUntil > 1 && c.daysUntil <= 7).length
  const healthy  = withRevision.length - overdue - todayDue - upcoming

  // Calendar for next 4 weeks
  const weeks = Array.from({ length: 4 }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) => {
      const d = new Date()
      d.setDate(d.getDate() + wi * 7 + di)
      const count = withRevision.filter(c => getDaysUntil(c.nextRevision) === wi * 7 + di).length
      return { date: d, count }
    })
  )

  const todayWeekday = (new Date().getDay() + 6) % 7 // 0=Mon

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>SPACED REPETITION</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Revision System</h1>
          </div>
          <img src="./logo2.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 8px #39ff1466)', opacity: 0.8, flexShrink: 0 }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Overdue',   value: overdue,  color: 'var(--red)',   icon: AlertTriangle },
            { label: 'Due Today', value: todayDue, color: 'var(--amber)', icon: Clock },
            { label: 'This Week', value: upcoming, color: 'var(--blue)',  icon: Calendar },
            { label: 'Healthy',   value: healthy,  color: 'var(--neon)',  icon: CheckCircle2 },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="section-title">{s.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Cycle legend */}
        <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Revision Cycles:</span>
            {CYCLES.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, boxShadow: `0 0 4px ${c.color}` }} />
                <span style={{ fontSize: 12, color: c.color, fontWeight: 700 }}>{c.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.desc}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>SM-2 spaced repetition</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          {/* Chapter list */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {([['all', 'All'], ['overdue', `Overdue (${overdue})`], ['today', `Today (${todayDue})`], ['upcoming', `Upcoming (${upcoming})`]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setActiveFilter(key as any)}
                  style={{
                    padding: '5px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                    background: activeFilter === key ? 'var(--neon)' : 'var(--bg-elevated)',
                    color: activeFilter === key ? '#000' : 'var(--text-muted)',
                    border: 'none', transition: 'all 0.15s',
                  }}>{label}</button>
              ))}
            </div>

            <div className="card">
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {activeFilter === 'today' ? 'Nothing due today — great work!' :
                   activeFilter === 'overdue' ? 'No overdue chapters!' :
                   'No chapters in this filter.'}
                </div>
              ) : (
                filtered.map((ch, i) => (
                  <RevisionRow key={ch.id} ch={ch} isLast={i === filtered.length - 1} />
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Revision Calendar */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color="var(--neon)" />
                Revision Calendar
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, padding: '2px 0' }}>{d}</div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
                  {week.map((day, di) => {
                    const isToday = wi === 0 && di === todayWeekday
                    return (
                      <div key={di} style={{
                        aspectRatio: '1', borderRadius: 4,
                        background: day.count > 5 ? '#39ff1488' : day.count > 2 ? '#39ff1444' : day.count > 0 ? '#39ff1420' : 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: day.count > 0 ? 'var(--neon)' : 'var(--text-muted)',
                        fontWeight: 700, cursor: 'pointer',
                        border: isToday ? '1px solid var(--neon)' : '1px solid transparent',
                        boxShadow: isToday ? '0 0 6px #39ff1444' : 'none',
                      }} title={`${day.count} revisions`}>
                        {day.date.getDate()}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Darker = more revisions scheduled
              </div>
            </div>

            {/* Retention health */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Retention Health</div>
              {['Physics', 'Chemistry', 'Mathematics'].map((sub, si) => {
                const subChaps = withRevision.filter(c => c.subject === sub)
                const avgCycles = subChaps.length > 0
                  ? Math.round(subChaps.reduce((a, c) => a + c.revisionCount, 0) / subChaps.length * 20)
                  : 0
                const colors = ['var(--blue)', 'var(--amber)', 'var(--neon)']
                return (
                  <div key={sub} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{sub}</span>
                      <span style={{ fontSize: 12, color: colors[si] }}>{avgCycles}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div style={{ width: `${avgCycles}%`, height: '100%', background: colors[si], borderRadius: 999 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* R1–R5 progress */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Cycle Completion</div>
              {CYCLES.map(c => {
                const done = withRevision.filter(ch => ch.revisionCount >= c.revision).length
                const pct = withRevision.length > 0 ? Math.round((done / withRevision.length) * 100) : 0
                return (
                  <div key={c.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.label}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.desc}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{done}/{withRevision.length}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: c.color, borderRadius: 999, boxShadow: `0 0 4px ${c.color}66` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
