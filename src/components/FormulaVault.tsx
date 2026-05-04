import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Subject } from '../store/useStore'
import { motion } from 'framer-motion'
import { Plus, Search, Pin, PinOff, Trash2, Edit3, Save } from 'lucide-react'

export default function FormulaVault() {
  const { formulas, addFormula, updateFormula, removeFormula } = useStore()
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [newF, setNewF] = useState({ subject: 'Physics', title: '', content: '', tags: '' })
  const [editContent, setEditContent] = useState('')

  const filtered = formulas.filter(f => {
    if (filterSubject !== 'All' && f.subject !== filterSubject) return false
    if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.content.toLowerCase().includes(search.toLowerCase()) && !f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const handleAdd = () => {
    if (!newF.title.trim()) return
    addFormula({
      id: `f-${Date.now()}`,
      subject: newF.subject as Subject,
      title: newF.title,
      content: newF.content,
      tags: newF.tags.split(',').map(t => t.trim()).filter(Boolean),
      created: new Date().toISOString().split('T')[0],
      pinned: false,
    })
    setNewF({ subject: 'Physics', title: '', content: '', tags: '' })
    setShowAdd(false)
  }

  const subColors: Record<string, string> = { Physics: 'var(--blue)', Chemistry: 'var(--amber)', Mathematics: 'var(--neon)' }

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>KNOWLEDGE BASE</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Formula Vault</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New Note
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="card-elevated" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>New Formula / Note</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10, marginBottom: 10 }}>
              <select value={newF.subject} onChange={e => setNewF({ ...newF, subject: e.target.value })}>
                <option>Physics</option><option>Chemistry</option><option>Mathematics</option>
              </select>
              <input placeholder="Title (e.g. Rotational Mechanics)" value={newF.title}
                onChange={e => setNewF({ ...newF, title: e.target.value })} />
              <input placeholder="Tags (comma-separated)" value={newF.tags}
                onChange={e => setNewF({ ...newF, tags: e.target.value })} />
            </div>
            <textarea placeholder="Content (markdown supported)..." value={newF.content}
              onChange={e => setNewF({ ...newF, content: e.target.value })} rows={6} style={{ fontFamily: 'JetBrains Mono', fontSize: 12, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleAdd}>Save Note</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search formulas..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          {['All', 'Physics', 'Chemistry', 'Mathematics'].map(s => (
            <button key={s} onClick={() => setFilterSubject(s)}
              style={{
                padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filterSubject === s ? 'var(--neon)' : 'var(--bg-elevated)',
                color: filterSubject === s ? '#000' : 'var(--text-muted)',
              }}>{s}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(f => (
              <motion.div key={f.id} layout className="card"
                style={{ padding: '16px', cursor: 'pointer', border: selected === f.id ? '1px solid var(--neon)' : '1px solid var(--border)' }}
                onClick={() => { setSelected(selected === f.id ? null : f.id); setEditing(null) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{f.title}</div>
                    <span style={{ fontSize: 10, color: subColors[f.subject], fontWeight: 600 }}>{f.subject}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {f.pinned && <Pin size={12} color="var(--amber)" />}
                    <button onClick={e => { e.stopPropagation(); updateFormula(f.id, { pinned: !f.pinned }) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                      {f.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-line', maxHeight: 60, overflow: 'hidden' }}>
                  {f.content.substring(0, 120)}{f.content.length > 120 ? '...' : ''}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {f.tags.map(tag => (
                    <span key={tag} style={{ padding: '1px 6px', borderRadius: 999, fontSize: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>#{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No formulas found. Add your first note!
              </div>
            )}
          </div>

          {/* Detail / Editor */}
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="card" style={{ padding: '20px', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
              {(() => {
                const f = formulas.find(f => f.id === selected)
                if (!f) return null
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{f.title}</div>
                        <div style={{ fontSize: 11, color: subColors[f.subject] }}>{f.subject}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-ghost" style={{ padding: '5px 8px' }}
                          onClick={() => { setEditing(f.id); setEditContent(f.content) }}>
                          <Edit3 size={13} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '5px 8px' }}
                          onClick={() => { removeFormula(f.id); setSelected(null) }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {editing === f.id ? (
                      <>
                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                          rows={12} style={{ fontFamily: 'JetBrains Mono', fontSize: 12, marginBottom: 10 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-primary" onClick={() => { updateFormula(f.id, { content: editContent }); setEditing(null) }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Save size={12} /> Save
                          </button>
                          <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <pre style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {f.content}
                      </pre>
                    )}
                  </>
                )
              })()}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
