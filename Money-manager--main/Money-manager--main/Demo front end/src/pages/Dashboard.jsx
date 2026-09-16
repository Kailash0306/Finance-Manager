import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { api } from '../api'
import { formatDateTime, formatRupees } from '../utils/format'

/** Convert backend period label to readable form: weekly "2026-W04" → "13 Jan – 19 Jan 2026", monthly "2026-02" → "Feb 2026" */
function formatPeriodLabel(periodLabel, short = false) {
  if (!periodLabel) return periodLabel
  const s = String(periodLabel)
  const weekM = s.match(/^(\d{4})-W(\d{2})$/)
  if (weekM) {
    const year = parseInt(weekM[1], 10)
    const week = parseInt(weekM[2], 10)
    const jan4 = new Date(year, 0, 4)
    const dayOfWeek = jan4.getDay()
    const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek
    const mondayWeek1 = new Date(jan4)
    mondayWeek1.setDate(jan4.getDate() - isoDay + 1)
    const mondayThisWeek = new Date(mondayWeek1)
    mondayThisWeek.setDate(mondayWeek1.getDate() + (week - 1) * 7)
    const sundayThisWeek = new Date(mondayThisWeek)
    sundayThisWeek.setDate(mondayThisWeek.getDate() + 6)
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    if (short) return `${fmt(mondayThisWeek)} – ${fmt(sundayThisWeek)}`
    return `${fmt(mondayThisWeek)} – ${fmt(sundayThisWeek)} ${year}`
  }
  const monthM = s.match(/^(\d{4})-(\d{2})$/)
  if (monthM) {
    const d = new Date(parseInt(monthM[1], 10), parseInt(monthM[2], 10) - 1, 1)
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }
  return periodLabel
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [period, setPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    Promise.all([api.getDashboardSummary(period), api.getDashboardHistory(50)])
      .then(([sum, hist]) => { setSummary(sum); setHistory(hist || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([api.getDashboardSummary(period), api.getDashboardHistory(50)])
      .then(([sum, hist]) => {
        if (!cancelled) { setSummary(sum); setHistory(hist || []); }
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period])

  if (loading && !summary) return <div className="text-gray-400">Loading…</div>
  if (error) {
    const isBackendDown = error.includes('Cannot reach backend') || error.includes('Failed to fetch')
    return (
      <div className="max-w-md">
        <p className="text-red-500 mb-2">Error: {error}</p>
        {isBackendDown && (
          <p className="text-gray-400 text-sm mb-4">
            Start the Spring Boot app (Money Manager backend) on port 8081, then click Retry.
          </p>
        )}
        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 rounded-card font-medium bg-surface border border-border text-gray-200 hover:bg-surface-hover"
        >
          Retry
        </button>
      </div>
    )
  }

  const latest = summary?.summaries?.[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold m-0">Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-surface border border-border text-gray-200 px-3 py-2 rounded-card text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {latest && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4 mb-8">
          <div className="p-5 rounded-card bg-surface border border-border">
            <span className="block text-xs text-gray-400 mb-1">Income</span>
            <span className="text-xl font-semibold font-mono text-income">{latest.totalIncomeDisplay ?? formatRupees(latest.totalIncome)}</span>
          </div>
          <div className="p-5 rounded-card bg-surface border border-border">
            <span className="block text-xs text-gray-400 mb-1">Expense</span>
            <span className="text-xl font-semibold font-mono text-expense">{latest.totalExpenseDisplay ?? formatRupees(latest.totalExpense)}</span>
          </div>
          <div className="p-5 rounded-card bg-surface border border-border">
            <span className="block text-xs text-gray-400 mb-1">Balance</span>
            <span className="text-xl font-semibold font-mono text-gray-200">{latest.balanceDisplay ?? formatRupees(latest.balance)}</span>
          </div>
        </div>
      )}

      {summary?.summaries?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base text-gray-400 mb-3 m-0">Income vs expense by period</h2>
          <div className="h-64 md:h-80 w-full bg-surface border border-border rounded-card p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...(summary.summaries || [])].reverse()}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d35" />
                <XAxis dataKey="periodLabel" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => formatPeriodLabel(v, true)} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181d', border: '1px solid #2d2d35', borderRadius: 10 }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value, name) => [formatRupees(value), name]}
                  labelFormatter={(label) => `Period: ${formatPeriodLabel(label)}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="totalIncome" name="Income" fill="#00c896" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalExpense" name="Expense" fill="#ff6b7a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {summary?.summaries?.length > 1 && (
        <section className="mb-8">
          <h2 className="text-base text-gray-400 mb-3 m-0">By period</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Period</th>
                  <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Income</th>
                  <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Expense</th>
                  <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Balance</th>
                </tr>
              </thead>
              <tbody>
                {summary.summaries.map((s) => (
                  <tr key={s.periodLabel}>
                    <td className="py-2 px-3 border-b border-border">{formatPeriodLabel(s.periodLabel)}</td>
                    <td className="py-2 px-3 border-b border-border text-right font-mono text-income">{s.totalIncomeDisplay ?? formatRupees(s.totalIncome)}</td>
                    <td className="py-2 px-3 border-b border-border text-right font-mono text-expense">{s.totalExpenseDisplay ?? formatRupees(s.totalExpense)}</td>
                    <td className="py-2 px-3 border-b border-border text-right font-mono">{s.balanceDisplay ?? formatRupees(s.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base text-gray-400 m-0">Recent transactions</h2>
          <div className="flex gap-2">
            <Link to="/history" className="inline-block px-4 py-2 rounded-card font-semibold text-sm bg-surface-hover text-gray-200 border border-border hover:bg-border no-underline">
              View full history
            </Link>
            <Link to="/add" className="inline-block px-4 py-2 rounded-card font-semibold text-sm bg-accent text-bg hover:bg-accent-dim no-underline">
              Add income / expense
            </Link>
          </div>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-400">No income or expense yet. <Link to="/add">Add one</Link>.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.slice(0, 15).map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3 px-4 bg-surface rounded-card border border-border"
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    t.type === 'INCOME' ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'
                  }`}
                >
                  {t.type}
                </span>
                <span className="text-gray-200">{t.description || t.category}</span>
                <span className={`font-mono font-medium ${t.type === 'INCOME' ? 'text-income' : 'text-expense'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{t.amountDisplay ?? formatRupees(t.amount)}
                </span>
                <span className="text-gray-400 text-sm">{formatDateTime(t.dateTime)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
