import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Package, Tag, Truck } from 'lucide-react'
import { orderService } from '@/services/orderService'

const STATUS_COLORS = {
  'Sedang Dikemas': 'secondary',
  'Menunggu Pengirim': 'outline',
  'Sedang Dikirim': 'default',
  'Pesanan Selesai': 'default',
  'Dikembalikan': 'destructive',
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="border-(--color-border)">
      <CardContent className="pt-5 pb-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">{label}</p>
          <p className="font-bold text-lg">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function BuyerReportPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getBuyerReport()
      .then(({ data }) => setReport(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold">Spending Report</h2>
        <p className="text-sm text-(--color-text-muted) mt-0.5">Your order and spending history</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Total Orders" value={report.order_count} />
          <StatCard icon={TrendingUp} label="Total Spent" value={`Rp ${Number(report.total_spent || 0).toLocaleString('id-ID')}`} />
          <StatCard icon={Tag} label="Total Discount Saved" value={`Rp ${Number(report.total_discount_saved || 0).toLocaleString('id-ID')}`} />
          <StatCard icon={Truck} label="Total Delivery Paid" value={`Rp ${Number(report.total_delivery_paid || 0).toLocaleString('id-ID')}`} />
        </div>
      )}

      <Card className="border-(--color-border)">
        <CardHeader><CardTitle className="text-base">All Orders</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : report?.orders?.length === 0 ? (
            <p className="text-sm text-center text-(--color-text-muted) py-8">No orders yet.</p>
          ) : (
            <div className="divide-y divide-(--color-border)">
              {report.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">#{o.id} · {o.store_name}</p>
                      <Badge variant={STATUS_COLORS[o.status] ?? 'secondary'} className="text-xs">{o.status}</Badge>
                    </div>
                    <p className="text-xs text-(--color-text-muted) mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('id-ID')}
                      {Number(o.discount_amount) > 0 && ` · Saved Rp ${Number(o.discount_amount).toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <p className="font-semibold text-brand-600">Rp {Number(o.total).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
