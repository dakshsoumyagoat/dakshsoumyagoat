import { useState } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import { Plus, Search, CheckCircle2, Circle, Trash2 } from 'lucide-react'

export default function QuestionBank() {
  const { bookmarks, addBookmark, removeBookmark, updateBookmark } = useStore()
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('All')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [filterSolved, setFilterSolved] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newQ, setNewQ] = useState({ subject: 'Physics', chapter: '', difficulty: 'Medium', notes: '', tags: '' })
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = bookmarks.filter(b => {
    if (filterSubject !== 'All' && b.subject !== filterSubject) return false
    if (filterDifficulty !== 'All' && b.difficulty !== filterDifficulty) return false
    if (filterSolved === 'Solved' && !b.solved) return false
    if (filterSolved === 'Unsolved' && b.solved) return false
    if (search && !b.chapter.toLowerCase().includes(search.toLowerCase()) && !b.notes.toLowerCase().includes(search.toLowerCase()) && !b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const handleAdd = () => {
    if (!newQ.chapter.trim()) return
    addBookmark({
      id: `bq-${Date.now()}`,
      subject: newQ.subject as any,
      chapter: newQ.chapter,
      difficulty: newQ.difficulty as any,
      tags: newQ.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: newQ.notes,
      bookmarked: new Date().toISOString().split('T')[0],
      attempts: 0,
      solved: false,
    })
    setNewQ({ subject: 'Physics', chapter: '', difficulty: 'Medium', notes: '', tags: '' })
    setShowAdd(false)
  }

  const diffColors: Record<string, string> = { Easy: 'var(--neon)', Medium: 'var(--amber)', Hard: 'var(--red)' }
  const subColors: Record<string, string> = { Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)' }

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>QUESTION BANK</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Bookmarks & Mistakes</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Question
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', value: bookmarks.length, color: 'var(--text-primary)' },
            { label: 'Unsolved', value: bookmarks.filter(b => !b.solved).length, color: 'var(--red)' },
            { label: 'Solved', value: bookmarks.filter(b => b.solved).length, color: 'var(--neon)' },
            { label: 'Hard', value: bookmarks.filter(b => b.difficulty === 'Hard').length, color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div className="section-title" style={{ marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="card-elevated" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Add Question to Bank</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <select value={newQ.subject} onChange={e => setNewQ({ ...newQ, subject: e.target.value })}>
                <option>Physics</option><option>Chemistry</option><option>Mathematics</option>
              </select>
              <input placeholder="Chapter / Topic" value={newQ.chapter} onChange={e => setNewQ({ ...newQ, chapter: e.target.value })} />
              <select value={newQ.difficulty} onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <textarea placeholder="Notes / what went wrong..." value={newQ.notes}
              onChange={e => setNewQ({ ...newQ, notes: e.target.value })} rows={2} style={{ marginBottom: 10 }} />
            <input placeholder="Tags (comma-separated, e.g. MOI, Angular Momentum)" value={newQ.tags}
              onChange={e => setNewQ({ ...newQ, tags: e.target.value })} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleAdd}>Save</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }} />
          </div>
          {['All', 'Physics', 'Chemistry', 'Mathematics'].map(s => (
            <button key={s} onClick={() => setFilterSubject(s)}
              style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: filterSubject === s ? 'var(--neon)' : 'var(--bg-elevated)', color: filterSubject === s ? '#000' : 'var(--text-muted)' }}>
              {s}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button key={d} onClick={() => setFilterDifficulty(d)}
              style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: filterDifficulty === d ? diffColors[d] || 'var(--neon)' : 'var(--bg-elevated)', color: filterDifficulty === d ? (d === 'Easy' ? '#000' : 'var(--text-primary)') : 'var(--text-muted)' }}>
              {d}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          {['All', 'Solved', 'Unsolved'].map(s => (
            <button key={s} onClick={() => setFilterSolved(s)}
              style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: filterSolved === s ? 'var(--bg-elevated)' : 'var(--bg-elevated)', color: filterSolved === s ? 'var(--text-primary)' : 'var(--text-muted)', outline: filterSolved === s ? '1px solid var(--border-bright)' : 'none' }}>
              {s}
            </button>
          ))}
        </div>

        {/* Question list */}
        <div className="card">
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No questions match your filters.
            </div>
          )}
          {filtered.map((q) => (
            <div key={q.id}>
              <div
                onClick={() => setSelected(selected === q.id ? null : q.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                  borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: selected === q.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                  transition: 'background 0.1s',
                }}>
                <button onClick={e => { e.stopPropagation(); updateBookmark(q.id, { solved: !q.solved }) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: q.solved ? 'var(--neon)' : 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>
                  {q.solved ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{q.chapter}</span>
                    <span style={{ fontSize: 10, color: subColors[q.subject] }}>{q.subject}</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                      background: diffColors[q.difficulty] + '15', color: diffColors[q.difficulty],
                    }}>{q.difficulty}</span>
                    {q.solved && <span className="badge badge-neon" style={{ fontSize: 9 }}>SOLVED</span>}
                  </div>
                  {q.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{q.notes}</div>}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {q.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                        background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}>#{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{q.bookmarked}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{q.attempts} attempts</div>
                </div>
                <button onClick={e => { e.stopPropagation(); removeBookmark(q.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, marginTop: 1, opacity: 0.5 }}>
                  <Trash2 size={14} />
                </button>
              </div>
              {selected === q.id && (
                <div style={{ padding: '12px 16px 16px 44px', background: 'rgba(57,255,20,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => updateBookmark(q.id, { attempts: q.attempts + 1 })}>
                      + Attempt ({q.attempts})
                    </button>
                    <button className="btn-primary" style={{ fontSize: 11 }} onClick={() => updateBookmark(q.id, { solved: true })}>
                      Mark Solved
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
