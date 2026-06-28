import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, ArrowUpRight, Plus } from 'lucide-react'
import { walletService } from '@/services/walletService'

const TYPE_LABELS = {
  topup: { label: 'Top Up', color: 'text-green-500' },
  debit: { label: 'Purchase', color: 'text-red-500' },
  refund: { label: 'Refund', color: 'text-blue-500' },
  reversal: { label: 'Reversal', color: 'text-orange-500' },
}

export function WalletPage() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [topping, setTopping] = useState(false)
  const [error, setError] = useState(null)

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await walletService.getWallet()
      setWallet(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWallet() }, [fetchWallet])

  const handleTopUp = async (e) => {
    e.preventDefault()
    setError(null)
    setTopping(true)
    try {
      const { data } = await walletService.topUp(parseFloat(amount))
      setWallet(data)
      setAmount('')
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Top-up failed.')
    } finally {
      setTopping(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold">My Wallet</h2>
        <p className="text-sm text-(--color-text-muted) mt-0.5">Manage your balance and transactions</p>
      </div>

      {loading ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : (
        <Card className="bg-gradient-to-br from-brand-600 to-sea-700 text-white border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-1 opacity-80">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">
              Rp {Number(wallet?.balance ?? 0).toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-(--color-border)">
        <CardHeader>
          <CardTitle className="text-base">Top Up Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTopUp} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="topup-amount" className="sr-only">Amount</Label>
              <Input
                id="topup-amount"
                type="number"
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 100000)"
                required
              />
            </div>
            <Button id="btn-topup" type="submit" disabled={topping}>
              <Plus className="w-4 h-4 mr-1" />
              {topping ? 'Processing…' : 'Top Up'}
            </Button>
          </form>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            {[50000, 100000, 200000, 500000].map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(preset))}
              >
                +{(preset / 1000).toFixed(0)}K
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-(--color-border)">
          {loading ? (
            <div className="space-y-3 py-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : wallet?.transactions?.length === 0 ? (
            <p className="py-6 text-center text-sm text-(--color-text-muted)">No transactions yet.</p>
          ) : (
            wallet?.transactions?.map((tx) => {
              const meta = TYPE_LABELS[tx.transaction_type] ?? { label: tx.transaction_type, color: '' }
              const isCredit = tx.transaction_type === 'topup' || tx.transaction_type === 'refund'
              return (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-(--color-text-muted)">{tx.description}</p>
                    <p className="text-xs text-(--color-text-muted)">{new Date(tx.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <p className={`font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                  </p>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
