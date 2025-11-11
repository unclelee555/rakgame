import type { Game } from '@/lib/types/database'
import type { GameFilters } from '@/components/games/game-filters'

export function filterAndSortGames(games: Game[], filters: GameFilters): Game[] {
  let filtered = [...games]

  // Apply search filter (case-insensitive)
  if (filters.search.trim()) {
    const searchLower = filters.search.toLowerCase().trim()
    filtered = filtered.filter((game) =>
      game.title.toLowerCase().includes(searchLower)
    )
  }

  // Apply platform filter
  if (filters.platform !== 'all') {
    filtered = filtered.filter((game) => game.platform === filters.platform)
  }

  // Apply type filter
  if (filters.type !== 'all') {
    filtered = filtered.filter((game) => game.type === filters.type)
  }

  // Apply region filter
  if (filters.region !== 'all') {
    filtered = filtered.filter((game) => {
      if (!game.region) return false
      return game.region === filters.region
    })
  }

  // Apply condition filter
  if (filters.condition !== 'all') {
    if (filters.condition === 'any') {
      // Show games with no condition specified
      filtered = filtered.filter((game) => !game.condition)
    } else {
      // Show games with specific condition
      filtered = filtered.filter((game) => game.condition === filters.condition)
    }
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0

    switch (filters.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'date':
        comparison = new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
        break
      case 'price':
        comparison = a.price - b.price
        break
      case 'platform':
        comparison = a.platform.localeCompare(b.platform)
        break
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison
  })

  return filtered
}
