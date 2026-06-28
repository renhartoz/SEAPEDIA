import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute({ children, role }) {
  const { user, activeRole, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="skeleton w-16 h-16 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && activeRole !== role) {
    return <Navigate to="/role-select" state={{ from: location }} replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, activeRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="skeleton w-16 h-16 rounded-full" />
      </div>
    )
  }

  if (user && activeRole) {
    const dashboards = {
      buyer: '/buyer',
      seller: '/seller',
      driver: '/driver',
      admin: '/admin',
    }
    return <Navigate to={dashboards[activeRole] || '/'} replace />
  }

  return children
}
