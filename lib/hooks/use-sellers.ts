'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Seller } from '@/lib/types/database'
import { toast } from 'sonner'
import { useOnlineStatus } from './use-online-status'
import { syncQueue } from '@/lib/utils/sync-queue'
import { useErrorHandler, DatabaseError, ValidationError } from './use-error-handler'

const fetcher = async () => {
  const supabase = createClient()
  const { data, error: fetchError } = await supabase
    .from('sellers')
    .select('*')
    .order('name', { ascending: true })

  if (fetchError) throw new DatabaseError(fetchError.message, fetchError.code)

  return data || []
}

export function useSellers() {
  const { data: sellers = [], error, isLoading, mutate } = useSWR<Seller[]>('sellers', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })
  
  const [localSellers, setLocalSellers] = useState<Seller[]>([])
  const isOnline = useOnlineStatus()
  const supabase = createClient()
  const { handleError } = useErrorHandler()

  // Sync local state with SWR data
  useEffect(() => {
    setLocalSellers(sellers)
  }, [sellers])

  const fetchSellers = async () => {
    await mutate()
  }

  const createSeller = async (seller: Omit<Seller, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ValidationError('Not authenticated')

      // If offline, queue the operation
      if (!isOnline) {
        const optimisticSeller: Seller = {
          ...seller,
          id: `temp-${Date.now()}`,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
        
        setLocalSellers(prev => [...prev, optimisticSeller].sort((a, b) => a.name.localeCompare(b.name)))
        syncQueue.add({ type: 'create_seller', data: seller })
        toast.info('Seller will be synced when online')
        return optimisticSeller
      }

      // Optimistic update
      const optimisticSeller: Seller = {
        ...seller,
        id: `temp-${Date.now()}`,
        user_id: user.id,
        created_at: new Date().toISOString()
      }
      setLocalSellers(prev => [...prev, optimisticSeller].sort((a, b) => a.name.localeCompare(b.name)))

      const { data, error: insertError } = await supabase
        .from('sellers')
        .insert([{ ...seller, user_id: user.id }])
        .select()
        .single()

      if (insertError) throw new DatabaseError(insertError.message, insertError.code)

      // Replace optimistic update with real data and revalidate
      setLocalSellers(prev => prev.map(s => s.id === optimisticSeller.id ? data : s).sort((a, b) => a.name.localeCompare(b.name)))
      await mutate()
      toast.success('Seller created successfully')
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create seller')
      handleError(error)
      throw error
    }
  }

  const updateSeller = async (id: string, updates: Partial<Omit<Seller, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      // If offline, queue the operation
      if (!isOnline) {
        setLocalSellers(prev => 
          prev.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.name.localeCompare(b.name))
        )
        syncQueue.add({ type: 'update_seller', id, data: updates })
        toast.info('Changes will be synced when online')
        return
      }

      // Optimistic update
      setLocalSellers(prev => 
        prev.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => a.name.localeCompare(b.name))
      )

      const { data, error: updateError } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw new DatabaseError(updateError.message, updateError.code)

      // Replace optimistic update with real data and revalidate
      setLocalSellers(prev => 
        prev.map(s => s.id === id ? data : s).sort((a, b) => a.name.localeCompare(b.name))
      )
      await mutate()
      toast.success('Seller updated successfully')
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update seller')
      handleError(error)
      throw error
    }
  }

  const deleteSeller = async (id: string) => {
    try {
      // If offline, queue the operation
      if (!isOnline) {
        setLocalSellers(prev => prev.filter(s => s.id !== id))
        syncQueue.add({ type: 'delete_seller', id })
        toast.info('Deletion will be synced when online')
        return
      }

      // Optimistic update
      setLocalSellers(prev => prev.filter(s => s.id !== id))

      const { error: deleteError } = await supabase
        .from('sellers')
        .delete()
        .eq('id', id)

      if (deleteError) throw new DatabaseError(deleteError.message, deleteError.code)

      await mutate()
      toast.success('Seller deleted successfully')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete seller')
      handleError(error)
      // Revert optimistic update on error
      await mutate()
      throw error
    }
  }

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel('sellers_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sellers'
        },
        () => {
          mutate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sellers'
        },
        () => {
          mutate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sellers'
        },
        () => {
          mutate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate, supabase])

  return {
    sellers: localSellers,
    loading: isLoading,
    error: error || null,
    createSeller,
    updateSeller,
    deleteSeller,
    refetch: fetchSellers
  }
}
