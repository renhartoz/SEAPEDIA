import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { catalogService } from '@/services/catalogService'

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }) {
  const isEditing = Boolean(product)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    is_active: product?.is_active ?? true,
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        stock: product?.stock ?? '',
        is_active: product?.is_active ?? true,
        image: null,
      })
      setErrors({})
    }
  }, [open, product])

  const handleChange = (e) => {
    const { name, type, files, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      if (form.description) formData.append('description', form.description)
      formData.append('price', parseFloat(form.price))
      formData.append('stock', parseInt(form.stock, 10))
      formData.append('is_active', form.is_active)
      
      if (form.image) {
        formData.append('image', form.image)
      }

      if (isEditing) {
        await catalogService.updateProduct(product.id, formData)
      } else {
        await catalogService.createProduct(formData)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const errorData = err.response?.data?.error?.details || err.response?.data
      console.log('Product upload error details:', errorData)
      if (errorData && typeof errorData === 'object') {
        setErrors(errorData)
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Price (Rp) *</Label>
              <Input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="100"
                value={form.price}
                onChange={handleChange}
                required
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Stock *</Label>
              <Input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock[0]}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-image">Product Image (Optional)</Label>
            <Input
              id="product-image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            {isEditing && product?.image && (
              <p className="text-xs text-(--color-text-muted)">
                Current image uploaded. Leave empty to keep it.
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="product-active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="product-active" className="cursor-pointer">
              Product is active and visible to buyers
            </Label>
          </div>
          {errors.non_field_errors && (
            <p className="text-sm text-red-500">{errors.non_field_errors[0]}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
