import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatDateTime, formatRupees } from '../utils/format'

function toDateInputValue(d) {
  const date = d ? new Date(d) : new Date()
  return date.toISOString().slice(0, 10)
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [divisions, setDivisions] = useState([])
  const [types, setTypes] = useState([])
  const [suggestedCategories, setSuggestedCategories] = useState([])
  const [filters, setFilters] = useState({
    startDate: toDateInputValue(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
    endDate: toDateInputValue(new Date()),
    division: '',
    category: '',
    type: '',
  })

  const load = () => {
    setLoading(true)
    setError(null)
    const params = {}
    if (filters.startDate) params.startDate = filters.startDate + 'T00:00:00'
    if (filters.endDate) params.endDate = filters.endDate + 'T23:59:59'
    if (filters.division) params.division = filters.division
    if (filters.category) params.category = filters.category
    if (filters.type) params.type = filters.type
    api.getTransactions(params)
      .then(setTransactions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.getDivisions().then(setDivisions).catch(() => {})
    api.getTransactionTypes().then(setTypes).catch(() => {})
    api.getSuggestedCategories().then(setSuggestedCategories).catch(() => {})
  }, [])

  useEffect(() => { load() }, [filters.startDate, filters.endDate, filters.division, filters.category, filters.type])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-semibold m-0">Transaction history</h1>
        <Link to="/add" className="px-4 py-2 rounded-card font-semibold text-sm bg-accent text-bg no-underline hover:bg-accent-dim">
          Add income / expense
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-card text-red-400">
          <p className="font-medium m-0">Error: {error}</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-surface border border-border rounded-card flex flex-wrap gap-4 items-end">
        <label className="text-sm text-gray-400">
          From
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="block mt-1 px-3 py-2 bg-bg border border-border rounded-card text-gray-200 text-sm"
          />
        </label>
        <label className="text-sm text-gray-400">
          To
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="block mt-1 px-3 py-2 bg-bg border border-border rounded-card text-gray-200 text-sm"
          />
        </label>
        <label className="text-sm text-gray-400">
          Division
          <select
            value={filters.division}
            onChange={(e) => setFilters((f) => ({ ...f, division: e.target.value }))}
            className="block mt-1 px-3 py-2 bg-bg border border-border rounded-card text-gray-200 text-sm"
          >
            <option value="">All</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="text-sm text-gray-400">
          Category
          <input
            type="text"
            list="hist-categories"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            placeholder="All"
            className="block mt-1 px-3 py-2 bg-bg border border-border rounded-card text-gray-200 text-sm w-40"
          />
          <datalist id="hist-categories">
            {suggestedCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <label className="text-sm text-gray-400">
          Type
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="block mt-1 px-3 py-2 bg-bg border border-border rounded-card text-gray-200 text-sm"
          >
            <option value="">All</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={load}
          className="px-3 py-2 rounded-card text-sm bg-surface-hover text-gray-200 border border-border hover:bg-border"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-400">No transactions in this range. <Link to="/add">Add one</Link>.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Type</th>
                <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Date</th>
                <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Description</th>
                <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Category</th>
                <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Division</th>
                <th className="py-2 px-3 text-right text-gray-400 font-medium border-b border-border">Amount</th>
                <th className="py-2 px-3 text-left text-gray-400 font-medium border-b border-border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border hover:bg-surface-hover/50">
                  <td className="py-2 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        t.type === 'INCOME' ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-300">{formatDateTime(t.dateTime)}</td>
                  <td className="py-2 px-3 text-gray-200">{t.description || '—'}</td>
                  <td className="py-2 px-3 text-gray-300">{t.category || '—'}</td>
                  <td className="py-2 px-3 text-gray-300">{t.division || '—'}</td>
                  <td className={`py-2 px-3 text-right font-mono font-medium ${t.type === 'INCOME' ? 'text-income' : 'text-expense'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{t.amountDisplay ?? formatRupees(t.amount)}
                  </td>
                  <td className="py-2 px-3">
                    {t.editable ? (
                      <Link to={`/add/edit/${t.id}`} className="text-accent text-sm no-underline hover:underline">
                        Edit
                      </Link>
                    ) : (
                      <span
                        className="text-gray-500 text-sm cursor-not-allowed"
                        title="Editing is only allowed within 12 hours of creation"
                      >
                        Edit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
