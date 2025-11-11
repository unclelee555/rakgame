import type { Game, Platform } from '@/lib/types/database'

export interface DuplicateGame {
  id: string
  title: string
  platform: Platform
  price: number
  purchase_date: string
  seller?: {
    name: string
  }
}

/**
 * Check if a game is a potential duplicate based on case-insensitive title and platform match
 */
export function findDuplicates(
  title: string,
  platform: Platform,
  games: Game[],
  excludeId?: string
): DuplicateGame[] {
  const normalizedTitle = title.trim().toLowerCase()
  
  return games
    .filter(game => {
      // Exclude the game being edited
      if (excludeId && game.id === excludeId) {
        return false
      }
      
      // Case-insensitive title match and exact platform match
      return (
        game.title.trim().toLowerCase() === normalizedTitle &&
        game.platform === platform
      )
    })
    .map(game => ({
      id: game.id,
      title: game.title,
      platform: game.platform,
      price: game.price,
      purchase_date: game.purchase_date,
      seller: game.seller
    }))
}

/**
 * Check if a game has duplicates in the collection
 */
export function hasDuplicates(game: Game, allGames: Game[]): boolean {
  const duplicates = findDuplicates(game.title, game.platform, allGames, game.id)
  return duplicates.length > 0
}
