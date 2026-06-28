import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { addressService } from '@/services/addressService'

const EMPTY_FORM = { label: '', recipient_name: '', phone: '', street: '', city: '', province: '', postal_code: '', is_default: false }

function AddressFormDialog({ open, onOpenChange, address, onSuccess }) {
  const isEditing = Boolean(address)
  const [form, setForm] = useState(address ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(address ?? EMPTY_FORM)
      setError(null)
    }
  }, [open, address])

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEditing) await addressService.updateAddress(address.id, form)
      else await addressService.createAddress(form)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to save address.')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { name: 'label', label: 'Label', placeholder: 'e.g. Home, Office' },
    { name: 'recipient_name', label: 'Recipient Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'street', label: 'Street Address' },
    { name: 'city', label: 'City' },
    { name: 'province', label: 'Province' },
    { name: 'postal_code', label: 'Postal Code' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1">
              <Label htmlFor={`addr-${f.name}`}>{f.label}</Label>
              <Input id={`addr-${f.name}`} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
            Set as default address
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Address'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AddressPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await addressService.getAddresses()
      setAddresses(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const openAdd = () => { setEditingAddress(null); setDialogOpen(true) }
  const openEdit = (a) => { setEditingAddress(a); setDialogOpen(true) }
  const openConfirmDelete = (id) => { setDeletingId(id); setConfirmOpen(true) }
  const handleDelete = async () => {
    await addressService.deleteAddress(deletingId)
    setConfirmOpen(false)
    fetchAddresses()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Delivery Addresses</h2>
          <p className="text-sm text-(--color-text-muted) mt-0.5">Manage your saved addresses</p>
        </div>
        <Button id="btn-add-address" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Address
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : addresses.length === 0 ? (
        <Card className="border-dashed border-(--color-border)">
          <CardContent className="py-12 text-center">
            <MapPin className="w-8 h-8 mx-auto text-(--color-text-muted) mb-3" />
            <p className="text-sm text-(--color-text-muted)">No addresses yet. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        addresses.map((a) => (
          <Card key={a.id} className="border-(--color-border)">
            <CardContent className="pt-4 pb-4 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.label}</p>
                  {a.is_default && <Badge variant="secondary">Default</Badge>}
                </div>
                <p className="text-sm">{a.recipient_name} · {a.phone}</p>
                <p className="text-sm text-(--color-text-muted)">{a.street}, {a.city}, {a.province} {a.postal_code}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button id={`edit-addr-${a.id}`} size="sm" variant="outline" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button id={`del-addr-${a.id}`} size="sm" variant="destructive" onClick={() => openConfirmDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} address={editingAddress} onSuccess={fetchAddresses} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this address.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
