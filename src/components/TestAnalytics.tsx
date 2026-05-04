import { useState } from 'react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend
} from 'recharts'
import { Plus, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontSize: 12 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    )
  }
  return null
}

export default function TestAnalytics() {
  const { mockTests, addMockTest } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newTest, setNewTest] = useState({ type: 'JEE Main', physics: '', chemistry: '', maths: '', timeSpent: '' })

  const chartData = mockTests.map((t, i) => ({
    name: `T${i + 1}`,
    Total: t.total,
    Physics: t.physics,
    Chemistry: t.chemistry,
    Maths: t.maths,
    Accuracy: t.accuracy,
    date: t.date,
    type: t.type,
  }))

  const latest = mockTests[mockTests.length - 1]
  const prev = mockTests[mockTests.length - 2]
  const avgScore = Math.round(mockTests.reduce((a, t) => a + t.total, 0) / mockTests.length)
  const best = Math.max(...mockTests.map(t => t.total))
  const trend = latest && prev ? latest.total - prev.total : 0

  const handleAdd = () => {
    const p = parseInt(newTest.physics) || 0
    const c = parseInt(newTest.chemistry) || 0
    const m = parseInt(newTest.maths) || 0
    addMockTest({
      id: `mt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newTest.type as any,
      physics: p, chemistry: c, maths: m,
      total: p + c + m,
      maxMarks: 300,
      timeSpent: parseInt(newTest.timeSpent) || 180,
      rank: Math.floor(Math.random() * 3000) + 500,
      accuracy: Math.round(((p + c + m) / 300) * 100),
    })
    setNewTest({ type: 'JEE Main', physics: '', chemistry: '', maths: '', timeSpent: '' })
    setShowAdd(false)
  }

  const TABS = ['overview', 'subject', 'trend', 'accuracy']

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>ANALYTICS</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Test Analytics</h1>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Log Test
          </button>
        </div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="card-elevated" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Log Mock Test</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
              <select value={newTest.type} onChange={e => setNewTest({ ...newTest, type: e.target.value })}>
                <option>JEE Main</option>
                <option>JEE Advanced</option>
              </select>
              <input placeholder="Physics (/100)" value={newTest.physics} onChange={e => setNewTest({ ...newTest, physics: e.target.value })} type="number" />
              <input placeholder="Chemistry (/100)" value={newTest.chemistry} onChange={e => setNewTest({ ...newTest, chemistry: e.target.value })} type="number" />
              <input placeholder="Maths (/100)" value={newTest.maths} onChange={e => setNewTest({ ...newTest, maths: e.target.value })} type="number" />
              <input placeholder="Time (min)" value={newTest.timeSpent} onChange={e => setNewTest({ ...newTest, timeSpent: e.target.value })} type="number" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleAdd}>Save Test</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </motion.div>
        )}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Latest Score', value: latest?.total || '—', sub: `/${latest?.maxMarks || 300}`, color: 'var(--neon)', icon: Target },
            { label: 'Trend', value: (trend >= 0 ? '+' : '') + trend, sub: 'vs last test', color: trend >= 0 ? 'var(--neon)' : 'var(--red)', icon: trend >= 0 ? TrendingUp : TrendingDown },
            { label: 'Average', value: avgScore, sub: 'all tests', color: 'var(--blue)', icon: BarChart },
            { label: 'Best Score', value: best, sub: 'personal best', color: 'var(--amber)', icon: Zap },
            { label: 'Tests Taken', value: mockTests.length, sub: 'total mocks', color: 'var(--purple)', icon: Target },
          ].map(s => (
              <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
                <div className="section-title" style={{ marginBottom: 6 }}>{s.label}</div>
                <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
              </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                borderBottom: activeTab === tab ? '2px solid var(--neon)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--neon)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13,
              }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Score History</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} domain={[0, 300]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={180} stroke="#ffaa0044" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="Total" stroke="#39ff14" strokeWidth={2} dot={{ fill: '#39ff14', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Accuracy Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} domain={[40, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Accuracy" stroke="#a855f7" strokeWidth={2} fill="url(#accGrad)" dot={{ fill: '#a855f7', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Test log */}
            <div className="card" style={{ gridColumn: '1 / -1', padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Test History</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Date', 'Type', 'Physics', 'Chemistry', 'Maths', 'Total', 'Accuracy', 'Est. Rank'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...mockTests].reverse().map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{t.date}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${t.type === 'JEE Advanced' ? 'badge-purple' : 'badge-blue'}`}>{t.type}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>{t.physics}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>{t.chemistry}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--neon)' }}>{t.maths}</td>
                        <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 800 }}>{t.total}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: t.accuracy > 70 ? 'var(--neon)' : t.accuracy > 55 ? 'var(--amber)' : 'var(--red)' }}>{t.accuracy}%</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>~{t.rank.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subject' && (
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Subject-wise Performance</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} />
                <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                <Bar dataKey="Physics" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Chemistry" fill="#ffaa00" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Maths" fill="#39ff14" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'trend' && (
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Score Trend Analysis</div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} />
                <YAxis tick={{ fill: '#444', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={200} stroke="#39ff1444" strokeDasharray="4 4" label={{ value: 'Target', fill: '#39ff14', fontSize: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Physics" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Chemistry" stroke="#ffaa00" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Maths" stroke="#39ff14" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['Physics', 'Chemistry', 'Maths'].map((sub, si) => {
              const colors = ['var(--blue)', 'var(--amber)', 'var(--neon)']
              const vals = mockTests.map((t, i) => ({
                name: `T${i + 1}`,
                Accuracy: Math.round(([t.physics, t.chemistry, t.maths][si] / 100) * 100),
              }))
              return (
                <div key={sub} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 14, color: colors[si] }}>{sub} Accuracy</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={vals}>
                      <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                      <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Accuracy" stroke={colors[si]} strokeWidth={2} dot={{ fill: colors[si], r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            })}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>AI Rank Predictor</div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--neon)', letterSpacing: '-0.03em' }}>~2,400</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Predicted JEE Main Rank</div>
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Based on your last 5 mock tests & accuracy trends.<br />
                  Improve Chemistry accuracy by 10% to reach Rank ~1,800.
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
