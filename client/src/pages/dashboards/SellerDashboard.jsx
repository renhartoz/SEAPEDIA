import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Store, Package, Plus, Pencil, ExternalLink, ClipboardList } from 'lucide-react'
import { storeService } from '@/services/storeService'
import { catalogService } from '@/services/catalogService'
import { StoreFormDialog } from '@/components/app/StoreFormDialog'
import { ProductFormDialog } from '@/components/app/ProductFormDialog'
import { ProductTable } from '@/components/app/ProductTable'
import { SellerOrdersTab } from '@/components/app/SellerOrdersTab'
import { Link } from 'react-router-dom'

export function SellerDashboard() {
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingStore, setLoadingStore] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [storeDialogOpen, setStoreDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchStore = useCallback(async () => {
    setLoadingStore(true)
    try {
      const { data } = await storeService.getMyStore()
      setStore(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setStore(null)
      }
    } finally {
      setLoadingStore(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const { data } = await catalogService.getMyProducts()
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    fetchStore()
    fetchProducts()
  }, [fetchStore, fetchProducts])

  const openEditProduct = (product) => {
    setEditingProduct(product)
    setProductDialogOpen(true)
  }

  const openAddProduct = () => {
    setEditingProduct(null)
    setProductDialogOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Manage your store and products
        </p>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="mb-6">
          <TabsTrigger value="store" id="tab-store">
            <Store className="w-4 h-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="products" id="tab-products">
            <Package className="w-4 h-4 mr-2" />
            Products
            {products.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {products.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" id="tab-orders">
            <ClipboardList className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          {loadingStore ? (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ) : store ? (
            <Card className="border-(--color-border)">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{store.name}</CardTitle>
                  <p className="text-sm text-(--color-text-muted) mt-1">
                    Created {new Date(store.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    id="btn-view-store"
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <Link to={`/stores/${store.id}`}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Public Page
                    </Link>
                  </Button>
                  <Button
                    id="btn-edit-store"
                    size="sm"
                    variant="outline"
                    onClick={() => setStoreDialogOpen(true)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {store.description ? (
                  <p className="text-sm">{store.description}</p>
                ) : (
                  <p className="text-sm text-(--color-text-muted) italic">No description yet.</p>
                )}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-(--color-surface) rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-brand-600">{products.length}</p>
                    <p className="text-xs text-(--color-text-muted) mt-1">Total Products</p>
                  </div>
                  <div className="bg-(--color-surface) rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-brand-600">
                      {products.filter((p) => p.stock > 0).length}
                    </p>
                    <p className="text-xs text-(--color-text-muted) mt-1">In Stock</p>
                  </div>
                  <div className="bg-(--color-surface) rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">
                      {products.filter((p) => p.stock === 0).length}
                    </p>
                    <p className="text-xs text-(--color-text-muted) mt-1">Out of Stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-(--color-border) border-dashed">
              <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                  <Store className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">You don't have a store yet</h3>
                  <p className="text-sm text-(--color-text-muted) mt-1">
                    Create your store to start selling on SEAPEDIA.
                  </p>
                </div>
                <Button id="btn-create-store" onClick={() => setStoreDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Store
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Products</h2>
            {store && (
              <Button id="btn-add-product" onClick={openAddProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>

          {!store && (
            <Card className="border-(--color-border) border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-(--color-text-muted)">
                  Create your store first before adding products.
                </p>
              </CardContent>
            </Card>
          )}

          {store && loadingProducts ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : store ? (
            <ProductTable
              products={products}
              onEdit={openEditProduct}
              onRefresh={fetchProducts}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="orders">
          {!store ? (
            <Card className="border-(--color-border) border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-(--color-text-muted)">
                  Create your store first before viewing orders.
                </p>
              </CardContent>
            </Card>
          ) : (
            <SellerOrdersTab />
          )}
        </TabsContent>
      </Tabs>

      <StoreFormDialog
        open={storeDialogOpen}
        onOpenChange={setStoreDialogOpen}
        store={store}
        onSuccess={fetchStore}
      />

      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
