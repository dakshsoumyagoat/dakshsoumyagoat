import { useMemo, useState } from 'react'
import { Bell, Check, CheckCircle2, Clock3, Pin, Plus, Search, StickyNote, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'
import type { ImportantNote, NoteColor } from '../store/useStore'
import { PageHeader, PageShell } from './PageShell'

const COLORS: { value: NoteColor; label: string }[] = [
  { value: 'yellow', label: 'Sun' },
  { value: 'peach', label: 'Peach' },
  { value: 'mint', label: 'Mint' },
  { value: 'lavender', label: 'Lilac' },
]

type StatusFilter = 'all' | 'open' | 'done'
type ReminderFilter = 'any' | 'reminder' | 'overdue'

function noteIsOverdue(note: ImportantNote) {
  return Boolean(note.reminder && !note.completed && new Date(note.reminder).getTime() < Date.now())
}

function reminderLabel(reminder?: string) {
  if (!reminder) return 'No reminder'
  const date = new Date(reminder)
  if (Number.isNaN(date.getTime())) return 'Invalid reminder'
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  return isToday
    ? `Today · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function toLocalInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function blankNote(): Omit<ImportantNote, 'id' | 'createdAt' | 'updatedAt'> {
  return { title: '', content: '', color: 'yellow', reminder: '', pinned: false, completed: false }
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleComplete,
  onTogglePinned,
}: {
  note: ImportantNote
  onEdit: () => void
  onDelete: () => void
  onToggleComplete: () => void
  onTogglePinned: () => void
}) {
  const overdue = noteIsOverdue(note)
  return (
    <article className={`sticky-note sticky-${note.color} ${note.completed ? 'sticky-done' : ''} ${note.pinned ? 'sticky-pinned' : ''} ${overdue ? 'sticky-overdue' : ''}`}>
      <div className="sticky-tape" aria-hidden="true" />
      <div className="sticky-note-topline">
        <button className={`sticky-check ${note.completed ? 'checked' : ''}`} onClick={onToggleComplete} aria-label={note.completed ? `Mark ${note.title} open` : `Mark ${note.title} complete`}>
          {note.completed && <Check size={13} />}
        </button>
        <div className="sticky-note-actions">
          <button onClick={onTogglePinned} aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`} className={note.pinned ? 'is-pinned' : ''}><Pin size={14} fill={note.pinned ? 'currentColor' : 'none'} /></button>
          <button onClick={onEdit} aria-label={`Edit ${note.title}`}><StickyNote size={14} /></button>
          <button onClick={onDelete} aria-label={`Delete ${note.title}`}><Trash2 size={14} /></button>
        </div>
      </div>
      <button className="sticky-note-body" onClick={onEdit}>
        <h3>{note.title || 'Untitled note'}</h3>
        {note.content && <p>{note.content}</p>}
      </button>
      <div className={`sticky-reminder ${overdue ? 'is-overdue' : ''}`}>
        <Clock3 size={12} />
        <span>{note.reminder ? reminderLabel(note.reminder) : 'Add a reminder'}</span>
      </div>
      <div className="sticky-note-footer">
        <span>{note.pinned ? 'PINNED' : note.completed ? 'DONE' : 'OPEN'}</span>
        {overdue && <strong>OVERDUE</strong>}
      </div>
    </article>
  )
}

