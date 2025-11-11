'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Calendar, DollarSign, Package } from 'lucide-react'
import type { DuplicateGame } from '@/lib/utils/duplicate-detection'

interface DuplicateWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  duplicates: DuplicateGame[]
  newGameTitle: string
  newGamePlatform: string
  onProceed: () => void
  onCancel: () => void
}

export function DuplicateWarningDialog({
  open,
  onOpenChange,
  duplicates,
  newGameTitle,
  newGamePlatform,
  onProceed,
  onCancel
}: DuplicateWarningDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Potential Duplicate Detected</DialogTitle>
          </div>
          <DialogDescription>
            You already have {duplicates.length === 1 ? 'a game' : `${duplicates.length} games`} with the same title and platform in your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">New Game:</p>
            <p className="text-sm">
              <span className="font-semibold">{newGameTitle}</span>
              <span className="text-muted-foreground"> • {newGamePlatform}</span>
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Existing {duplicates.length === 1 ? 'Game' : 'Games'}:</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {duplicates.map((duplicate) => (
                <div
                  key={duplicate.id}
                  className="border rounded-md p-3 space-y-2 text-sm"
                >
                  <div className="font-medium">{duplicate.title}</div>
                  
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>{duplicate.platform}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatPrice(duplicate.price)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(duplicate.purchase_date)}</span>
                    </div>
                  </div>
                  
                  {duplicate.seller && (
                    <div className="text-xs text-muted-foreground">
                      Seller: {duplicate.seller.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to add this game to your collection?
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onProceed}>
            Add Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
