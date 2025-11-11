'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import type { Language } from '@/lib/types/database'

const languages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'th' as Language, name: 'Thai', nativeName: 'ไทย' },
]

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { profile, language } = useUserProfile()
  const supabase = createClient()

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      // Set cookie for immediate UI update
      document.cookie = `NEXT_LOCALE=${newLanguage}; path=/; max-age=31536000`

      // Update user profile in database if user is logged in
      if (profile) {
        const { error } = await supabase
          .from('users')
          .update({ language: newLanguage })
          .eq('id', profile.id)

        if (error) {
          console.error('Error updating language preference:', error)
        }
      }

      // Refresh the page to apply new language
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="relative"
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={language === lang.code ? 'bg-accent' : ''}
          >
            <span className="flex items-center gap-2">
              {lang.nativeName}
              {language === lang.code && (
                <span className="text-xs text-muted-foreground">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
