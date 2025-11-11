'use client'

import { createClient } from '@/lib/supabase/client'
import type { Game, Seller } from '@/lib/types/database'

export type SyncOperation = 
  | { type: 'create_game'; data: Omit<Game, 'id' | 'user_id' | 'created_at' | 'seller'> }
  | { type: 'update_game'; id: string; data: Partial<Omit<Game, 'id' | 'user_id' | 'created_at' | 'seller'>> }
  | { type: 'delete_game'; id: string }
  | { type: 'create_seller'; data: Omit<Seller, 'id' | 'user_id' | 'created_at'> }
  | { type: 'update_seller'; id: string; data: Partial<Omit<Seller, 'id' | 'user_id' | 'created_at'>> }
  | { type: 'delete_seller'; id: string }

interface QueuedOperation {
  id: string
  operation: SyncOperation
  timestamp: number
  retries: number
}

const QUEUE_KEY = 'rakgame_sync_queue'
const MAX_RETRIES = 3

class SyncQueue {
  private queue: QueuedOperation[] = []
  private processing = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue()
    }
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading sync queue:', error)
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      console.error('Error saving sync queue:', error)
    }
  }

  add(operation: SyncOperation) {
    const queuedOp: QueuedOperation = {
      id: crypto.randomUUID(),
      operation,
      timestamp: Date.now(),
      retries: 0
    }
    this.queue.push(queuedOp)
    this.saveQueue()
  }

  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.processing || this.queue.length === 0) {
      return { success: 0, failed: 0 }
    }

    this.processing = true
    const supabase = createClient()
    let success = 0
    let failed = 0

    const operations = [...this.queue]
    this.queue = []

    for (const queuedOp of operations) {
      try {
        await this.executeOperation(supabase, queuedOp.operation)
        success++
      } catch (error) {
        console.error('Error processing queued operation:', error)
        queuedOp.retries++
        
        if (queuedOp.retries < MAX_RETRIES) {
          this.queue.push(queuedOp)
        } else {
          failed++
        }
      }
    }

    this.saveQueue()
    this.processing = false

    return { success, failed }
  }

  private async executeOperation(supabase: any, operation: SyncOperation) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    switch (operation.type) {
      case 'create_game':
        await supabase
          .from('games')
          .insert([{ ...operation.data, user_id: user.id }])
        break

      case 'update_game':
        await supabase
          .from('games')
          .update(operation.data)
          .eq('id', operation.id)
        break

      case 'delete_game':
        await supabase
          .from('games')
          .delete()
          .eq('id', operation.id)
        break

      case 'create_seller':
        await supabase
          .from('sellers')
          .insert([{ ...operation.data, user_id: user.id }])
        break

      case 'update_seller':
        await supabase
          .from('sellers')
          .update(operation.data)
          .eq('id', operation.id)
        break

      case 'delete_seller':
        await supabase
          .from('sellers')
          .delete()
          .eq('id', operation.id)
        break
    }
  }

  getQueueLength(): number {
    return this.queue.length
  }

  clear() {
    this.queue = []
    this.saveQueue()
  }
}

export const syncQueue = new SyncQueue()
