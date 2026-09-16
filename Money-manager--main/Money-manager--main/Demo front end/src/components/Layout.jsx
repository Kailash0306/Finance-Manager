import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between gap-8">
        <NavLink to="/" className="font-bold text-lg text-gray-200 hover:text-accent hover:no-underline">
          Money Manager
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-card font-medium ${isActive ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'} no-underline`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/add"
            className={({ isActive }) =>
              `px-3 py-2 rounded-card font-medium ${isActive ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'} no-underline`
            }
          >
            Add
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `px-3 py-2 rounded-card font-medium ${isActive ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'} no-underline`
            }
          >
            History
          </NavLink>
          <span className="ml-4 text-sm text-gray-400">{user?.email}</span>
          <button
            type="button"
            onClick={() => logout()}
            className="px-3 py-2 rounded-card text-sm text-gray-400 hover:text-gray-200 hover:bg-surface-hover"
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
