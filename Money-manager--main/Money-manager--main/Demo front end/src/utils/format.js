/**
 * Format money with Indian Rupee symbol (₹).
 */
export function formatRupees(num) {
  if (num == null || num === '') return '₹0.00'
  const n = Number(num)
  if (Number.isNaN(n)) return '₹0.00'
  return '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

/**
 * Parse API date string (IST). Backend sends with +05:30; if missing, treat as IST.
 */
function parseApiDateTime(str) {
  if (str == null || str === '') return null
  let s = String(str).trim()
  if (!/Z|[+-]\d{2}:?\d{2}$/.test(s)) s = s.replace(/\.\d{3}$/, '') + '+05:30'
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Display in IST (Asia/Kolkata) everywhere. */
const IST_OPTIONS = { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }

/**
 * Same date-time format everywhere (Add form, Dashboard, History). Always shows IST.
 */
export function formatDateTime(dateOrString) {
  if (dateOrString == null) return ''
  const d = typeof dateOrString === 'string' ? parseApiDateTime(dateOrString) : dateOrString
  if (d == null || (d instanceof Date && Number.isNaN(d.getTime()))) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleString('en-IN', IST_OPTIONS)
}

const pad = (n) => String(n).padStart(2, '0')

/**
 * Return local date-time as "YYYY-MM-DDTHH:mm:ss" (no Z) so the backend stores
 * the same calendar date/time the user sees. Avoids "one day before" bug when
 * using toISOString() (UTC) with LocalDateTime on the backend.
 */
export function toLocalISOString(dateOrNow) {
  const d = dateOrNow instanceof Date ? dateOrNow : new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = d.getHours()
  const min = d.getMinutes()
  const sec = d.getSeconds()
  return `${y}-${pad(m)}-${pad(day)}T${pad(h)}:${pad(min)}:${pad(sec)}`
}
