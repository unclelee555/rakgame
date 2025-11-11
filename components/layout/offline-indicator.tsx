'use client'

import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import { WifiOff, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'
import { syncQueue } from '@/lib/utils/sync-queue'
import { toast } from 'sonner'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [queueLength, setQueueLength] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Update queue length
    const updateQueueLength = () => {
      setQueueLength(syncQueue.getQueueLength())
    }

    updateQueueLength()
    const interval = setInterval(updateQueueLength, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Process queue when coming back online
    if (isOnline && queueLength > 0 && !isSyncing) {
      setIsSyncing(true)
      
      syncQueue.processQueue()
        .then(({ success, failed }) => {
          if (success > 0) {
            toast.success(`Synced ${success} pending change${success > 1 ? 's' : ''}`)
          }
          if (failed > 0) {
            toast.error(`Failed to sync ${failed} change${failed > 1 ? 's' : ''}`)
          }
        })
        .catch((error) => {
          console.error('Error processing sync queue:', error)
          toast.error('Failed to sync pending changes')
        })
        .finally(() => {
          setIsSyncing(false)
        })
    }
  }, [isOnline, queueLength, isSyncing])

  if (isOnline && queueLength === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-blue-500 text-white' 
          : 'bg-orange-500 text-white'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : `Syncing ${queueLength} change${queueLength > 1 ? 's' : ''}...`}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              Offline{queueLength > 0 ? ` (${queueLength} pending)` : ''}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
