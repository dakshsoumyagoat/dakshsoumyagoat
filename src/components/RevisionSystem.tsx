import { useState } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { RefreshCw, Clock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react'

const CYCLES = [
  { days: 1, label: '1D', color: 'var(--neon)' },
  { days: 3, label: '3D', color: 'var(--blue)' },
  { days: 7, label: '7D', color: 'var(--amber)' },
  { days: 21, label: '21D', color: 'var(--purple)' },
  { days: 30, label: '30D', color: 'var(--red)' },
]

function getDaysUntil(dateStr: string | null) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function RevisionSystem() {
  const { chapters } = useStore()
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('today')

  const withRevision = chapters.filter(c => c.theory > 20).map(c => ({
    ...c,
    daysUntil: getDaysUntil(c.nextRevision),
  }))

  const filtered = withRevision.filter(c => {
    if (activeFilter === 'overdue') return c.daysUntil !== null && c.daysUntil < 0
    if (activeFilter === 'today') return c.daysUntil !== null && c.daysUntil <= 1 && c.daysUntil >= 0
    if (activeFilter === 'upcoming') return c.daysUntil !== null && c.daysUntil > 1 && c.daysUntil <= 7
    return true
  }).slice(0, 30)

  const overdue = withRevision.filter(c => c.daysUntil !== null && c.daysUntil < 0).length
  const todayDue = withRevision.filter(c => c.daysUntil !== null && c.daysUntil <= 1 && c.daysUntil >= 0).length
  const upcoming = withRevision.filter(c => c.daysUntil !== null && c.daysUntil > 1 && c.daysUntil <= 7).length

  // Build calendar weeks for next 4 weeks
  const weeks = Array.from({ length: 4 }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) => {
      const d = new Date()
      d.setDate(d.getDate() + wi * 7 + di)
      const count = withRevision.filter(c => getDaysUntil(c.nextRevision) === wi * 7 + di).length
      return { date: d, count }
    })
  )

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>SPACED REPETITION</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Revision System</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Overdue', value: overdue, color: 'var(--red)', icon: AlertTriangle },
            { label: 'Due Today', value: todayDue, color: 'var(--amber)', icon: Clock },
            { label: 'This Week', value: upcoming, color: 'var(--blue)', icon: Calendar },
            { label: 'Healthy', value: withRevision.length - overdue - todayDue - upcoming, color: 'var(--neon)', icon: CheckCircle2 },
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

        {/* Revision cycles legend */}
        <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Revision Cycles:</span>
            {CYCLES.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color }} />
                <span style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{c.label}</span>
              </div>
            ))}
            <RefreshCw size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-scheduled with SM-2 algorithm</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          {/* Chapter List */}
          <div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[['all', 'All'], ['overdue', 'Overdue'], ['today', 'Today'], ['upcoming', 'Upcoming']].map(([key, label]) => (
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
              {filtered.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No chapters in this category.
                </div>
              )}
              {filtered.map((ch, i) => {
                const urgency = ch.daysUntil !== null && ch.daysUntil < 0 ? 'overdue' : ch.daysUntil === 0 ? 'today' : 'upcoming'
                const urgencyColor = urgency === 'overdue' ? 'var(--red)' : urgency === 'today' ? 'var(--amber)' : 'var(--text-muted)'
                const subColor: Record<string, string> = { Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)' }

                return (
                  <div key={ch.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ width: 3, height: 36, background: urgencyColor, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{ch.name}</div>
                      <div style={{ fontSize: 10, color: subColor[ch.subject] }}>{ch.subject} · {ch.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: urgencyColor }}>
                        {ch.daysUntil === null ? 'Never revised' :
                          ch.daysUntil < 0 ? `${Math.abs(ch.daysUntil)}d overdue` :
                            ch.daysUntil === 0 ? 'Today' : `In ${ch.daysUntil}d`}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rev #{ch.revisionCount}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {CYCLES.map(cyc => (
                        <div key={cyc.days} style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: ch.revisionCount >= Math.log2(cyc.days + 1) ? cyc.color : 'var(--border)',
                        }} title={`${cyc.label} cycle`} />
                      ))}
                    </div>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Mark Revised</button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Calendar */}
          <div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color="var(--neon)" />
                Revision Calendar
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, padding: '2px 0' }}>{d}</div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
                  {week.map((day, di) => (
                    <div key={di} style={{
                      aspectRatio: '1', borderRadius: 4,
                      background: day.count > 5 ? '#39ff1488' : day.count > 2 ? '#39ff1444' : day.count > 0 ? '#39ff1420' : 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: day.count > 0 ? 'var(--neon)' : 'var(--text-muted)',
                      fontWeight: 700, cursor: 'pointer',
                      border: wi === 0 && di === new Date().getDay() - 1 ? '1px solid var(--neon)' : '1px solid transparent',
                    }} title={`${day.count} revisions`}>
                      {day.date.getDate()}
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Darker green = more revisions scheduled
              </div>
            </div>

            {/* Retention graph */}
            <div className="card" style={{ padding: '16px', marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Retention Health</div>
              {['Physics', 'Chemistry', 'Mathematics'].map((sub, si) => {
                const vals = [72, 58, 81]
                const colors = ['var(--blue)', 'var(--amber)', 'var(--neon)']
                return (
                  <div key={sub} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{sub}</span>
                      <span style={{ fontSize: 12, color: colors[si] }}>{vals[si]}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div style={{ width: `${vals[si]}%`, height: '100%', background: colors[si], borderRadius: 999 }} />
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
