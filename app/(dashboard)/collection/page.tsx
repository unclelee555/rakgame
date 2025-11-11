'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useGames } from '@/lib/hooks/use-games'
import { useSellers } from '@/lib/hooks/use-sellers'
import { useTranslations } from '@/lib/hooks/use-translations'
import { GameForm } from '@/components/games/game-form'
import { GameList } from '@/components/games/game-list'
import { GameFiltersComponent, type GameFilters } from '@/components/games/game-filters'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { filterAndSortGames } from '@/lib/utils/game-filters'
import type { Game } from '@/lib/types/database'

// Lazy load export button (includes PDF generation)
const ExportButton = dynamic(() => import('@/components/export-button').then(mod => ({ default: mod.ExportButton })), {
  loading: () => <Button variant="outline" disabled>Export</Button>,
  ssr: false
})

export default function CollectionPage() {
  const t = useTranslations('games')
  const tCommon = useTranslations('common')
  const { games, loading: gamesLoading, error: gamesError, createGame, updateGame, deleteGame, refetch: refetchGames } = useGames()
  const { sellers, loading: sellersLoading, error: sellersError, createSeller, refetch: refetchSellers } = useSellers()
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | undefined>()
  const [filters, setFilters] = useState<GameFilters>({
    search: '',
    platform: 'all',
    type: 'all',
    region: 'all',
    condition: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Apply filters and sorting
  const filteredGames = useMemo(() => {
    return filterAndSortGames(games, filters)
  }, [games, filters])

  // Check if any filters are active
  const hasActiveFilters = 
    filters.search.trim() !== '' ||
    filters.platform !== 'all' ||
    filters.type !== 'all' ||
    filters.region !== 'all' ||
    filters.condition !== 'all'

  const handleCreate = () => {
    setEditingGame(undefined)
    setShowForm(true)
  }

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    setShowForm(true)
  }

  const handleSubmit = async (
    data: Omit<Game, 'id' | 'user_id' | 'created_at' | 'seller'>,
    imageFile?: File
  ) => {
    if (editingGame) {
      await updateGame(editingGame.id, data, imageFile)
    } else {
      await createGame(data, imageFile)
    }
  }

  const handleFormClose = (open: boolean) => {
    setShowForm(open)
    if (!open) {
      setEditingGame(undefined)
    }
  }

  if (gamesLoading || sellersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (gamesError || sellersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">
            {gamesError?.message || sellersError?.message || tCommon('failedToLoad')}
          </p>
          <Button onClick={() => {
            if (gamesError) refetchGames()
            if (sellersError) refetchSellers()
          }}>
            {tCommon('tryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('myCollection')}</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            {hasActiveFilters ? (
              <>
                {t('showing')} {filteredGames.length} {t('of')} {games.length} {games.length === 1 ? t('game') : t('gamesPlural')}
              </>
            ) : (
              <>
                {games.length} {games.length === 1 ? t('game') : t('gamesPlural')} {t('inYourCollection')}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <ExportButton disabled={games.length === 0} />
          <Button onClick={handleCreate} className="min-h-[44px] touch-manipulation flex-1 sm:flex-none">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('addGame')}</span>
            <span className="sm:hidden">{t('add')}</span>
          </Button>
        </div>
      </div>

      <GameFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      <GameList
        games={filteredGames}
        onEdit={handleEdit}
        onDelete={deleteGame}
        isFiltered={hasActiveFilters}
        loading={gamesLoading}
      />

      <GameForm
        game={editingGame}
        sellers={sellers}
        allGames={games}
        open={showForm}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        onCreateSeller={createSeller}
      />
    </div>
  )
}
