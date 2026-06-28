import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3, Users, Store, Package, ClipboardList, Tag, Truck, AlertTriangle, Clock,
} from 'lucide-react'
import { adminService } from '@/services/adminService'

function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  return (
    <Card className="border-(--color-border)">
      <CardContent className="pt-5 pb-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        <div>
          <p className="text-xs text-(--color-text-muted)">{label}</p>
          <p className="font-bold text-xl">{value ?? '—'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DataTable({ columns, rows, loading }) {
  if (loading) return <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
  if (!rows?.length) return <p className="text-sm text-(--color-text-muted) py-6 text-center">No data.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--color-border) text-xs text-(--color-text-muted)">
            {columns.map((c) => <th key={c.key} className="text-left py-2 pr-4">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-(--color-border) hover:bg-(--color-surface)">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OverviewTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats().then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  const items = [
    { icon: Users, label: 'Users', key: 'users' },
    { icon: Store, label: 'Stores', key: 'stores' },
    { icon: Package, label: 'Products', key: 'products' },
    { icon: ClipboardList, label: 'Orders', key: 'orders' },
    { icon: Truck, label: 'Delivery Jobs', key: 'delivery_jobs' },
    { icon: Tag, label: 'Vouchers', key: 'vouchers' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(({ icon, label, key }) => (
        loading
          ? <Skeleton key={key} className="h-24" />
          : <StatCard key={key} icon={icon} label={label} value={stats?.[key]} />
      ))}
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { adminService.getUsers().then(({ data }) => setUsers(data)).finally(() => setLoading(false)) }, [])
  return (
    <DataTable
      loading={loading}
      rows={users}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles', render: (r) => (r.roles || []).join(', ') },
      ]}
    />
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  useEffect(() => { adminService.getOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false)) }, [])
  const filtered = filter ? orders.filter((o) => o.status === filter) : orders
  const STATUS_COLORS = {
    'Sedang Dikemas': 'secondary',
    'Menunggu Pengirim': 'outline',
    'Sedang Dikirim': 'default',
    'Pesanan Selesai': 'default',
    'Dikembalikan': 'destructive',
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {['', 'Sedang Dikemas', 'Menunggu Pengirim', 'Sedang Dikirim', 'Pesanan Selesai', 'Dikembalikan'].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'} onClick={() => setFilter(s)}>
            {s || 'All'}
          </Button>
        ))}
      </div>
      <DataTable
        loading={loading}
        rows={filtered}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'buyer_username', label: 'Buyer' },
          { key: 'store_name', label: 'Store' },
          { key: 'status', label: 'Status', render: (r) => <Badge variant={STATUS_COLORS[r.status] ?? 'secondary'}>{r.status}</Badge> },
          { key: 'total', label: 'Total', render: (r) => `Rp ${Number(r.total).toLocaleString('id-ID')}` },
        ]}
      />
    </div>
  )
}

