'use client'

import { useMemo } from 'react'
import type { Game, Currency, Platform, SpendingAnalytics } from '@/lib/types/database'

interface MonthlySpending {
  month: string
  amount: number
}

interface PlatformSpending {
  platform: Platform
  amount: number
}

interface SellerSpending {
  seller: string
  amount: number
}

export function useAnalytics(games: Game[], currency: Currency = 'THB') {
  const analytics = useMemo<SpendingAnalytics>(() => {
    // Calculate total spending
    const total = games.reduce((sum, game) => sum + Number(game.price), 0)

    // Calculate spending by platform
    const byPlatform = games.reduce((acc, game) => {
      const platform = game.platform
      acc[platform] = (acc[platform] || 0) + Number(game.price)
      return acc
    }, {} as Record<Platform, number>)

    // Calculate spending by seller
    const bySeller = games.reduce((acc, game) => {
      const sellerName = game.seller?.name || 'Unknown'
      acc[sellerName] = (acc[sellerName] || 0) + Number(game.price)
      return acc
    }, {} as Record<string, number>)

    // Calculate spending by month
    const byMonth = games.reduce((acc, game) => {
      const date = new Date(game.purchase_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + Number(game.price)
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      currency,
      byPlatform,
      bySeller,
      byMonth,
      gameCount: games.length
    }
  }, [games, currency])

  // Format data for charts
  const platformChartData = useMemo<PlatformSpending[]>(() => {
    return Object.entries(analytics.byPlatform)
      .map(([platform, amount]) => ({
        platform: platform as Platform,
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [analytics.byPlatform])

  const sellerChartData = useMemo<SellerSpending[]>(() => {
    return Object.entries(analytics.bySeller)
      .map(([seller, amount]) => ({
        seller,
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [analytics.bySeller])

  const monthlyChartData = useMemo<MonthlySpending[]>(() => {
    return Object.entries(analytics.byMonth)
      .map(([month, amount]) => ({
        month,
        amount
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [analytics.byMonth])

  return {
    analytics,
    platformChartData,
    sellerChartData,
    monthlyChartData
  }
}
