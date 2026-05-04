import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Subject, Mastery, Chapter } from '../store/useStore'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Filter } from 'lucide-react'

const SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Mathematics']
const MASTERY_COLORS: Record<Mastery, string> = {
  'Not Started': 'var(--text-muted)',
  'Weak': 'var(--red)',
  'Average': 'var(--amber)',
  'Strong': 'var(--blue)',
  'Mastered': 'var(--neon)',
}
const MASTERY_BG: Record<Mastery, string> = {
  'Not Started': '#44444415',
  'Weak': '#ff444415',
  'Average': '#ffaa0015',
  'Strong': '#3b82f615',
  'Mastered': '#39ff1415',
}

function MasteryDot({ mastery }: { mastery: Mastery }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: MASTERY_COLORS[mastery],
      boxShadow: mastery === 'Mastered' ? '0 0 6px var(--neon)' : 'none',
      flexShrink: 0,
    }} />
  )
}

function SubjectStats({ subject }: { subject: Subject }) {
  const { chapters } = useStore()
  const sc = chapters.filter(c => c.subject === subject)
  const avgTheory = Math.round(sc.reduce((a, c) => a + c.theory, 0) / sc.length)
  const avgPyq = Math.round(sc.reduce((a, c) => a + c.pyqs, 0) / sc.length)
  const mastered = sc.filter(c => c.mastery === 'Mastered').length
  const weak = sc.filter(c => c.mastery === 'Weak' || c.mastery === 'Not Started').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
      {[
        { label: 'Theory', value: avgTheory + '%', color: 'var(--blue)' },
        { label: 'PYQs', value: avgPyq + '%', color: 'var(--purple)' },
        { label: 'Mastered', value: mastered, color: 'var(--neon)' },
        { label: 'Weak', value: weak, color: 'var(--red)' },
      ].map(s => (
        <div key={s.label} className="card-elevated" style={{ padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div className="section-title" style={{ marginTop: 3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function ChapterRow({ chapter }: { chapter: Chapter }) {
  const { updateChapter } = useStore()
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="chapter-row" onClick={() => setExpanded(!expanded)}>
        <MasteryDot mastery={chapter.mastery} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chapter.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{chapter.unit} · {chapter.difficulty}</div>
        </div>

        {/* Theory */}
        <div style={{ width: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Theory</span>
            <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{chapter.theory}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${chapter.theory}%` }} /></div>
        </div>

        {/* PYQs */}
        <div style={{ width: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>PYQs</span>
            <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{chapter.pyqs}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${chapter.pyqs}%`, background: 'var(--purple)' }} /></div>
        </div>

        {/* Accuracy */}
        <div style={{ width: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: chapter.mockAccuracy > 70 ? 'var(--neon)' : chapter.mockAccuracy > 50 ? 'var(--amber)' : 'var(--red)' }}>
            {chapter.mockAccuracy}%
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Accuracy</div>
        </div>

        {/* Mastery badge */}
        <div style={{
          padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
          background: MASTERY_BG[chapter.mastery as Mastery], color: MASTERY_COLORS[chapter.mastery as Mastery],
          border: `1px solid ${MASTERY_COLORS[chapter.mastery as Mastery]}30`, minWidth: 80, textAlign: 'center',
        }}>
          {chapter.mastery}
        </div>

        <div style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '12px 16px 16px 32px', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            {['Theory', 'PYQs', 'Confidence', 'Revisions'].map((label, i) => {
              const vals = [chapter.theory, chapter.pyqs, chapter.confidence, chapter.revisionCount * 20]
              return (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  <input
                    type="range" min={0} max={100}
                    value={i === 3 ? chapter.revisionCount * 20 : [chapter.theory, chapter.pyqs, chapter.confidence][i]}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      const keys: (keyof typeof chapter)[] = ['theory', 'pyqs', 'confidence']
                      if (i < 3) updateChapter(chapter.id, { [keys[i]]: v } as any)
                    }}
                    style={{ width: '100%', accentColor: 'var(--neon)', background: 'transparent', border: 'none', padding: 0 }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--neon)' }}>{vals[i]}{i !== 3 ? '%' : ''}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['Not Started', 'Weak', 'Average', 'Strong', 'Mastered'] as Mastery[]).map(m => (
              <button key={m} onClick={() => updateChapter(chapter.id, { mastery: m })}
                className={chapter.mastery === m ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '4px 10px', fontSize: 11 }}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SyllabusTracker() {
  const { chapters } = useStore()
  const [activeSubject, setActiveSubject] = useState<Subject>('Physics')
  const [filterMastery, setFilterMastery] = useState<string>('All')

  const subjectChapters = chapters.filter(c => c.subject === activeSubject)
  const filtered = filterMastery === 'All' ? subjectChapters : subjectChapters.filter(c => c.mastery === filterMastery)

  // Group by unit
  const units = [...new Set(filtered.map(c => c.unit))]

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title" style={{ marginBottom: 4 }}>TRACKER</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Syllabus Tracker</h1>

        {/* Subject Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {SUBJECTS.map(sub => {
            const sc = chapters.filter(c => c.subject === sub)
            const pct = Math.round(sc.reduce((a, c) => a + c.theory, 0) / sc.length)
            return (
              <button key={sub} onClick={() => setActiveSubject(sub)}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeSubject === sub ? '2px solid var(--neon)' : '2px solid transparent',
                  color: activeSubject === sub ? 'var(--neon)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                {sub}
                <span style={{
                  fontSize: 11, padding: '1px 6px', borderRadius: 999,
                  background: activeSubject === sub ? '#39ff1415' : 'var(--bg-elevated)',
                  color: activeSubject === sub ? 'var(--neon)' : 'var(--text-muted)',
                }}>{pct}%</span>
              </button>
            )
          })}
        </div>

        <SubjectStats subject={activeSubject} />

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Filter:</span>
          {['All', 'Not Started', 'Weak', 'Average', 'Strong', 'Mastered'].map(m => (
            <button key={m} onClick={() => setFilterMastery(m)}
              style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11, cursor: 'pointer',
                background: filterMastery === m ? 'var(--neon)' : 'var(--bg-elevated)',
                color: filterMastery === m ? '#000' : 'var(--text-muted)',
                border: 'none', fontWeight: 600, transition: 'all 0.15s',
              }}>{m}</button>
          ))}
        </div>

        {/* Chapter List by Unit */}
        <div className="card">
          {/* Header */}
          <div style={{
            display: 'flex', gap: 12, padding: '10px 16px',
            borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)',
            borderRadius: '12px 12px 0 0',
          }}>
            <div style={{ width: 8 }} />
            <div style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>CHAPTER</div>
            <div style={{ width: 100, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>THEORY</div>
            <div style={{ width: 80, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>PYQs</div>
            <div style={{ width: 60, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>ACCURACY</div>
            <div style={{ width: 80, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>MASTERY</div>
            <div style={{ width: 14 }} />
          </div>

          {units.map(unit => (
            <div key={unit}>
              <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {unit}
                </span>
              </div>
              {filtered.filter(c => c.unit === unit).map(ch => (
                <ChapterRow key={ch.id} chapter={ch} />
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
