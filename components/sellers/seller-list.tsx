'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { Seller } from '@/lib/types/database'

interface SellerListProps {
  sellers: Seller[]
  onEdit: (seller: Seller) => void
  onDelete: (id: string) => Promise<void>
}

export function SellerList({ sellers, onEdit, onDelete }: SellerListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (seller: Seller) => {
    setSellerToDelete(seller)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sellerToDelete) return

    setDeleting(true)
    try {
      await onDelete(sellerToDelete.id)
      setDeleteDialogOpen(false)
      setSellerToDelete(null)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSellerToDelete(null)
  }

  if (sellers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            No sellers yet. Add your first seller to start tracking where you buy your games.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Your Sellers</CardTitle>
          <CardDescription>
            Manage the stores and vendors where you purchase your games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>
                      {seller.url ? (
                        <a
                          href={seller.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <span className="truncate max-w-[200px]">{seller.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {seller.note ? (
                        <span className="truncate max-w-[300px] block">
                          {seller.note}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(seller)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(seller)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sellers.map((seller) => (
          <Card key={seller.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{seller.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 touch-manipulation"
                    onClick={() => onEdit(seller)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 touch-manipulation"
                    onClick={() => handleDeleteClick(seller)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {seller.url && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">URL</p>
                  <a
                    href={seller.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline break-all"
                  >
                    <span>{seller.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              )}
              {seller.note && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Note</p>
                  <p className="text-sm">{seller.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Seller</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sellerToDelete?.name}"? 
              Games associated with this seller will remain in your collection, 
              but the seller reference will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
