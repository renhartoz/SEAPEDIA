import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Store, ShoppingBag, Truck, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const ROLE_INFO = {
  buyer: { icon: ShoppingBag, label: 'Buyer', desc: 'Shop and manage your cart', color: 'text-sea-500', bg: 'bg-sea-50' },
  seller: { icon: Store, label: 'Seller', desc: 'Manage your store and products', color: 'text-brand-600', bg: 'bg-brand-50' },
  driver: { icon: Truck, label: 'Driver', desc: 'Deliver orders and earn', color: 'text-success', bg: 'bg-green-50' },
  admin: { icon: ShieldCheck, label: 'Admin', desc: 'Manage the platform', color: 'text-danger', bg: 'bg-red-50' },
}

export function RoleSelectPage() {
  const { roles, switchRole } = useAuth()
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  const handleSelect = async (role) => {
    setLoading(role)
    try {
      await switchRole(role)
      const dashboards = {
        buyer: '/buyer',
        seller: '/seller',
        driver: '/driver',
        admin: '/admin',
      }
      navigate(from === '/' ? dashboards[role] || '/' : from, { replace: true })
    } catch (err) {
      toast.error('Failed to switch role.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-(--color-surface-sunken)">
      <Card className="w-full max-w-lg" style={{ boxShadow: 'var(--shadow-elevated)' }}>
        <CardHeader className="space-y-3 text-center pt-8 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Who are you right now?</CardTitle>
          <CardDescription>
            You have multiple roles. Select how you want to use SEAPEDIA in this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8 space-y-4">
          {roles.map((role) => {
            const info = ROLE_INFO[role] || ROLE_INFO.buyer
            const Icon = info.icon
            return (
              <Button
                key={role}
                variant="outline"
                disabled={loading !== null}
                onClick={() => handleSelect(role)}
                className="w-full h-auto p-4 flex items-center justify-start gap-4 border-(--color-border) hover:border-brand-300 hover:bg-(--color-surface-raised) transition-all"
              >
                <div className={`w-12 h-12 rounded-lg ${info.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-base text-(--color-text-primary)">{info.label}</p>
                  <p className="text-sm text-(--color-text-muted) font-normal">{info.desc}</p>
                </div>
                {loading === role && (
                  <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin shrink-0" />
                )}
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
