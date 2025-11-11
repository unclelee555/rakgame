'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Game } from '@/lib/types/database'
import { toast } from 'sonner'
import { useOnlineStatus } from './use-online-status'
import { syncQueue } from '@/lib/utils/sync-queue'
import { useErrorHandler, DatabaseError, NetworkError, ValidationError } from './use-error-handler'

const fetcher = async () => {
  const supabase = createClient()
  const { data, error: fetchError } = await supabase
    .from('games')
    .select(`
      *,
      seller:sellers(*)
    `)
    .order('purchase_date', { ascending: false })

  if (fetchError) {
    throw new DatabaseError(fetchError.message, fetchError.code)
  }

  return data || []
}

export function useGames() {
  const { data: games = [], error, isLoading, mutate } = useSWR<Game[]>('games', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })
  
  const [localGames, setLocalGames] = useState<Game[]>([])
  const isOnline = useOnlineStatus()
  const supabase = createClient()
  const { handleError } = useErrorHandler()

  // Sync local state with SWR data
  useEffect(() => {
    setLocalGames(games)
  }, [games])

  const fetchGames = async () => {
    await mutate()
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ValidationError('Not authenticated')

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        const error = new ValidationError('Image size must be less than 5MB')
        handleError(error)
        return null
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        const error = new ValidationError('File must be an image')
        handleError(error)
        return null
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(fileName, file)

      if (uploadError) throw new NetworkError(uploadError.message)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload image')
      handleError(error)
      return null
    }
  }

  const createGame = async (game: Omit<Game, 'id' | 'user_id' | 'created_at' | 'seller'>, imageFile?: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new ValidationError('Not authenticated')

      let image_url = game.image_url

      // Upload image if provided (only when online)
      if (imageFile && isOnline) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          image_url = uploadedUrl
        }
      }

      // If offline, queue the operation
      if (!isOnline) {
        const optimisticGame: Game = {
          ...game,
          id: `temp-${Date.now()}`,
          user_id: user.id,
          image_url,
          created_at: new Date().toISOString(),
          seller: undefined
        }
        
        setLocalGames(prev => [optimisticGame, ...prev])
        syncQueue.add({ type: 'create_game', data: { ...game, image_url } })
        toast.info('Game will be synced when online')
        return optimisticGame
      }

      // Optimistic update
      const optimisticGame: Game = {
        ...game,
        id: `temp-${Date.now()}`,
        user_id: user.id,
        image_url,
        created_at: new Date().toISOString(),
        seller: undefined
      }
      setLocalGames(prev => [optimisticGame, ...prev])

      const { data, error: insertError } = await supabase
        .from('games')
        .insert([{ 
          ...game, 
          user_id: user.id,
          image_url 
        }])
        .select(`
          *,
          seller:sellers(*)
        `)
        .single()

      if (insertError) throw new DatabaseError(insertError.message, insertError.code)

      // Replace optimistic update with real data and revalidate
      setLocalGames(prev => prev.map(g => g.id === optimisticGame.id ? data : g))
      await mutate()
      toast.success('Game added successfully')
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add game')
      handleError(error)
      throw error
    }
  }

  const updateGame = async (
    id: string, 
    updates: Partial<Omit<Game, 'id' | 'user_id' | 'created_at' | 'seller'>>,
    imageFile?: File
  ) => {
    try {
      let image_url = updates.image_url

      // Upload new image if provided (only when online)
      if (imageFile && isOnline) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          image_url = uploadedUrl
        }
      }

      // If offline, queue the operation
      if (!isOnline) {
        setLocalGames(prev => 
          prev.map(g => g.id === id ? { ...g, ...updates, image_url } : g)
        )
        syncQueue.add({ type: 'update_game', id, data: { ...updates, image_url } })
        toast.info('Changes will be synced when online')
        return
      }

      // Optimistic update
      setLocalGames(prev => 
        prev.map(g => g.id === id ? { ...g, ...updates, image_url } : g)
      )

      const { data, error: updateError } = await supabase
        .from('games')
        .update({ ...updates, image_url })
        .eq('id', id)
        .select(`
          *,
          seller:sellers(*)
        `)
        .single()

      if (updateError) throw new DatabaseError(updateError.message, updateError.code)

      // Replace optimistic update with real data and revalidate
      setLocalGames(prev => 
        prev.map(g => g.id === id ? data : g)
      )
      await mutate()
      toast.success('Game updated successfully')
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update game')
      handleError(error)
      throw error
    }
  }

  const deleteGame = async (id: string) => {
    try {
      // If offline, queue the operation
      if (!isOnline) {
        setLocalGames(prev => prev.filter(g => g.id !== id))
        syncQueue.add({ type: 'delete_game', id })
        toast.info('Deletion will be synced when online')
        return
      }

      // Optimistic update
      setLocalGames(prev => prev.filter(g => g.id !== id))

      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .eq('id', id)

      if (deleteError) throw new DatabaseError(deleteError.message, deleteError.code)

      await mutate()
      toast.success('Game deleted successfully')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete game')
      handleError(error)
      // Revert optimistic update on error
      await mutate()
      throw error
    }
  }

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel('games_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'games'
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
          table: 'games'
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
          table: 'games'
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
    games: localGames,
    loading: isLoading,
    error: error || null,
    createGame,
    updateGame,
    deleteGame,
    refetch: fetchGames
  }
}
