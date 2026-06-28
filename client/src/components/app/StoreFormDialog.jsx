import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { storeService } from '@/services/storeService'

export function StoreFormDialog({ open, onOpenChange, store, onSuccess }) {
  const isEditing = Boolean(store)
  const [form, setForm] = useState({
    name: store?.name ?? '',
    description: store?.description ?? '',
    logo: null,
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        name: store?.name ?? '',
        description: store?.description ?? '',
        logo: null,
      })
      setError(null)
    }
  }, [open, store])

  const handleChange = (e) => {
    const { name, type, files, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      if (form.description) formData.append('description', form.description)
      
      if (form.logo) {
        formData.append('logo', form.logo)
      }

      if (isEditing) {
        await storeService.updateStore(formData)
      } else {
        await storeService.createStore(formData)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const errorData = err.response?.data?.error?.details || err.response?.data
      console.log('Store upload error details:', errorData)
      if (errorData?.name) {
        setError(errorData.name[0])
      } else if (errorData?.detail) {
        setError(errorData.detail)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Store' : 'Create Your Store'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="store-name">Store Name *</Label>
            <Input
              id="store-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Unique store name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-description">Description</Label>
            <Textarea
              id="store-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell buyers about your store…"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-logo">Store Logo (Optional)</Label>
            <Input
              id="store-logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            {isEditing && store?.logo && (
              <p className="text-xs text-(--color-text-muted)">
                Current logo uploaded. Leave empty to keep it.
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Store'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
