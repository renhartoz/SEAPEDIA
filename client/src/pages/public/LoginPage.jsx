import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Waves } from 'lucide-react'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login({ username, password })
      toast.success('Welcome back!')
      if (data.roles.length > 1 && data.roles.includes('admin') === false) {
        navigate('/role-select', { replace: true })
      } else {
        const dashboards = {
          buyer: '/buyer',
          seller: '/seller',
          driver: '/driver',
          admin: '/admin',
        }
        navigate(from === '/' ? dashboards[data.active_role] || '/' : from, { replace: true })
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-(--color-surface-sunken)">
      <Card className="w-full max-w-md" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        <CardHeader className="space-y-3 text-center pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sea-500 flex items-center justify-center shadow-md">
              <Waves className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to SEAPEDIA</CardTitle>
          <CardDescription>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
              Register here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
