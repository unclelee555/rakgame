'use client'

import { useEffect, useRef } from 'react'
import { useOnlineStatus } from './use-online-status'
import { syncQueue } from '@/lib/utils/sync-queue'
import { toast } from 'sonner'

export function useSyncManager() {
  const isOnline = useOnlineStatus()
  const previousOnlineStatus = useRef(isOnline)
  const syncInProgress = useRef(false)

  useEffect(() => {
    // Detect when coming back online
    if (isOnline && !previousOnlineStatus.current && !syncInProgress.current) {
      const queueLength = syncQueue.getQueueLength()
      
      if (queueLength > 0) {
        syncInProgress.current = true
        
        // Small delay to ensure connection is stable
        setTimeout(() => {
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
              syncInProgress.current = false
            })
        }, 1000)
      }
    }

    previousOnlineStatus.current = isOnline
  }, [isOnline])
}