export default function ImportantNotes() {
  const { importantNotes, addImportantNote, updateImportantNote, removeImportantNote, toggleImportantNoteComplete, toggleImportantNotePinned } = useStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [reminderFilter, setReminderFilter] = useState<ReminderFilter>('any')
  const [editing, setEditing] = useState<ImportantNote | null>(null)
  const [draft, setDraft] = useState(blankNote())

  const counts = useMemo(() => ({
    pinned: importantNotes.filter(note => note.pinned && !note.completed).length,
    due: importantNotes.filter(note => note.reminder && !note.completed && new Date(note.reminder).toDateString() === new Date().toDateString()).length,
    open: importantNotes.filter(note => !note.completed).length,
    done: importantNotes.filter(note => note.completed).length,
  }), [importantNotes])

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return importantNotes
      .filter(note => status === 'all' || (status === 'done' ? note.completed : !note.completed))
      .filter(note => reminderFilter === 'any' || (reminderFilter === 'reminder' ? Boolean(note.reminder) : noteIsOverdue(note)))
      .filter(note => !query || `${note.title} ${note.content}`.toLowerCase().includes(query))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(a.completed) - Number(b.completed) || (b.updatedAt.localeCompare(a.updatedAt)))
  }, [importantNotes, reminderFilter, search, status])

  const openNew = () => {
    setDraft({ ...blankNote(), reminder: toLocalInputValue(new Date(Date.now() + 86400000)) })
    setEditing(null)
  }

  const openEdit = (note: ImportantNote) => {
    setDraft({ title: note.title, content: note.content, color: note.color, reminder: note.reminder ?? '', pinned: note.pinned, completed: note.completed })
    setEditing(note)
  }

  const closeEditor = () => {
    setEditing(null)
    setDraft(blankNote())
  }

  const saveNote = () => {
    if (!draft.title.trim()) {
      toast.error('Give this note a title first.')
      return
    }
    const now = new Date().toISOString()
    if (editing) {
      updateImportantNote(editing.id, { ...draft, title: draft.title.trim(), updatedAt: now })
      toast.success('Note updated')
    } else {
      addImportantNote({ ...draft, title: draft.title.trim(), id: `note-${Date.now()}`, createdAt: now, updatedAt: now })
      toast.success('Note added to your board')
    }
    closeEditor()
  }

  const deleteNote = (note: ImportantNote) => {
    if (!window.confirm(`Delete “${note.title}”?`)) return
    removeImportantNote(note.id)
    toast.success('Note deleted')
    if (editing?.id === note.id) closeEditor()
  }

  return (
    <PageShell className="notes-page">
      <PageHeader
        eyebrow="PERSONAL OPS"
        title="Important Notes"
        description="Keep the small things visible before they become big things."
        actions={<button className="btn-primary" onClick={openNew}><Plus size={15} /> New note</button>}
      />

      <div className="notes-overview" aria-label="Notes overview">
        {[
          { label: 'Pinned', value: counts.pinned, color: 'var(--amber)', icon: Pin },
          { label: 'Due today', value: counts.due, color: 'var(--red)', icon: Bell },
          { label: 'Open', value: counts.open, color: 'var(--neon)', icon: StickyNote },
          { label: 'Completed', value: counts.done, color: 'var(--blue)', icon: CheckCircle2 },
        ].map(item => {
          const Icon = item.icon
          return <div className="notes-overview-item" key={item.label}><Icon size={14} style={{ color: item.color }} /><span>{item.label}</span><strong style={{ color: item.color }}>{item.value}</strong></div>
        })}
      </div>

      <div className="notes-toolbar">
        <label className="notes-search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search notes..." aria-label="Search notes" /></label>
        <div className="notes-filter-group" aria-label="Note status">
          {(['all', 'open', 'done'] as StatusFilter[]).map(value => <button key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)}>{value === 'all' ? 'All' : value === 'open' ? 'Open' : 'Done'}</button>)}
        </div>
        <select value={reminderFilter} onChange={event => setReminderFilter(event.target.value as ReminderFilter)} aria-label="Filter by reminder">
          <option value="any">Any reminder</option>
          <option value="reminder">With reminder</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="notes-board-heading">
        <div><div className="section-title">STICKY WALL</div><h2>Your reminders, in sight.</h2></div>
        <span>{visibleNotes.length} {visibleNotes.length === 1 ? 'note' : 'notes'}</span>
      </div>

      {visibleNotes.length === 0 ? (
        <div className="notes-empty">
          <div className="notes-empty-stack"><span /><span /><span><StickyNote size={24} /></span></div>
          <h2>{importantNotes.length ? 'No notes match these filters.' : 'Your wall is ready.'}</h2>
          <p>{importantNotes.length ? 'Try a different search or filter.' : 'Capture a formula, a deadline, or the one thing you cannot forget.'}</p>
          <button className="btn-primary" onClick={openNew}><Plus size={15} /> Create your first note</button>
        </div>
      ) : (
        <div className="sticky-board" role="list">
          {visibleNotes.map(note => <div role="listitem" key={note.id}><NoteCard note={note} onEdit={() => openEdit(note)} onDelete={() => deleteNote(note)} onToggleComplete={() => toggleImportantNoteComplete(note.id)} onTogglePinned={() => toggleImportantNotePinned(note.id)} /></div>)}
          <button className="sticky-add-card" onClick={openNew}><Plus size={20} /><span>Add another note</span></button>
        </div>
      )}

      <section className="notes-reminder-strip">
        <div className="notes-reminder-title"><Bell size={15} /><div><div className="section-title">UPCOMING REMINDERS</div><strong>Keep your next move close.</strong></div></div>
        <div className="notes-reminder-list">
          {importantNotes.filter(note => note.reminder && !note.completed).sort((a, b) => (a.reminder ?? '').localeCompare(b.reminder ?? '')).slice(0, 3).map(note => <button key={note.id} onClick={() => openEdit(note)} className={noteIsOverdue(note) ? 'overdue' : ''}><span>{note.title}</span><small>{reminderLabel(note.reminder)}</small></button>)}
          {!importantNotes.some(note => note.reminder && !note.completed) && <span className="notes-no-reminders">No upcoming reminders yet.</span>}
        </div>
      </section>

      {editing !== null || draft.title || draft.content ? (
        <div className="note-editor-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor() }}>
          <section className={`note-editor sticky-${draft.color}`} role="dialog" aria-modal="true" aria-labelledby="note-editor-title">
            <div className="note-editor-header"><div><div className="section-title">{editing ? 'EDIT NOTE' : 'NEW NOTE'}</div><h2 id="note-editor-title">{editing ? 'Refine the reminder.' : 'Pin it before you forget.'}</h2></div><button onClick={closeEditor} aria-label="Close note editor"><X size={18} /></button></div>
            <label>Title<input autoFocus value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Revise electrostatics formulas" /></label>
            <label>Note<textarea value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} placeholder="Write the detail you want to keep visible..." rows={5} /></label>
            <div className="note-editor-row"><label>Reminder<input type="datetime-local" value={draft.reminder ?? ''} onChange={event => setDraft({ ...draft, reminder: event.target.value })} /></label><label>Color<select value={draft.color} onChange={event => setDraft({ ...draft, color: event.target.value as NoteColor })}>{COLORS.map(color => <option key={color.value} value={color.value}>{color.label}</option>)}</select></label></div>
            <div className="note-editor-options"><button className={draft.pinned ? 'selected' : ''} onClick={() => setDraft({ ...draft, pinned: !draft.pinned })}><Pin size={14} fill={draft.pinned ? 'currentColor' : 'none'} /> {draft.pinned ? 'Pinned' : 'Pin note'}</button><button className={draft.completed ? 'selected' : ''} onClick={() => setDraft({ ...draft, completed: !draft.completed })}><Check size={14} /> {draft.completed ? 'Completed' : 'Mark complete'}</button></div>
            <div className="note-editor-footer"><button className="btn-ghost" onClick={closeEditor}>Cancel</button><button className="btn-primary" onClick={saveNote}><Check size={15} /> Save note</button></div>
          </section>
        </div>
      ) : null}
    </PageShell>
  )
}