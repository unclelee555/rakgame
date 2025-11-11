'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/hooks/use-translations'
import { GameCard } from './game-card'
import { GameCardSkeleton } from './game-card-skeleton'
import { hasDuplicates } from '@/lib/utils/duplicate-detection'
import type { Game } from '@/lib/types/database'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GameListProps {
  games: Game[]
  onEdit: (game: Game) => void
  onDelete: (id: string) => Promise<void>
  isFiltered?: boolean
  loading?: boolean
}

const ITEMS_PER_PAGE = 50

export function GameList({ games, onEdit, onDelete, isFiltered = false, loading = false }: GameListProps) {
  const t = useTranslations('games')
  const tCommon = useTranslations('common')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedGames = useMemo(() => games.slice(startIndex, endIndex), [games, startIndex, endIndex])

  // Reset to page 1 when games change (e.g., filters applied)
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [games.length, currentPage, totalPages])

  const handleDeleteClick = (id: string) => {
    const game = games.find(g => g.id === id)
    if (game) {
      setGameToDelete(game)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return

    setDeleting(true)
    try {
      await onDelete(gameToDelete.id)
      setDeleteDialogOpen(false)
      setGameToDelete(null)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setGameToDelete(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center mb-4">
            {isFiltered
              ? t('noGamesFiltered')
              : t('noGamesYet')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
        {paginatedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            isDuplicate={hasDuplicates(game, games)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('previous')}
          </Button>
          <div className="text-sm text-muted-foreground px-4">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {tCommon('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirm')}</DialogTitle>
            <DialogDescription>
              {t('deleteConfirmMessage', { title: gameToDelete?.title || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? t('deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
