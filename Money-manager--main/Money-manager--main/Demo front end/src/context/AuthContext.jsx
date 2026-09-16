import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setAuthToken } from '../api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'money_manager_token'
const USER_KEY = 'money_manager_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    setAuthToken(token)
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    const handleUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = async (email, password) => {
    const res = await api.login({ email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setAuthToken(res.token)
    setUser(res.user)
    return res.user
  }

  const register = async (email, password, confirmPassword, name = '') => {
    const res = await api.register({ email, password, confirmPassword, name })
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setAuthToken(res.token)
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (_) {}
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