function OverdueTab() {
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  const fetchOverdue = useCallback(() => {
    setLoading(true)
    adminService.getOverdueOrders().then(({ data }) => setOverdue(data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOverdue() }, [fetchOverdue])

  const handleSimulate = async () => {
    setSimulating(true)
    setSimResult(null)
    try {
      const { data } = await adminService.simulateNextDay()
      setSimResult(data)
      fetchOverdue()
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-muted)">{overdue.length} overdue order(s) detected.</p>
        <Button id="btn-simulate-next-day" onClick={handleSimulate} disabled={simulating} variant={overdue.length > 0 ? 'default' : 'outline'}>
          <Clock className="w-4 h-4 mr-2" />
          {simulating ? 'Processing…' : 'Simulate Next Day'}
        </Button>
      </div>
      {simResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
          Processed {simResult.processed_count} overdue order(s). IDs: {simResult.processed_order_ids.join(', ') || 'none'}
        </div>
      )}
      <DataTable
        loading={loading}
        rows={overdue}
        columns={[
          { key: 'id', label: 'Order ID' },
          { key: 'buyer_username', label: 'Buyer' },
          { key: 'store_name', label: 'Store' },
          { key: 'delivery_method', label: 'Method' },
          { key: 'status', label: 'Status' },
          { key: 'total', label: 'Total', render: (r) => `Rp ${Number(r.total).toLocaleString('id-ID')}` },
        ]}
      />
    </div>
  )
}

function VoucherPromoTab() {
  const [vouchers, setVouchers] = useState([])
  const [promos, setPromos] = useState([])
  const [loadingV, setLoadingV] = useState(true)
  const [loadingP, setLoadingP] = useState(true)
  const [vForm, setVForm] = useState({ code: '', discount_type: 'fixed', discount_value: '', expiry_date: '', max_uses: '' })
  const [pForm, setPForm] = useState({ code: '', discount_type: 'fixed', discount_value: '', expiry_date: '' })
  const [savingV, setSavingV] = useState(false)
  const [savingP, setSavingP] = useState(false)

  const fetchV = () => adminService.getVouchers().then(({ data }) => setVouchers(data)).finally(() => setLoadingV(false))
  const fetchP = () => adminService.getPromos().then(({ data }) => setPromos(data)).finally(() => setLoadingP(false))

  useEffect(() => { fetchV(); fetchP() }, [])

  const handleCreateVoucher = async (e) => {
    e.preventDefault()
    setSavingV(true)
    try { await adminService.createVoucher(vForm); fetchV(); setVForm({ code: '', discount_type: 'fixed', discount_value: '', expiry_date: '', max_uses: '' }) }
    finally { setSavingV(false) }
  }
  const handleCreatePromo = async (e) => {
    e.preventDefault()
    setSavingP(true)
    try { await adminService.createPromo(pForm); fetchP(); setPForm({ code: '', discount_type: 'fixed', discount_value: '', expiry_date: '' }) }
    finally { setSavingP(false) }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Vouchers</h3>
        <form onSubmit={handleCreateVoucher} className="space-y-2 p-4 border border-(--color-border) rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Code</Label><Input value={vForm.code} onChange={(e) => setVForm({ ...vForm, code: e.target.value })} required /></div>
            <div><Label>Type</Label>
              <select value={vForm.discount_type} onChange={(e) => setVForm({ ...vForm, discount_type: e.target.value })} className="w-full border border-(--color-border) rounded-md px-3 py-2 text-sm">
                <option value="fixed">Fixed (Rp)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div><Label>Value</Label><Input type="number" value={vForm.discount_value} onChange={(e) => setVForm({ ...vForm, discount_value: e.target.value })} required /></div>
            <div><Label>Max Uses</Label><Input type="number" value={vForm.max_uses} onChange={(e) => setVForm({ ...vForm, max_uses: e.target.value })} required /></div>
            <div className="col-span-2"><Label>Expiry Date</Label><Input type="date" value={vForm.expiry_date} onChange={(e) => setVForm({ ...vForm, expiry_date: e.target.value })} required /></div>
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={savingV}>Create Voucher</Button>
        </form>
        <DataTable loading={loadingV} rows={vouchers} columns={[
          { key: 'code', label: 'Code' },
          { key: 'discount_value', label: 'Value', render: (r) => r.discount_type === 'fixed' ? `Rp ${Number(r.discount_value).toLocaleString('id-ID')}` : `${r.discount_value}%` },
          { key: 'uses_count', label: 'Uses', render: (r) => `${r.uses_count}/${r.max_uses}` },
          { key: 'expiry_date', label: 'Expires' },
        ]} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Promos</h3>
        <form onSubmit={handleCreatePromo} className="space-y-2 p-4 border border-(--color-border) rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Code</Label><Input value={pForm.code} onChange={(e) => setPForm({ ...pForm, code: e.target.value })} required /></div>
            <div><Label>Type</Label>
              <select value={pForm.discount_type} onChange={(e) => setPForm({ ...pForm, discount_type: e.target.value })} className="w-full border border-(--color-border) rounded-md px-3 py-2 text-sm">
                <option value="fixed">Fixed (Rp)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div><Label>Value</Label><Input type="number" value={pForm.discount_value} onChange={(e) => setPForm({ ...pForm, discount_value: e.target.value })} required /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={pForm.expiry_date} onChange={(e) => setPForm({ ...pForm, expiry_date: e.target.value })} required /></div>
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={savingP}>Create Promo</Button>
        </form>
        <DataTable loading={loadingP} rows={promos} columns={[
          { key: 'code', label: 'Code' },
          { key: 'discount_value', label: 'Value', render: (r) => r.discount_type === 'fixed' ? `Rp ${Number(r.discount_value).toLocaleString('id-ID')}` : `${r.discount_value}%` },
          { key: 'expiry_date', label: 'Expires' },
          { key: 'is_active', label: 'Active', render: (r) => r.is_active ? 'Yes' : 'No' },
        ]} />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-(--color-text-muted) mt-1">Platform monitoring and management</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
          <TabsTrigger value="orders"><ClipboardList className="w-4 h-4 mr-2" />Orders</TabsTrigger>
          <TabsTrigger value="discounts"><Tag className="w-4 h-4 mr-2" />Vouchers & Promos</TabsTrigger>
          <TabsTrigger value="overdue"><AlertTriangle className="w-4 h-4 mr-2" />Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="discounts"><VoucherPromoTab /></TabsContent>
        <TabsContent value="overdue"><OverdueTab /></TabsContent>
      </Tabs>
    </div>
  )
}
