'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Seller } from '@/lib/types/database'

interface SellerFormProps {
  seller?: Seller
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; url?: string; note?: string }) => Promise<void>
}

export function SellerForm({ seller, open, onOpenChange, onSubmit }: SellerFormProps) {
  const [name, setName] = useState(seller?.name || '')
  const [url, setUrl] = useState(seller?.url || '')
  const [note, setNote] = useState(seller?.note || '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (url && url.trim()) {
      try {
        new URL(url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        url: url.trim() || undefined,
        note: note.trim() || undefined,
      })
      
      // Reset form
      setName('')
      setUrl('')
      setNote('')
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName(seller?.name || '')
    setUrl(seller?.url || '')
    setNote(seller?.note || '')
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{seller ? 'Edit Seller' : 'Add New Seller'}</DialogTitle>
            <DialogDescription>
              {seller 
                ? 'Update the seller information below.' 
                : 'Add a new seller to track where you purchase your games.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., GameStop, Steam, PlayStation Store"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className={errors.url ? 'border-destructive' : ''}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional notes about this seller"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : seller ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
