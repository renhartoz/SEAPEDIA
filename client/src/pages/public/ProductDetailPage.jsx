import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Store, Package, ArrowLeft } from 'lucide-react'
import { catalogService } from '@/services/catalogService'
import { cartService } from '@/services/cartService'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const { activeRole } = useAuth()

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    catalogService
      .getProductById(id)
      .then(({ data }) => setProduct(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (activeRole !== 'buyer') {
      toast.error('You must be logged in as a buyer to add items to cart.')
      return
    }
    setAddingToCart(true)
    try {
      await cartService.addItem(product.id, 1)
      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-80 lg:h-[420px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 mx-auto text-(--color-text-muted) mb-4" />
        <h2 className="text-xl font-bold">Product not found</h2>
        <p className="text-sm text-(--color-text-muted) mt-2 mb-6">
          This product may no longer be available.
        </p>
        <Button asChild variant="outline">
          <Link to="/catalog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-1.5 text-sm text-(--color-text-muted) hover:text-brand-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="h-80 lg:h-[420px] bg-gradient-to-br from-brand-50 to-sea-100 rounded-2xl flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover rounded-2xl"
            />
          ) : (
            <Package className="w-20 h-20 text-brand-200" />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <Link
              to={`/stores/${product.store_id}`}
              id="product-store-link"
              className="inline-flex items-center gap-1.5 text-sm text-(--color-text-muted) hover:text-brand-600 transition-colors mb-2"
            >
              <Store className="w-3.5 h-3.5" />
              {product.store_name}
            </Link>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-brand-600">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </p>
          </div>

          <Separator />

          {product.description && (
            <p className="text-sm leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-(--color-text-muted)">Stock:</span>
            {product.stock > 0 ? (
              <Badge variant="secondary">{product.stock} available</Badge>
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 gap-2"
              id="add-to-cart-btn"
              disabled={product.stock === 0 || activeRole !== 'buyer' || addingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>

          {activeRole !== 'buyer' && (
            <p className="text-xs text-(--color-text-muted)">
              Login as a Buyer to add this item to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
