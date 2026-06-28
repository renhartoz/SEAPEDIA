import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Package } from 'lucide-react'
import { catalogService } from '@/services/catalogService'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function CatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const navigate = useNavigate()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await catalogService.getProducts(params)
      setProducts(Array.isArray(data) ? data : data.results ?? [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Browse Products</h1>
        <p className="text-sm text-(--color-text-muted)">
          Discover products from verified sellers across Indonesia
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-text-muted)" />
          <Input
            id="catalog-search"
            placeholder="Search products…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="pt-4 pb-5 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-3 text-(--color-text-muted)">
          <Package className="w-12 h-12 opacity-40" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try a different search term or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <Card
              key={product.id}
              id={`catalog-product-${product.id}`}
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
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/stores/${product.store_id}`}
                      className="text-xs text-(--color-text-muted) hover:text-brand-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.store_name}
                    </Link>
                  </div>
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
