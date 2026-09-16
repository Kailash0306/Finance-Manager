/**
 * Frontend API client – must match backend controllers exactly.
 * Backend: Spring Boot on http://localhost:8081 (see application.properties server.port=8081)
 */

const BACKEND_BASE = 'http://localhost:8081'

let authToken = null
export function setAuthToken(token) {
  authToken = token
}

async function request(path, options = {}) {
  const url = `${BACKEND_BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  }
  let res
  try {
    res = await fetch(url, { ...options, headers })
  } catch (e) {
    const msg = e.message === 'Failed to fetch'
      ? `Cannot reach backend at ${BACKEND_BASE}. Is the Spring Boot app running?`
      : e.message
    throw new Error(msg)
  }
  if (!res.ok) {
    if (res.status === 401) {
      authToken = null
      try {
        localStorage.removeItem('money_manager_token')
        localStorage.removeItem('money_manager_user')
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    const err = new Error(res.statusText || 'Request failed')
    err.status = res.status
    try { err.body = await res.json() } catch (_) {}
    throw err
  }
  if (res.status === 204) return null
  const text = await res.text()
  if (!text || !text.trim()) return null
  try {
    return JSON.parse(text)
  } catch (_) {
    return null
  }
}

export const api = {
  // ─── Backend: TransactionController @RequestMapping("/api/transactions") ───
  getTransactions: (params = {}) => {
    const sp = new URLSearchParams()
    if (params.startDate) sp.set('startDate', params.startDate)
    if (params.endDate) sp.set('endDate', params.endDate)
    if (params.division) sp.set('division', params.division)
    if (params.category) sp.set('category', params.category)
    if (params.type) sp.set('type', params.type)
    const q = sp.toString()
    return request(`/api/transactions${q ? `?${q}` : ''}`)
  },
  getTransaction: (id) => request(`/api/transactions/${id}`),
  createTransaction: (body) => request('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id, body) => request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),

  // ─── Backend: DashboardController @RequestMapping("/api/dashboard") ───
  // GET /api/dashboard/summary, GET /api/dashboard/history
  getDashboardSummary: (period = 'monthly') => request(`/api/dashboard/summary?period=${encodeURIComponent(period)}`),
  getDashboardHistory: (limit = 50) => request(`/api/dashboard/history?limit=${limit}`),

  // ─── Backend: DivisionController @RequestMapping("/api/divisions") ───
  getDivisions: () => request('/api/divisions'),

  // ─── Backend: TransactionTypeController @RequestMapping("/api/transaction-types") ───
  getTransactionTypes: () => request('/api/transaction-types'),

  // ─── Backend: CategoryController @RequestMapping("/api/categories") ───
  // GET /api/categories, GET /api/categories/names, GET /api/categories/suggested
  getCategories: () => request('/api/categories'),
  getCategoryNames: () => request('/api/categories/names'),
  getSuggestedCategories: () => request('/api/categories/suggested'),

  // ─── Auth ───
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
}
