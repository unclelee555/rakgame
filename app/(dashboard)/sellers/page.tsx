'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useSellers } from '@/lib/hooks/use-sellers'
import { useTranslations } from '@/lib/hooks/use-translations'
import { SellerForm } from '@/components/sellers/seller-form'
import { SellerList } from '@/components/sellers/seller-list'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { Seller } from '@/lib/types/database'

export default function SellersPage() {
  const t = useTranslations('sellers')
  const tCommon = useTranslations('common')
  const { sellers, loading, error, createSeller, updateSeller, deleteSeller, refetch } = useSellers()
  const [showForm, setShowForm] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | undefined>()

  const handleCreate = () => {
    setEditingSeller(undefined)
    setShowForm(true)
  }

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller)
    setShowForm(true)
  }

  const handleSubmit = async (data: { name: string; url?: string; note?: string }) => {
    if (editingSeller) {
      await updateSeller(editingSeller.id, data)
    } else {
      await createSeller(data)
    }
  }

  const handleFormClose = (open: boolean) => {
    setShowForm(open)
    if (!open) {
      setEditingSeller(undefined)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error.message}</p>
          <Button onClick={refetch}>{tCommon('tryAgain')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            {t('description')}
          </p>
        </div>
        <Button onClick={handleCreate} className="min-h-[44px] touch-manipulation w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('addSeller')}
        </Button>
      </div>

      <SellerList
        sellers={sellers}
        onEdit={handleEdit}
        onDelete={deleteSeller}
      />

      <SellerForm
        seller={editingSeller}
        open={showForm}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
