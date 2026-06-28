import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { orderService } from '@/services/orderService'

const STATUS_COLORS = {
  'Sedang Dikemas': 'secondary',
  'Menunggu Pengirim': 'outline',
  'Sedang Dikirim': 'default',
  'Pesanan Selesai': 'default',
  'Dikembalikan': 'destructive',
}

export function SellerOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processError, setProcessError] = useState(null)

  const fetchOrder = () => {
    orderService.getSellerOrderById(id)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const handleProcess = async () => {
    setProcessing(true)
    setProcessError(null)
    try {
      const { data } = await orderService.processOrder(id)
      setOrder(data)
    } catch (err) {
      setProcessError(err.response?.data?.error?.message ?? 'Failed to process order.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-32" />
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  )

  if (!order) return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <p className="text-(--color-text-muted)">Order not found.</p>
      <Button asChild variant="outline" className="mt-4"><Link to="/seller"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Link></Button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/seller"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h2 className="text-xl font-bold">Order #{order.id}</h2>
          <p className="text-xs text-(--color-text-muted)">{new Date(order.created_at).toLocaleString('id-ID')}</p>
        </div>
        <Badge className="ml-auto" variant={STATUS_COLORS[order.status] ?? 'secondary'}>{order.status}</Badge>
        {order.status === 'Sedang Dikemas' && (
          <Button id="btn-process-order" size="sm" onClick={handleProcess} disabled={processing}>
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {processing ? 'Processing…' : 'Process Order'}
          </Button>
        )}
      </div>
      {processError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {processError}
        </div>
      )}

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3"><CardTitle className="text-base">Buyer Info</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p><strong>Username:</strong> {order.buyer_username}</p>
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3"><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
        <CardContent className="divide-y divide-(--color-border)">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-(--color-text-muted) text-xs">Rp {Number(item.product_price).toLocaleString('id-ID')} × {item.quantity}</p>
              </div>
              <p className="font-semibold">Rp {Number(item.subtotal).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3"><CardTitle className="text-base">Price Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-(--color-text-muted)">Subtotal</span><span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between"><span className="text-(--color-text-muted)">Delivery ({order.delivery_method})</span><span>Rp {Number(order.delivery_fee).toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between"><span className="text-(--color-text-muted)">PPN 12%</span><span>Rp {Number(order.ppn_amount).toLocaleString('id-ID')}</span></div>
          <Separator />
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-brand-600">Rp {Number(order.total).toLocaleString('id-ID')}</span></div>
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3"><CardTitle className="text-base">Status Timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative border-l border-(--color-border) ml-3 space-y-4">
            {order.status_history.map((h) => (
              <li key={h.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-brand-500" />
                <p className="text-sm font-medium">{h.status}</p>
                <p className="text-xs text-(--color-text-muted)">{new Date(h.created_at).toLocaleString('id-ID')}</p>
                {h.actor_username && <p className="text-xs text-(--color-text-muted)">by {h.actor_username}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
