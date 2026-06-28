import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { MapPin, Truck, Tag, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { addressService } from '@/services/addressService'
import { orderService } from '@/services/orderService'
import { walletService } from '@/services/walletService'
import { discountService } from '@/services/discountService'

const DELIVERY_OPTIONS = [
  { value: 'instant', label: 'Instant', fee: 25000, desc: 'Same-day delivery' },
  { value: 'next_day', label: 'Next Day', fee: 15000, desc: 'Delivered tomorrow' },
  { value: 'regular', label: 'Regular', fee: 10000, desc: '3-5 business days' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [wallet, setWallet] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [deliveryMethod, setDeliveryMethod] = useState('regular')
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState(null)
  const [validatingCode, setValidatingCode] = useState(false)
  const [codeError, setCodeError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewing, setPreviewing] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([addressService.getAddresses(), walletService.getWallet()])
      .then(([{ data: addrs }, { data: w }]) => {
        setAddresses(addrs)
        setWallet(w)
        const def = addrs.find((a) => a.is_default) ?? addrs[0]
        if (def) setSelectedAddress(def)
      })
      .finally(() => setLoading(false))
  }, [])

  const fetchPreview = useCallback(async () => {
    if (!deliveryMethod) return
    setPreviewing(true)
    try {
      const { data } = await orderService.previewCheckout({
        delivery_method: deliveryMethod,
        discount_code: discountResult ? discountCode : '',
      })
      setPreview(data)
    } catch {
      setPreview(null)
    } finally {
      setPreviewing(false)
    }
  }, [deliveryMethod, discountResult, discountCode])

  useEffect(() => { fetchPreview() }, [fetchPreview])

  const handleValidateCode = async () => {
    if (!discountCode.trim()) return
    setValidatingCode(true)
    setCodeError(null)
    setDiscountResult(null)
    try {
      const subtotal = preview?.subtotal ?? 0
      const { data } = await discountService.validate(discountCode.trim(), subtotal)
      setDiscountResult(data)
    } catch (err) {
      setCodeError(err.response?.data?.error?.message ?? 'Invalid code.')
    } finally {
      setValidatingCode(false)
    }
  }

  const handleRemoveCode = () => {
    setDiscountCode('')
    setDiscountResult(null)
    setCodeError(null)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError('Please select a delivery address.'); return }
    setError(null)
    setPlacing(true)
    try {
      const { data: order } = await orderService.checkout({
        address_id: selectedAddress.id,
        delivery_method: deliveryMethod,
        discount_code: discountResult ? discountCode : '',
      })
      navigate(`/buyer/orders/${order.id}`)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Checkout failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h2 className="text-xl font-bold">Checkout</h2>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {addresses.length === 0 ? (
            <p className="text-sm text-(--color-text-muted)">No addresses saved. <a href="/buyer/addresses" className="text-brand-600 underline">Add one</a></p>
          ) : (
            addresses.map((a) => (
              <label key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedAddress?.id === a.id ? 'border-brand-500 bg-brand-50' : 'border-(--color-border)'}`}>
                <input type="radio" name="address" checked={selectedAddress?.id === a.id} onChange={() => setSelectedAddress(a)} className="mt-1" />
                <div>
                  <p className="text-sm font-medium">{a.label} {a.is_default && <Badge variant="secondary" className="ml-1 text-xs">Default</Badge>}</p>
                  <p className="text-xs text-(--color-text-muted)">{a.recipient_name} · {a.phone}</p>
                  <p className="text-xs text-(--color-text-muted)">{a.street}, {a.city}, {a.province} {a.postal_code}</p>
                </div>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4" /> Delivery Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <label key={opt.value} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === opt.value ? 'border-brand-500 bg-brand-50' : 'border-(--color-border)'}`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="delivery" checked={deliveryMethod === opt.value} onChange={() => setDeliveryMethod(opt.value)} />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-(--color-text-muted)">{opt.desc}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">Rp {opt.fee.toLocaleString('id-ID')}</p>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Tag className="w-4 h-4" /> Discount Code</CardTitle>
        </CardHeader>
        <CardContent>
          {discountResult ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{discountCode}</span>
                <span className="text-xs text-(--color-text-muted)">
                  −Rp {Number(discountResult.discount_amount).toLocaleString('id-ID')}
                </span>
              </div>
              <Button id="btn-remove-code" size="sm" variant="ghost" className="h-7" onClick={handleRemoveCode}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                id="input-discount-code"
                value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value); setCodeError(null) }}
                placeholder="Enter voucher or promo code"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleValidateCode()}
              />
              <Button id="btn-apply-code" variant="outline" onClick={handleValidateCode} disabled={validatingCode || !discountCode.trim()}>
                {validatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          )}
          {codeError && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> {codeError}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-(--color-border)">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {previewing ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
          ) : preview ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Subtotal</span><span>Rp {Number(preview.subtotal).toLocaleString('id-ID')}</span></div>
              {Number(preview.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−Rp {Number(preview.discount_amount).toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Delivery Fee</span><span>Rp {Number(preview.delivery_fee).toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span className="text-(--color-text-muted)">PPN 12%</span><span>Rp {Number(preview.ppn_amount).toLocaleString('id-ID')}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-brand-600">Rp {Number(preview.total).toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between text-xs text-(--color-text-muted) pt-1">
                <span>Wallet Balance</span>
                <span className={Number(wallet?.balance ?? 0) < Number(preview.total) ? 'text-red-500 font-semibold' : ''}>
                  Rp {Number(wallet?.balance ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button id="btn-place-order" className="w-full mt-4" onClick={handlePlaceOrder} disabled={placing || !preview}>
            {placing ? 'Placing Order…' : 'Place Order'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
