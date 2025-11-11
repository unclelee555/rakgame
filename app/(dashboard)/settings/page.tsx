'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserProfile } from '@/lib/hooks/use-user-profile'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTranslations } from '@/lib/hooks/use-translations'
import type { Currency, Language } from '@/lib/types/database'

const currencies: { value: Currency; label: string }[] = [
  { value: 'THB', label: 'Thai Baht (฿)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
]

const languages: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'th', label: 'ไทย (Thai)' },
]

export default function SettingsPage() {
  const { profile, loading, currency, language } = useUserProfile()
  const { theme, setTheme } = useTheme()
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currency)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language)
  const [isSaving, setIsSaving] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          currency: selectedCurrency,
          language: selectedLanguage,
        })
        .eq('id', profile.id)

      if (error) throw error

      // Update language cookie if changed
      if (selectedLanguage !== language) {
        document.cookie = `NEXT_LOCALE=${selectedLanguage}; path=/; max-age=31536000`
      }

      toast.success(t('updateSuccess'))
      
      // Refresh to apply changes
      router.refresh()
      
      // Reload if language changed
      if (selectedLanguage !== language) {
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error(t('updateError'))
    } finally {
      setIsSaving(false)
    }
  }

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return tAuth('passwordTooShort')
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate new password
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      toast.error(tAuth('passwordsDontMatch'))
      return
    }

    setIsChangingPassword(true)
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: currentPassword,
      })

      if (signInError) {
        toast.error('Current password is incorrect')
        setIsChangingPassword(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast.success(tAuth('passwordUpdated'))
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{t('title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t('preferences')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences')}</CardTitle>
          <CardDescription>
            Customize your RakGame experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm">{t('currency')}</Label>
            <Select
              value={selectedCurrency}
              onValueChange={(value) => setSelectedCurrency(value as Currency)}
            >
              <SelectTrigger id="currency" className="min-h-[44px] touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm">{t('language')}</Label>
            <Select
              value={selectedLanguage}
              onValueChange={(value) => setSelectedLanguage(value as Language)}
            >
              <SelectTrigger id="language" className="min-h-[44px] touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme" className="text-sm">{t('theme')}</Label>
            <Select
              value={theme}
              onValueChange={setTheme}
            >
              <SelectTrigger id="theme" className="min-h-[44px] touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('light')}</SelectItem>
                <SelectItem value="dark">{t('dark')}</SelectItem>
                <SelectItem value="system">{t('system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || (selectedCurrency === currency && selectedLanguage === language)}
            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
          >
            {isSaving ? `${tCommon('save')}...` : tCommon('save')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('changePassword')}</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              {isChangingPassword ? 'Updating...' : t('changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>{t('account')}</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b gap-1">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{t('email')}</span>
                <span className="text-sm break-all">{profile.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b gap-1">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{t('createdAt')}</span>
                <span className="text-sm">
                  {new Date(profile.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">User ID</span>
                <span className="text-sm font-mono text-xs break-all">{profile.id.slice(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
