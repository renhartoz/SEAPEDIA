import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, Package } from 'lucide-react'
import { cartService } from '@/services/cartService'

export function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await cartService.getCart()
      setCart(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleUpdateQty = async (itemId, qty) => {
    setUpdating(itemId)
    try {
      const { data } = await cartService.updateItem(itemId, qty)
      setCart(data)
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (itemId) => {
    setUpdating(itemId)
    try {
      await cartService.removeItem(itemId)
      await fetchCart()
    } finally {
      setUpdating(null)
    }
  }

  const handleClear = async () => {
    await cartService.clearCart()
    fetchCart()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  }

  const isEmpty = !cart?.items?.length

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" /> My Cart
          {!isEmpty && <span className="text-sm text-(--color-text-muted) font-normal">({cart.item_count} item{cart.item_count !== 1 ? 's' : ''})</span>}
        </h2>
        {!isEmpty && (
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={handleClear}>
            Clear Cart
          </Button>
        )}
      </div>

      {isEmpty ? (
        <Card className="border-dashed border-(--color-border)">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-(--color-text-muted)">
            <ShoppingCart className="w-10 h-10 opacity-40" />
            <p className="font-medium">Your cart is empty</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/catalog">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-(--color-text-muted) bg-(--color-surface) rounded-lg px-3 py-2">
            <Store className="w-4 h-4" />
            <span>Items from <strong>{cart.store_name}</strong></span>
          </div>

          <Card className="border-(--color-border)">
            <CardContent className="pt-4 pb-2 divide-y divide-(--color-border)">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <div className="w-20 h-20 bg-(--color-surface) rounded-lg shrink-0 overflow-hidden">
                    {item.product.image
                      ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                      : <Package className="w-8 h-8 m-6 text-(--color-text-muted)" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                    <p className="text-brand-600 font-semibold text-sm mt-0.5">
                      Rp {Number(item.product.price).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="icon" variant="outline" className="h-6 w-6" disabled={updating === item.id || item.quantity <= 1} onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-6 w-6" disabled={updating === item.id || item.quantity >= item.product.stock} onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button id={`remove-item-${item.id}`} size="icon" variant="ghost" className="text-(--color-text-muted) h-7 w-7" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <p className="text-sm font-semibold">
                      Rp {Number(item.subtotal).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-(--color-border)">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-(--color-text-muted)">Subtotal</span>
                <span className="font-semibold">Rp {Number(cart.subtotal).toLocaleString('id-ID')}</span>
              </div>
              <p className="text-xs text-(--color-text-muted) mb-4">Delivery fee and tax calculated at checkout</p>
              <Button id="btn-checkout" className="w-full" onClick={() => navigate('/buyer/checkout')}>
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
