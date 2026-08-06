import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays, ChevronLeft, ChevronRight, Download, FileUp,
  Info, Trash2, Upload, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'
import type { CalendarEvent } from '../store/useStore'
import { PageHeader, PageShell } from './PageShell'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const EVENT_COLORS = ['var(--neon)', 'var(--blue)', 'var(--amber)', 'var(--purple)', 'var(--red)']

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`)
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ''
  let quoted = false

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i]
    if (character === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      values.push(value.trim())
      value = ''
    } else {
      value += character
    }
  }
  values.push(value.trim())
  return values
}

function parseCalendarDate(rawValue: string) {
  const rawDate = rawValue.trim().replace(/^\uFEFF/, '')
  let year = ''
  let month = ''
  let day = ''

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(rawDate)) {
    ;[year, month, day] = rawDate.split('-')
  } else {
    const slashDate = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (slashDate) {
      [, month, day, year] = slashDate
    } else {
      const isoDate = rawDate.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
      if (isoDate) [, year, month, day] = isoDate
    }
  }

  if (!year || !month || !day) return ''
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return ''
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function inferEventType(title: string) {
  const normalizedTitle = title.toLowerCase()
  if (normalizedTitle.startsWith('holiday:')) return 'Holiday'
  if (normalizedTitle.includes('weekly test')) return 'Weekly Test'
  if (normalizedTitle.includes('main test') || normalizedTitle.includes('advanced test')) return 'Mock Test'
  if (normalizedTitle.includes('exam') || normalizedTitle.includes('quarterly') || normalizedTitle.includes('midterm')) return 'Exam'
  return undefined
}

function parseCsv(csv: string): { events: CalendarEvent[]; invalidRows: number[] } {
  const lines = csv.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return { events: [], invalidRows: [] }

  const headers = parseCsvLine(lines[0]).map(header => header.replace(/^\uFEFF/, '').toLowerCase().replace(/[\s_-]+/g, ''))
  const column = (names: string[]) => names.map(name => headers.indexOf(name)).find(index => index >= 0) ?? -1
  const titleIndex = column(['title', 'event', 'name', 'subject'])
  const dateIndex = column(['date', 'startdate', 'eventdate'])
  const timeIndex = column(['time', 'starttime'])
  const descriptionIndex = column(['description', 'details', 'notes'])
  const typeIndex = column(['type', 'category'])
  const colorIndex = column(['color'])

  if (titleIndex < 0 || dateIndex < 0) {
    throw new Error('CSV must include title and date columns.')
  }

  const events: CalendarEvent[] = []
  const invalidRows: number[] = []
  lines.slice(1).forEach((line, rowIndex) => {
    const values = parseCsvLine(line)
    const title = values[titleIndex]?.trim().replace(/^\uFEFF/, '')
    const date = parseCalendarDate(values[dateIndex] ?? '')

    if (!title || !date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
      invalidRows.push(rowIndex + 2)
      return
    }

    events.push({
      id: `event-${Date.now()}-${rowIndex}`,
      title,
      date,
      time: timeIndex >= 0 ? values[timeIndex] || undefined : undefined,
      description: descriptionIndex >= 0 ? values[descriptionIndex] || undefined : undefined,
      type: typeIndex >= 0 ? values[typeIndex] || inferEventType(title) : inferEventType(title),
      color: colorIndex >= 0 && values[colorIndex] ? values[colorIndex] : EVENT_COLORS[events.length % EVENT_COLORS.length],
    })
  })

  return { events, invalidRows }
}

function getMonthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

export default function CalendarView() {
  const { calendarEvents, addCalendarEvents, removeCalendarEvent } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
  const [showGuide, setShowGuide] = useState(false)

  const monthDays = useMemo(() => getMonthDays(month), [month])
  const eventsByDate = useMemo(() => calendarEvents.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    groups[event.date] = [...(groups[event.date] ?? []), event]
    return groups
  }, {}), [calendarEvents])
  const selectedEvents = eventsByDate[selectedDate] ?? []
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const moveMonth = (offset: number) => {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  const handleFile = async (file: File) => {
    try {
      const parsed = parseCsv(await file.text())
      if (parsed.events.length === 0) {
        toast.error('No valid events found in this CSV.')
        return
      }
      addCalendarEvents(parsed.events)
      toast.success(`${parsed.events.length} event${parsed.events.length === 1 ? '' : 's'} imported${parsed.invalidRows.length ? ` · ${parsed.invalidRows.length} skipped` : ''}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not read this CSV.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csv = [
      'title,date,time,description,type,color',
      'Physics revision,2026-08-10,18:00,Revise electrostatics,Revision,#3b82f6',
      'Weekly test,2026-08-15,10:00,Full syllabus practice,Test,#ffaa00',
    ].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'jee-calendar-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="PLAN YOUR PREP"
        title="Calendar"
        description="Keep tests, revisions, and study milestones in one place."
        actions={(
          <div className="page-actions">
          <button className="btn-ghost" onClick={downloadTemplate}><Download size={14} /> Template</button>
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import CSV</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={event => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
            }}
          />
          </div>
        )}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-ghost" aria-label="Previous month" onClick={() => moveMonth(-1)} style={{ padding: 7 }}><ChevronLeft size={16} /></button>
            <h2 style={{ fontSize: 18, fontWeight: 800, minWidth: 170 }}>{monthLabel}</h2>
            <button className="btn-ghost" aria-label="Next month" onClick={() => moveMonth(1)} style={{ padding: 7 }}><ChevronRight size={16} /></button>
            <button className="btn-ghost" onClick={() => { const today = new Date(); setMonth(today); setSelectedDate(toDateKey(today)) }} style={{ padding: '6px 10px', fontSize: 11 }}>Today</button>
          </div>
          <button className="btn-ghost" onClick={() => setShowGuide(value => !value)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <Info size={13} /> CSV format
          </button>
        </div>

        {showGuide && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 12px', marginBottom: 16, borderRadius: 8, background: '#3b82f610', border: '1px solid #3b82f630', color: 'var(--text-secondary)', fontSize: 12 }}>
            <FileUp size={15} color="var(--blue)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Required columns: <strong style={{ color: 'var(--text-primary)' }}>title</strong> and <strong style={{ color: 'var(--text-primary)' }}>date</strong>. Calendar exports such as <strong style={{ color: 'var(--text-primary)' }}>Subject, Start Date, All Day Event</strong> and dates like <strong style={{ color: 'var(--text-primary)' }}>04/27/2026</strong> are supported. Optional columns: time, description, type, and color.</span>
            <button onClick={() => setShowGuide(false)} aria-label="Close CSV format guide" style={{ marginLeft: 'auto', color: 'var(--text-muted)', background: 'none', border: 0, cursor: 'pointer' }}><X size={14} /></button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
          {WEEKDAYS.map(day => (
            <div key={day} style={{ padding: '9px 10px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{day}</div>
          ))}
          {monthDays.map(day => {
            const dateKey = toDateKey(day)
            const dayEvents = eventsByDate[dateKey] ?? []
            const isCurrentMonth = day.getMonth() === month.getMonth()
            const isToday = dateKey === toDateKey(new Date())
            const isSelected = dateKey === selectedDate
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                style={{
                  textAlign: 'left', minHeight: 104, padding: 9, background: isSelected ? '#39ff1408' : 'var(--bg-card)',
                  border: 0, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', color: isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                  outline: isSelected ? '1px solid var(--neon)' : 'none', outlineOffset: -1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 23, height: 23, borderRadius: '50%', background: isToday ? 'var(--neon)' : 'transparent', color: isToday ? '#000' : 'inherit', fontSize: 11, fontWeight: 700 }}>{day.getDate()}</span>
                  {dayEvents.length > 0 && <span style={{ fontSize: 9, color: 'var(--neon)' }}>{dayEvents.length}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} title={event.title} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: `2px solid ${event.color || 'var(--neon)'}`, paddingLeft: 5, fontSize: 10, color: isCurrentMonth ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                      {event.time && <span style={{ color: event.color || 'var(--neon)', marginRight: 3 }}>{event.time}</span>}{event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div style={{ fontSize: 10, color: 'var(--neon)', paddingLeft: 7 }}>+{dayEvents.length - 3} more</div>}
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      <div className="card" style={{ marginTop: 16, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 13 }}>
          <div>
            <div className="section-title" style={{ color: 'var(--blue)', marginBottom: 3 }}>SELECTED DAY</div>
            <h2 style={{ fontSize: 16, fontWeight: 750 }}>{formatDate(selectedDate)}</h2>
          </div>
          <span className="badge badge-blue">{selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'}</span>
        </div>
        {selectedEvents.length === 0 ? (
          <div style={{ padding: '18px 0 5px', color: 'var(--text-muted)', fontSize: 12 }}>No events scheduled for this day.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedEvents.map(event => (
              <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: event.color || 'var(--neon)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 650 }}>{event.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{[event.time, event.type, event.description].filter(Boolean).join(' · ') || 'Calendar event'}</div>
                </div>
                <button onClick={() => { removeCalendarEvent(event.id); toast.success('Event removed.') }} aria-label={`Remove ${event.title}`} style={{ background: 'none', border: 0, color: 'var(--text-muted)', cursor: 'pointer', padding: 5 }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {calendarEvents.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 18 }}>
          <CalendarDays size={15} /> Import a CSV to start building your study calendar.
        </div>
      )}
    </PageShell>
  )
}