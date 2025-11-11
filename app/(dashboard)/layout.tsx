import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ErrorBoundary } from '@/components/error-boundary'
import { OfflineIndicator } from '@/components/layout/offline-indicator'
import { SyncManager } from '@/components/layout/sync-manager'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Header user={user} />
        <main className="p-3 sm:p-4 lg:p-6 pb-safe">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <SyncManager />
      <OfflineIndicator />
    </div>
  )
}
