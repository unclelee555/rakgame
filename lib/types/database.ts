// Database types will be generated from Supabase schema
// For now, we'll define basic types that match our schema

export type Currency = 'THB' | 'AUD' | 'USD' | 'EUR' | 'GBP' | 'JPY'
export type Language = 'en' | 'th'
export type Platform = 'Switch' | 'Switch 2' | 'PS5' | 'PS4' | 'Xbox Series X|S' | 'Xbox One' | 'PC' | 'Other'
export type GameType = 'Disc' | 'Digital'
export type Condition = 'New' | 'Used'

export interface User {
  id: string
  email: string
  currency: Currency
  language: Language
  created_at: string
}

export interface Seller {
  id: string
  user_id: string
  name: string
  url?: string
  note?: string
  created_at: string
}

export interface Game {
  id: string
  user_id: string
  seller_id: string | null
  title: string
  platform: Platform
  type: GameType
  price: number
  purchase_date: string
  region?: string
  condition?: Condition
  notes?: string
  image_url?: string
  created_at: string
  seller?: Seller
}

export interface SpendingAnalytics {
  total: number
  currency: Currency
  byPlatform: Record<Platform, number>
  bySeller: Record<string, number>
  byMonth: Record<string, number>
  gameCount: number
}
