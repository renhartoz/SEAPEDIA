import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ArrowLeft, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { storeService } from '@/services/storeService'
import { catalogService } from '@/services/catalogService'

export function StoreDetailPage() {
  const { id } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingStore, setLoadingStore] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoadingStore(true)
    storeService
      .getStoreById(id)
      .then(({ data }) => setStore(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoadingStore(false))

    setLoadingProducts(true)
    catalogService
      .getProducts({ store: id })
      .then(({ data }) => setProducts(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [id])

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Store className="w-12 h-12 mx-auto text-(--color-text-muted) mb-4" />
        <h2 className="text-xl font-bold">Store not found</h2>
        <p className="text-sm text-(--color-text-muted) mt-2 mb-6">
          This store may have been removed or does not exist.
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

      <div className="mb-10">
        {loadingStore ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        ) : (
          <div className="flex items-start gap-5">
            {store?.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-16 h-16 rounded-xl object-cover border border-(--color-border)"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-100 to-sea-100 flex items-center justify-center">
                <Store className="w-7 h-7 text-brand-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{store?.name}</h1>
              {store?.description && (
                <p className="text-sm text-(--color-text-muted) mt-1 max-w-xl">
                  {store.description}
                </p>
              )}
              <p className="text-xs text-(--color-text-muted) mt-2">
                Seller: {store?.seller_username} · Since{' '}
                {store && new Date(store.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-4">Products from this store</h2>

      {loadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="pt-4 pb-5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-(--color-text-muted)">
          <Package className="w-10 h-10 opacity-40" />
          <p className="text-sm">This store has no products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <Card
              key={product.id}
              id={`store-product-${product.id}`}
              className="border-(--color-border) hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full"
              onClick={() => navigate(`/products/${product.id}`)}
            >
                <div className="h-40 bg-gradient-to-br from-brand-50 to-sea-50 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-brand-200" />
                  )}
                </div>
                <CardContent className="pt-4 pb-5 space-y-1.5">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
                  <p className="font-bold text-brand-600">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-(--color-text-muted)">
                    {product.stock > 0 ? `Stock: ${product.stock}` : <span className="text-red-500">Out of stock</span>}
                  </p>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
