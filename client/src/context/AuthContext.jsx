import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [activeRole, setActiveRole] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  const applyTokens = (data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    setRoles(data.roles)
    setActiveRole(data.active_role)
  }

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    applyTokens(data)
    return data
  }

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      if (refresh) await authService.logout(refresh)
    } finally {
      localStorage.clear()
      setUser(null)
      setActiveRole(null)
      setRoles([])
    }
  }, [])

  const switchRole = async (role) => {
    const { data } = await authService.switchRole(role)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setActiveRole(data.active_role)
  }

  useEffect(() => {
    const access = localStorage.getItem('access_token')
    if (!access) {
      setLoading(false)
      return
    }
    authService
      .me()
      .then(({ data }) => {
        setUser(data)
        setRoles(data.roles)
        setActiveRole(data.active_role)
      })
      .catch(() => {
        localStorage.clear()
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, activeRole, roles, loading, login, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
