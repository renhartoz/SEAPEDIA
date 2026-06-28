import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, AlertCircle, Truck } from 'lucide-react'
import { deliveryService } from '@/services/deliveryService'

const STATUS_COLORS = {
  available: 'outline',
  taken: 'default',
  completed: 'secondary',
}

export function DriverJobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    deliveryService.getJobById(id)
      .then(({ data }) => setJob(data))
      .finally(() => setLoading(false))
  }, [id])

  const handleTake = async () => {
    setActing(true)
    setError(null)
    try {
      const { data } = await deliveryService.takeJob(id)
      setJob(data)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to take job.')
    } finally {
      setActing(false)
    }
  }

  const handleComplete = async () => {
    setActing(true)
    setError(null)
    try {
      const { data } = await deliveryService.completeJob(id)
      setJob(data)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to complete job.')
    } finally {
      setActing(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-32" />
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  )

  if (!job) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <p className="text-(--color-text-muted)">Job not found.</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/driver"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Link>
      </Button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/driver"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h2 className="text-xl font-bold">Delivery Job #{job.id}</h2>
          <p className="text-xs text-(--color-text-muted)">Order #{job.order.id}</p>
        </div>
        <Badge className="ml-auto" variant={STATUS_COLORS[job.status] ?? 'outline'}>{job.status}</Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3"><CardTitle className="text-base">Order Info</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Store:</strong> {job.order.store_name}</p>
          <p><strong>Buyer:</strong> {job.order.buyer_username}</p>
          <p><strong>Delivery Method:</strong> {job.order.delivery_method}</p>
          <p><strong>Delivery Fee:</strong> Rp {Number(job.order.delivery_fee).toLocaleString('id-ID')}</p>
          {job.driver_earnings > 0 && (
            <p className="text-green-600 font-medium">
              <strong>Your Earnings:</strong> Rp {Number(job.driver_earnings).toLocaleString('id-ID')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3"><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent className="divide-y divide-(--color-border)">
          {job.order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <p className="font-medium">{item.product_name} × {item.quantity}</p>
              <p>Rp {Number(item.subtotal).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {job.status === 'available' && (
        <Button id="btn-take-job" className="w-full" onClick={handleTake} disabled={acting}>
          <Truck className="w-4 h-4 mr-2" />
          {acting ? 'Taking Job…' : 'Take This Job'}
        </Button>
      )}

      {job.status === 'taken' && job.driver_username === job.driver_username && (
        <Button id="btn-complete-job" className="w-full" variant="default" onClick={handleComplete} disabled={acting}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {acting ? 'Completing…' : 'Mark as Delivered'}
        </Button>
      )}
    </div>
  )
}
