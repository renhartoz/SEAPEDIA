import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Waves, CheckCircle2 } from 'lucide-react'

const AVAILABLE_ROLES = [
  { id: 'buyer', label: 'Buyer', desc: 'Shop and checkout' },
  { id: 'seller', label: 'Seller', desc: 'Open a store and sell' },
  { id: 'driver', label: 'Driver', desc: 'Take delivery jobs' },
]

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    roles: ['buyer'],
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const toggleRole = (roleId) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(roleId)
        ? prev.roles.filter((r) => r !== roleId)
        : [...prev.roles, roleId]
      return { ...prev, roles }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.roles.length === 0) {
      toast.error('Please select at least one role.')
      return
    }
    setLoading(true)
    try {
      await authService.register(formData)
      const data = await login({ username: formData.username, password: formData.password })
      toast.success('Registration successful!')
      if (data.roles.length > 1) {
        navigate('/role-select', { replace: true })
      } else {
        const dashboards = {
          buyer: '/buyer',
          seller: '/seller',
          driver: '/driver',
          admin: '/admin',
        }
        navigate(dashboards[data.active_role] || '/', { replace: true })
      }
    } catch (err) {
      const details = err.response?.data?.error?.details
      if (details) {
        const msg = Object.values(details)[0]?.[0] || 'Registration failed'
        toast.error(msg)
      } else {
        toast.error('Registration failed. Please check your inputs.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-(--color-surface-sunken)">
      <Card className="w-full max-w-lg" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        <CardHeader className="space-y-3 text-center pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-sea-500 flex items-center justify-center shadow-md">
              <Waves className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Join SEAPEDIA</CardTitle>
          <CardDescription>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
              Sign in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div className="pt-2">
              <Label className="mb-3 block">I want to be a (select all that apply):</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AVAILABLE_ROLES.map(({ id, label, desc }) => {
                  const selected = formData.roles.includes(id)
                  return (
                    <div
                      key={id}
                      onClick={() => toggleRole(id)}
                      className={`relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-(--color-border) bg-white hover:border-brand-200'
                      }`}
                    >
                      {selected && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-brand-600" />
                      )}
                      <span className={`font-semibold text-sm ${selected ? 'text-brand-900' : ''}`}>
                        {label}
                      </span>
                      <span className="text-xs text-(--color-text-muted) mt-1 leading-tight">
                        {desc}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base mt-4"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
