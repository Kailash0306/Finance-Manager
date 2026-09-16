import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { formatDateTime, toLocalISOString } from '../utils/format'

export default function AddTransaction() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [divisions, setDivisions] = useState([])
  const [types, setTypes] = useState([])
  const [suggestedCategories, setSuggestedCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    description: '',
    category: '',
    division: 'PERSONAL',
  })
  const [existingDateTime, setExistingDateTime] = useState(null)
  const [editable, setEditable] = useState(true)

  useEffect(() => {
    api.getDivisions().then(setDivisions).catch(() => {})
    api.getTransactionTypes().then(setTypes).catch(() => {})
    api.getSuggestedCategories().then(setSuggestedCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      api.getTransaction(id).then((t) => {
        setEditable(t.editable !== false)
        setForm({
          type: t.type || 'EXPENSE',
          amount: String(t.amount ?? ''),
          description: t.description || '',
          category: t.category || '',
          division: t.division || 'PERSONAL',
        })
        setExistingDateTime(t.dateTime || null)
      }).catch((e) => setError(e.message))
    } else {
      setEditable(true)
    }
  }, [isEdit, id])

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (e && e.stopPropagation) e.stopPropagation()
    setError(null)
    if (isEdit && !editable) {
      setError('Editing is only allowed within 12 hours of creation.')
      return
    }
    const amount = parseFloat(form.amount)
    if (!form.description?.trim() || !form.category?.trim() || !(amount > 0)) {
      setError('Please fill description, category, and a positive amount.')
      return
    }
    setLoading(true)
    const dateTime = isEdit && existingDateTime
      ? toLocalISOString(new Date(existingDateTime))
      : toLocalISOString(new Date())
    const payload = {
      type: form.type,
      amount,
      dateTime,
      description: form.description.trim(),
      category: form.category.trim(),
      division: form.division,
    }
    const promise = isEdit ? api.updateTransaction(id, payload) : api.createTransaction(payload)
    promise
      .then(() => navigate('/'))
      .catch((e) => { setError(e.message); setLoading(false) })
  }

  const inputClass = 'block w-full mt-1.5 px-3 py-2.5 bg-bg border border-border rounded-card text-gray-200'
  const labelClass = 'block mb-4 text-sm text-gray-400'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold m-0">{isEdit ? 'Edit transaction' : 'Add transaction'}</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-card text-red-400">
          <p className="font-medium m-0">Error: {error}</p>
        </div>
      )}

      {isEdit && !editable && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500 rounded-card text-amber-200">
          <p className="font-medium m-0">Editing is only allowed within 12 hours of creation. This transaction can no longer be edited.</p>
        </div>
      )}

      <form className="max-w-md p-6 bg-surface border border-border rounded-card" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} noValidate>
        <label className={labelClass}>
          Type
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            required
            className={inputClass}
          >
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Amount (₹)
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Date & time
          <input
            type="text"
            readOnly
            value={isEdit && existingDateTime
              ? formatDateTime(existingDateTime)
              : formatDateTime(new Date())}
            className={`${inputClass} cursor-not-allowed bg-surface-hover`}
            title="Set automatically from your local time"
          />
          <span className="block text-gray-500 text-xs mt-1">(set automatically from your local time)</span>
        </label>
        <label className={labelClass}>
          Description
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            required
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Category
          <input
            type="text"
            list="categories"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
            className={inputClass}
          />
          <datalist id="categories">
            {suggestedCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <label className={labelClass}>
          Division
          <select
            value={form.division}
            onChange={(e) => setForm((f) => ({ ...f, division: e.target.value }))}
            className={inputClass}
          >
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-card font-semibold text-sm bg-surface-hover text-gray-200 border border-border hover:bg-border"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-card font-semibold text-sm bg-accent text-bg border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || (isEdit && !editable)}
            onClick={() => handleSubmit()}
          >
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}
