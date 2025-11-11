'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from '@/lib/hooks/use-translations'
import { useErrorHandler, AuthError } from '@/lib/hooks/use-error-handler'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('auth')
  const { handleError } = useErrorHandler()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        const authError = new AuthError(
          signInError.message === 'Invalid login credentials'
            ? 'Invalid email or password'
            : signInError.message
        )
        setError(authError.message)
        handleError(authError, { showToast: false })
        setLoading(false)
        return
      }

      toast.success('Signed in successfully')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred')
      setError(error.message)
      handleError(error, { showToast: false })
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 touch-manipulation text-base"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 touch-manipulation text-base"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/reset-password"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors touch-manipulation min-h-[44px]"
        >
          {loading ? `${t('signIn')}...` : t('signIn')}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('dontHaveAccount')}{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            {t('signUp')}
          </Link>
        </p>
      </form>
    </div>
  )
}
