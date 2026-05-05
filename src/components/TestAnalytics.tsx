import { useState } from 'react'
import { useStore } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend,
} from 'recharts'
import { Plus, TrendingUp, TrendingDown, Target, Zap, BookOpen, ChevronDown } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontSize: 12 }}>{p.name}: {p.value}{p.name === 'Score%' ? '%' : ''}</div>
        ))}
      </div>
    )
  }
  return null
}

const EMPTY_MOCK  = { type: 'JEE Main', physics: '', chemistry: '', maths: '', timeSpent: '' }
const EMPTY_MINOR = { name: '', maxMarks: '100', physics: '', chemistry: '', maths: '' }

type LogMode = 'mock' | 'minor'

export default function TestAnalytics() {
  const { mockTests, addMockTest, minorTests, addMinorTest } = useStore()

  const [showAdd,  setShowAdd]  = useState(false)
  const [logMode,  setLogMode]  = useState<LogMode>('mock')
  const [activeTab, setActiveTab] = useState('overview')
  const [newMock,  setNewMock]  = useState(EMPTY_MOCK)
  const [newMinor, setNewMinor] = useState(EMPTY_MINOR)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // ── Mock test helpers ─────────────────────────────────────────────────────
  const handleAddMock = () => {
    const p = parseInt(newMock.physics)  || 0
    const c = parseInt(newMock.chemistry)|| 0
    const m = parseInt(newMock.maths)    || 0
    addMockTest({
      id: `mt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newMock.type as any,
      physics: p, chemistry: c, maths: m,
      total: p + c + m,
      maxMarks: 300,
      timeSpent: parseInt(newMock.timeSpent) || 180,
      rank: 0,
      accuracy: Math.round(((p + c + m) / 300) * 100),
    })
    setNewMock(EMPTY_MOCK)
    setShowAdd(false)
  }

  // ── Minor test helpers ────────────────────────────────────────────────────
  const handleAddMinor = () => {
    const max = parseInt(newMinor.maxMarks) || 100
    const p   = parseInt(newMinor.physics)  || 0
    const c   = parseInt(newMinor.chemistry)|| 0
    const m   = parseInt(newMinor.maths)    || 0
    const total = p + c + m
    addMinorTest({
      id: `wt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      name: newMinor.name.trim() || `Weekly Test ${minorTests.length + 1}`,
      physics: p, chemistry: c, maths: m,
      total,
      maxMarks: max,
      accuracy: Math.round((total / max) * 100),
    })
    setNewMinor(EMPTY_MINOR)
    setShowAdd(false)
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const latest  = mockTests[mockTests.length - 1]
  const prev    = mockTests[mockTests.length - 2]
  const trend   = latest && prev ? latest.total - prev.total : 0
  const avgScore= mockTests.length ? Math.round(mockTests.reduce((a, t) => a + t.total, 0) / mockTests.length) : 0
  const best    = mockTests.length ? Math.max(...mockTests.map(t => t.total)) : 0

  const latestMinor  = minorTests[minorTests.length - 1]
  const prevMinor    = minorTests[minorTests.length - 2]
  const minorTrend   = latestMinor && prevMinor ? latestMinor.accuracy - prevMinor.accuracy : 0
  const avgMinorPct  = minorTests.length
    ? Math.round(minorTests.reduce((a, t) => a + t.accuracy, 0) / minorTests.length) : 0
  const bestMinorPct = minorTests.length ? Math.max(...minorTests.map(t => t.accuracy)) : 0

  // ── Chart data ──────────────────────────────────────────────────────────
  const mockChartData = mockTests.map((t, i) => ({
    name: `T${i + 1}`, Total: t.total,
    Physics: t.physics, Chemistry: t.chemistry, Maths: t.maths,
    Accuracy: t.accuracy, date: t.date, type: t.type,
  }))

  const minorChartData = minorTests.map((t, i) => ({
    name: `W${i + 1}`,
    'Score%': t.accuracy,
    Physics: t.physics, Chemistry: t.chemistry, Maths: t.maths,
    Total: t.total, Max: t.maxMarks,
    label: t.name, date: t.date,
  }))

  const TABS = ['overview', 'weekly', 'subject', 'trend']

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>ANALYTICS</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Test Analytics</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="./logo2.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 8px #39ff1466)', opacity: 0.8 }} />
            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Log Test
            </button>
          </div>
        </div>

        {/* Log form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="card-elevated" style={{ padding: 20, marginBottom: 20 }}>

              {/* Mode switcher */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['mock', 'minor'] as LogMode[]).map(m => (
                  <button key={m} onClick={() => setLogMode(m)}
                    style={{
                      padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                      background: logMode === m ? (m === 'mock' ? 'var(--neon)' : 'var(--amber)') : 'var(--bg-elevated)',
                      color: logMode === m ? '#000' : 'var(--text-muted)', transition: 'all 0.15s',
                    }}>
                    {m === 'mock' ? 'Mock Test (JEE)' : 'Weekly / Minor Test'}
                  </button>
                ))}
              </div>

              {logMode === 'mock' ? (
                <>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Max marks: 300 (Physics 100 · Chemistry 100 · Maths 100)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
                    <select value={newMock.type} onChange={e => setNewMock({ ...newMock, type: e.target.value })}>
                      <option>JEE Main</option>
                      <option>JEE Advanced</option>
                    </select>
                    <input placeholder="Physics score" value={newMock.physics}
                      onChange={e => setNewMock({ ...newMock, physics: e.target.value })} type="number" min={0} max={100} />
                    <input placeholder="Chemistry score" value={newMock.chemistry}
                      onChange={e => setNewMock({ ...newMock, chemistry: e.target.value })} type="number" min={0} max={100} />
                    <input placeholder="Maths score" value={newMock.maths}
                      onChange={e => setNewMock({ ...newMock, maths: e.target.value })} type="number" min={0} max={100} />
                    <input placeholder="Time (min)" value={newMock.timeSpent}
                      onChange={e => setNewMock({ ...newMock, timeSpent: e.target.value })} type="number" />
                  </div>
                  {(newMock.physics || newMock.chemistry || newMock.maths) && (
                    <div style={{ fontSize: 12, color: 'var(--neon)', marginBottom: 12, fontWeight: 700 }}>
                      Total: {(parseInt(newMock.physics) || 0) + (parseInt(newMock.chemistry) || 0) + (parseInt(newMock.maths) || 0)} / 300
                      &nbsp;·&nbsp;{Math.round(((parseInt(newMock.physics) || 0) + (parseInt(newMock.chemistry) || 0) + (parseInt(newMock.maths) || 0)) / 3)}% accuracy
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={handleAddMock}>Save Mock</button>
                    <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Set your own total marks — great for school tests, coaching tests, chapter tests, etc.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <input placeholder="Test name (e.g. Unit Test 1)" value={newMinor.name}
                      onChange={e => setNewMinor({ ...newMinor, name: e.target.value })} />
                    <input placeholder="Max marks" value={newMinor.maxMarks}
                      onChange={e => setNewMinor({ ...newMinor, maxMarks: e.target.value })} type="number" min={1} />
                    <input placeholder="Physics" value={newMinor.physics}
                      onChange={e => setNewMinor({ ...newMinor, physics: e.target.value })} type="number" min={0} />
                    <input placeholder="Chemistry" value={newMinor.chemistry}
                      onChange={e => setNewMinor({ ...newMinor, chemistry: e.target.value })} type="number" min={0} />
                    <input placeholder="Maths" value={newMinor.maths}
                      onChange={e => setNewMinor({ ...newMinor, maths: e.target.value })} type="number" min={0} />
                  </div>
                  {(newMinor.physics || newMinor.chemistry || newMinor.maths) && (() => {
                    const max = parseInt(newMinor.maxMarks) || 100
                    const total = (parseInt(newMinor.physics) || 0) + (parseInt(newMinor.chemistry) || 0) + (parseInt(newMinor.maths) || 0)
                    const pct = Math.round((total / max) * 100)
                    return (
                      <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 12, fontWeight: 700 }}>
                        Total: {total} / {max} &nbsp;·&nbsp; {pct}% score
                        <span style={{
                          marginLeft: 10, padding: '2px 8px', borderRadius: 999, fontSize: 11,
                          background: pct >= 75 ? '#39ff1420' : pct >= 50 ? '#ffaa0020' : '#ff444420',
                          color: pct >= 75 ? 'var(--neon)' : pct >= 50 ? 'var(--amber)' : 'var(--red)',
                        }}>{pct >= 75 ? 'Good' : pct >= 50 ? 'Average' : 'Needs Work'}</span>
                      </div>
                    )
                  })()}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" style={{ background: 'var(--amber)', color: '#000', boxShadow: '0 0 12px #ffaa0044' }}
                      onClick={handleAddMinor}>Save Test</button>
                    <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── KPI cards — split into mock / minor ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Mock KPIs */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
              MOCK TESTS (JEE) · {mockTests.length} logged
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Latest',   value: latest ? `${latest.total}/300` : '—',      color: 'var(--neon)' },
                { label: 'Trend',    value: mockTests.length >= 2 ? `${trend >= 0 ? '+' : ''}${trend}` : '—', color: trend >= 0 ? 'var(--neon)' : 'var(--red)' },
                { label: 'Average',  value: mockTests.length ? avgScore : '—',          color: 'var(--blue)' },
                { label: 'Best',     value: mockTests.length ? best : '—',              color: 'var(--amber)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="section-title" style={{ marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Minor KPIs */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
              WEEKLY / MINOR TESTS · {minorTests.length} logged
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Latest %',  value: latestMinor ? `${latestMinor.accuracy}%`  : '—', color: 'var(--amber)' },
                { label: 'Trend',     value: minorTests.length >= 2 ? `${minorTrend >= 0 ? '+' : ''}${minorTrend}%` : '—', color: minorTrend >= 0 ? 'var(--neon)' : 'var(--red)' },
                { label: 'Avg Score', value: minorTests.length ? `${avgMinorPct}%` : '—', color: 'var(--blue)' },
                { label: 'Best %',    value: minorTests.length ? `${bestMinorPct}%` : '—', color: 'var(--purple)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="section-title" style={{ marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                borderBottom: activeTab === tab ? '2px solid var(--neon)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--neon)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13,
              }}>
              {tab === 'weekly' ? 'Weekly Tests' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Mock score line chart */}
              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Mock Test Scores</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Total score out of 300</div>
                {mockChartData.length < 1 ? (
                  <EmptyChart label="No mock tests yet" sub="Log a JEE mock to see your trend" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                      <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} domain={[0, 300]} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={180} stroke="#ffaa0044" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="Total" stroke="#39ff14" strokeWidth={2} dot={{ fill: '#39ff14', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Minor score area chart */}
              <div className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Weekly / Minor Test Scores</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>% score (normalised across custom max marks)</div>
                {minorChartData.length < 1 ? (
                  <EmptyChart label="No weekly tests yet" sub="Log a weekly/minor test to see your trend" amber />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={minorChartData}>
                      <defs>
                        <linearGradient id="minorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ffaa00" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ffaa00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                      <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={75} stroke="#39ff1444" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="Score%" stroke="#ffaa00" strokeWidth={2} fill="url(#minorGrad)" dot={{ fill: '#ffaa00', r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Combined history table */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Full Test History</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Date', 'Test', 'Physics', 'Chemistry', 'Maths', 'Total', 'Score %', ''].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...mockTests.map(t => ({ ...t, kind: 'mock' as const })),
                      ...minorTests.map(t => ({ ...t, kind: 'minor' as const, type: t.name, rank: undefined, timeSpent: undefined, accuracy: t.accuracy })),
                    ]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(t => {
                        const pct = t.kind === 'mock' ? t.accuracy : Math.round((t.total / t.maxMarks) * 100)
                        const pctColor = pct >= 75 ? 'var(--neon)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{t.date}</td>
                            <td style={{ padding: '10px 12px' }}>
                              {t.kind === 'mock' ? (
                                <span className={`badge ${(t as any).type === 'JEE Advanced' ? 'badge-purple' : 'badge-blue'}`}>{(t as any).type}</span>
                              ) : (
                                <span style={{
                                  padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                                  background: '#ffaa0015', color: 'var(--amber)', border: '1px solid #ffaa0030',
                                }}>{(t as any).type}</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{t.physics}</td>
                            <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>{t.chemistry}</td>
                            <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--neon)' }}>{t.maths}</td>
                            <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 800 }}>
                              {t.total}
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 3 }}>/{t.maxMarks}</span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                fontSize: 13, fontWeight: 700, color: pctColor,
                                background: pctColor + '15', padding: '2px 8px', borderRadius: 999,
                              }}>{pct}%</span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {t.kind === 'mock' && (t as any).timeSpent ? (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(t as any).timeSpent}m</span>
                              ) : null}
                            </td>
                          </tr>
                        )
                      })}
                    {mockTests.length === 0 && minorTests.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                          No tests logged yet. Click "Log Test" to add your first entry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── WEEKLY TESTS TAB ── */}
        {activeTab === 'weekly' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {minorTests.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                <BookOpen size={32} opacity={0.3} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, marginBottom: 6 }}>No weekly tests logged yet</div>
                <div style={{ fontSize: 12 }}>Click "Log Test" → "Weekly / Minor Test" to add your first entry.</div>
              </div>
            ) : (
              <>
                {/* Score % trend */}
                <div className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Score Trend</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Normalised % across all custom-mark tests</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={minorChartData}>
                      <defs>
                        <linearGradient id="minorGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ffaa00" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ffaa00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} interval={0} angle={-20} textAnchor="end" height={36} />
                      <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={75} stroke="#39ff1444" strokeDasharray="4 4" label={{ value: '75%', fill: '#39ff1488', fontSize: 9 }} />
                      <Area type="monotone" dataKey="Score%" stroke="#ffaa00" strokeWidth={2.5} fill="url(#minorGrad2)" dot={{ fill: '#ffaa00', r: 4 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Subject bar chart */}
                <div className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 14 }}>Subject Breakdown per Test</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={minorChartData}>
                      <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                      <Bar dataKey="Physics"   fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="Chemistry" fill="#ffaa00" radius={[3, 3, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="Maths"     fill="#39ff14" radius={[3, 3, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {[...minorTests].reverse().map(t => {
                    const pct = t.accuracy
                    const pctColor = pct >= 75 ? 'var(--neon)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'
                    const open = expandedRow === t.id
                    return (
                      <div key={t.id} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }}
                        onClick={() => setExpandedRow(open ? null : t.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.date}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 15, fontWeight: 900, color: pctColor,
                              background: pctColor + '18', padding: '3px 10px', borderRadius: 999,
                            }}>{pct}%</span>
                            <ChevronDown size={14} color="var(--text-muted)"
                              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>

                        <div style={{ marginTop: 10, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pctColor, borderRadius: 3, transition: 'width 0.4s' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{t.total} / {t.maxMarks} marks</div>

                        <AnimatePresence>
                          {open && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                {[
                                  { label: 'Physics',   val: t.physics,   color: 'var(--blue)' },
                                  { label: 'Chemistry', val: t.chemistry, color: 'var(--amber)' },
                                  { label: 'Maths',     val: t.maths,     color: 'var(--neon)' },
                                ].map(s => (
                                  <div key={s.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
                                    <div className="section-title" style={{ marginTop: 2 }}>{s.label}</div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SUBJECT TAB ── */}
        {activeTab === 'subject' && (
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Subject-wise Performance (Mock Tests)</div>
            {mockChartData.length === 0 ? (
              <EmptyChart label="No mock tests yet" sub="Log a mock test to see subject breakdown" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockChartData}>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                  <Bar dataKey="Physics"   fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Chemistry" fill="#ffaa00" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="Maths"     fill="#39ff14" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* ── TREND TAB ── */}
        {activeTab === 'trend' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Subject Score Trend (Mocks)</div>
              {mockChartData.length === 0 ? (
                <EmptyChart label="No mock tests yet" sub="Log a mock test to see subject trends" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Physics"   stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Chemistry" stroke="#ffaa00" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Maths"     stroke="#39ff14" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Weekly Test % Trend</div>
              {minorChartData.length === 0 ? (
                <EmptyChart label="No weekly tests yet" sub="Log weekly tests to see their trend" amber />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={minorChartData}>
                    <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#444', fontSize: 10 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke="#39ff1444" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="Score%" stroke="#ffaa00" strokeWidth={2.5} dot={{ fill: '#ffaa00', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}

function EmptyChart({ label, sub, amber }: { label: string; sub: string; amber?: boolean }) {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 6 }}>
      <Target size={28} opacity={0.25} color={amber ? 'var(--amber)' : 'var(--neon)'} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 11 }}>{sub}</span>
    </div>
  )
}
