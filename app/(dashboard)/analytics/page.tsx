'use client'

import dynamic from 'next/dynamic'
import { useGames } from '@/lib/hooks/use-games'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { useAnalytics } from '@/lib/hooks/use-analytics'
import { useTranslations } from '@/lib/hooks/use-translations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'

// Lazy load heavy components
const PlatformChart = dynamic(() => import('@/components/analytics').then(mod => ({ default: mod.PlatformChart })), {
  loading: () => <div className="h-[300px] flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
})

const SellerChart = dynamic(() => import('@/components/analytics').then(mod => ({ default: mod.SellerChart })), {
  loading: () => <div className="h-[300px] flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
})

const SpendingTrendsChart = dynamic(() => import('@/components/analytics').then(mod => ({ default: mod.SpendingTrendsChart })), {
  loading: () => <div className="h-[300px] flex items-center justify-center"><LoadingSpinner /></div>,
  ssr: false
})

const ExportButton = dynamic(() => import('@/components/export-button').then(mod => ({ default: mod.ExportButton })), {
  loading: () => <Button variant="outline" disabled>Export</Button>,
  ssr: false
})

export default function AnalyticsPage() {
  const t = useTranslations('analytics')
  const tCommon = useTranslations('common')
  const { games, loading: gamesLoading, error: gamesError, refetch } = useGames()
  const { currency, loading: profileLoading } = useUserProfile()
  const { analytics, platformChartData, sellerChartData, monthlyChartData } = useAnalytics(games, currency)

  const loading = gamesLoading || profileLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (gamesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{gamesError.message}</p>
          <Button onClick={refetch}>{tCommon('tryAgain')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{t('title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t('description')}</p>
        </div>
        <ExportButton disabled={games.length === 0} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">{t('totalSpending')}</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              {currency} {analytics.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('across')} {analytics.gameCount} {analytics.gameCount === 1 ? t('game') : t('gamesPlural')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">{t('averagePrice')}</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              {currency} {analytics.gameCount > 0 
                ? (analytics.total / analytics.gameCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('perGame')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">{t('gameCount')}</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              {analytics.gameCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('inYourCollection')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analytics.gameCount > 0 ? (
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('byPlatform')}</CardTitle>
              <CardDescription>
                {t('byPlatformDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformChart data={platformChartData} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('bySeller')}</CardTitle>
              <CardDescription>
                {t('bySellerDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SellerChart data={sellerChartData} currency={currency} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('trends')}</CardTitle>
              <CardDescription>
                {t('trendsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingTrendsChart data={monthlyChartData} currency={currency} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">{t('noData')}</p>
              <p className="text-sm text-muted-foreground">
                {t('addGamesToSeeAnalytics')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
