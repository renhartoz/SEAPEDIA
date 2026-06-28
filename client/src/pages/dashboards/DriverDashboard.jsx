import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Truck, Package, History, TrendingUp, ArrowRight } from 'lucide-react'
import { deliveryService } from '@/services/deliveryService'

const DELIVERY_METHOD_LABELS = { instant: 'Instant', next_day: 'Next Day', regular: 'Regular' }

function JobCard({ job, actionLabel, onAction, loading }) {
  return (
    <Card className="border-(--color-border)">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-sm">Order #{job.order.id}</p>
            <p className="text-sm text-(--color-text-muted)">{job.order.store_name} → {job.order.buyer_username}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{DELIVERY_METHOD_LABELS[job.order.delivery_method] ?? job.order.delivery_method}</Badge>
              <span className="text-xs text-(--color-text-muted)">Rp {Number(job.order.delivery_fee).toLocaleString('id-ID')}</span>
            </div>
            {job.driver_earnings > 0 && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                Earnings: Rp {Number(job.driver_earnings).toLocaleString('id-ID')}
              </p>
            )}
          </div>
          {actionLabel && (
            <Button id={`btn-${actionLabel.toLowerCase()}-${job.id}`} size="sm" onClick={() => onAction(job.id)} disabled={loading}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AvailableJobsTab() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [taking, setTaking] = useState(null)

  const fetchJobs = useCallback(() => {
    setLoading(true)
    deliveryService.getAvailableJobs()
      .then(({ data }) => setJobs(data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleTake = async (jobId) => {
    setTaking(jobId)
    try {
      await deliveryService.takeJob(jobId)
      navigate(`/driver/jobs/${jobId}`)
    } finally {
      setTaking(null)
    }
  }

  if (loading) return <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  if (jobs.length === 0) return (
    <Card className="border-dashed border-(--color-border)">
      <CardContent className="py-16 text-center">
        <Truck className="w-10 h-10 mx-auto text-(--color-text-muted) mb-3 opacity-40" />
        <p className="text-sm text-(--color-text-muted)">No available jobs right now.</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} actionLabel="Take Job" onAction={handleTake} loading={taking === job.id} />
      ))}
    </div>
  )
}

function JobHistoryTab() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    deliveryService.getJobHistory()
      .then(({ data }) => setJobs(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>

  if (jobs.length === 0) return (
    <Card className="border-dashed border-(--color-border)">
      <CardContent className="py-16 text-center">
        <History className="w-10 h-10 mx-auto text-(--color-text-muted) mb-3 opacity-40" />
        <p className="text-sm text-(--color-text-muted)">No completed jobs yet.</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

function EarningsTab() {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    deliveryService.getEarnings()
      .then(({ data }) => setEarnings(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      {loading ? (
        <Skeleton className="h-36 w-full" />
      ) : (
        <Card className="bg-gradient-to-br from-brand-600 to-sea-700 text-white border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-1 opacity-80">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Earnings</span>
            </div>
            <p className="text-3xl font-bold">
              Rp {Number(earnings?.total_earnings ?? 0).toLocaleString('id-ID')}
            </p>
            <div className="flex gap-6 mt-4 text-sm opacity-80">
              <div><p className="text-xs">Total Jobs</p><p className="font-semibold">{earnings?.total_jobs ?? 0}</p></div>
              <div><p className="text-xs">Completed</p><p className="font-semibold">{earnings?.completed_jobs ?? 0}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function DriverDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p className="text-sm text-(--color-text-muted) mt-1">Find and manage delivery jobs</p>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="mb-6">
          <TabsTrigger value="jobs"><Truck className="w-4 h-4 mr-2" />Available Jobs</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />Job History</TabsTrigger>
          <TabsTrigger value="earnings"><TrendingUp className="w-4 h-4 mr-2" />Earnings</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs"><AvailableJobsTab /></TabsContent>
        <TabsContent value="history"><JobHistoryTab /></TabsContent>
        <TabsContent value="earnings"><EarningsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
