import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ArrowRight } from 'lucide-react'
import { orderService } from '@/services/orderService'

const STATUS_COLORS = {
  'Sedang Dikemas': 'secondary',
  'Menunggu Pengirim': 'outline',
  'Sedang Dikirim': 'default',
  'Pesanan Selesai': 'default',
  'Dikembalikan': 'destructive',
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getMyOrders()
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-bold">My Orders</h2>
        <p className="text-sm text-(--color-text-muted) mt-0.5">Track and view your purchase history</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="border-dashed border-(--color-border)">
          <CardContent className="py-16 text-center">
            <Package className="w-10 h-10 mx-auto text-(--color-text-muted) mb-3 opacity-40" />
            <p className="text-sm text-(--color-text-muted)">No orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Link key={order.id} to={`/buyer/orders/${order.id}`} id={`order-${order.id}`}>
            <Card className="border-(--color-border) hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">#{order.id}</p>
                    <Badge variant={STATUS_COLORS[order.status] ?? 'secondary'}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-(--color-text-muted)">{order.store_name}</p>
                  <p className="text-xs text-(--color-text-muted)">{new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand-600">Rp {Number(order.total).toLocaleString('id-ID')}</p>
                  <ArrowRight className="w-4 h-4 ml-auto text-(--color-text-muted) mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}
