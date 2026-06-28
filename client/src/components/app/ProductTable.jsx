import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { catalogService } from '@/services/catalogService'

export function ProductTable({ products, onEdit, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const openConfirm = (id) => {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    setDeletingId(pendingDeleteId)
    try {
      await catalogService.deleteProduct(pendingDeleteId)
      onRefresh()
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setPendingDeleteId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-(--color-text-muted)">
        <p className="text-lg mb-1">No products yet</p>
        <p className="text-sm">Add your first product to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border border-(--color-border) overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-(--color-text-muted) line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-brand-600">
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </TableCell>
                <TableCell className="text-right">
                  <span className={product.stock === 0 ? 'text-red-500 font-semibold' : ''}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      id={`edit-product-${product.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      id={`delete-product-${product.id}`}
                      size="sm"
                      variant="destructive"
                      onClick={() => openConfirm(product.id)}
                      disabled={deletingId === product.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
