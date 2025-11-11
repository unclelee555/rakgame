'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { SellerForm } from './seller-form'
import { useSellers } from '@/lib/hooks/use-sellers'
import type { Seller } from '@/lib/types/database'

interface SellerSelectProps {
  value?: string
  onValueChange: (value: string | undefined) => void
  error?: string
}

export function SellerSelect({ value, onValueChange, error }: SellerSelectProps) {
  const { sellers, loading, createSeller } = useSellers()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleCreateSeller = async (data: { name: string; url?: string; note?: string }) => {
    const newSeller = await createSeller(data)
    onValueChange(newSeller.id)
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="seller">Seller</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="h-auto p-1 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add New
        </Button>
      </div>
      
      <Select
        value={value}
        onValueChange={(val) => onValueChange(val === 'none' ? undefined : val)}
        disabled={loading}
      >
        <SelectTrigger id="seller" className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Select a seller (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No seller</SelectItem>
          {sellers.map((seller) => (
            <SelectItem key={seller.id} value={seller.id}>
              {seller.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <SellerForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleCreateSeller}
      />
    </div>
  )
}
