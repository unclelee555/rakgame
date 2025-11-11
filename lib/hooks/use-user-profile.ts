'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Currency, Language } from '@/lib/types/database'

export function useUserProfile() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) throw error

        setProfile(data)

        // Sync language preference to cookie on login
        if (data?.language) {
          const currentLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('NEXT_LOCALE='))
            ?.split('=')[1]

          if (currentLocale !== data.language) {
            document.cookie = `NEXT_LOCALE=${data.language}; path=/; max-age=31536000`
            // Refresh to apply language change
            window.location.reload()
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  return {
    profile,
    loading,
    currency: profile?.currency || 'THB',
    language: profile?.language || 'en'
  }
}
