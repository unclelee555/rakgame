import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('dashboard')
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{t('title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('welcomeBack')}, {user.email}!
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('totalGames')}</CardTitle>
            <CardDescription>{t('totalGamesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('totalSpent')}</CardTitle>
            <CardDescription>{t('totalSpentDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">฿0.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sellers')}</CardTitle>
            <CardDescription>{t('sellersDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t('gettingStarted')}</CardTitle>
          <CardDescription className="text-sm">{t('gettingStartedDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('addGamesMessage')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
