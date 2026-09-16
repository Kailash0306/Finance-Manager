import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Please enter email and password.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }
    setSubmitting(true)
    try {
      await register(email.trim(), password, confirmPassword, name.trim())
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.body?.error || (typeof err.body === 'object' && err.body && Object.values(err.body)[0]) || err.message
      setError(msg || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-200 mb-2 text-center">Money Manager</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Create your account</p>
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-surface border border-border rounded-card"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-card text-red-400 text-sm">
              {error}
            </div>
          )}
          <label className="block mb-4">
            <span className="block text-sm text-gray-400 mb-1.5">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2.5 bg-bg border border-border rounded-card text-gray-200"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-sm text-gray-400 mb-1.5">Password (min 6 characters)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2.5 bg-bg border border-border rounded-card text-gray-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-sm text-gray-400 mb-1.5">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-3 py-2.5 bg-bg border border-border rounded-card text-gray-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>
          <label className="block mb-6">
            <span className="block text-sm text-gray-400 mb-1.5">Name (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2.5 bg-bg border border-border rounded-card text-gray-200"
              placeholder="Your name"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-card font-semibold bg-accent text-bg border-0 cursor-pointer disabled:opacity-60 hover:bg-accent-dim"
          >
            {submitting ? 'Creating account…' : 'Register'}
          </button>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accent no-underline hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
