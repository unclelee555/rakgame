'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useErrorHandler, AuthError, NetworkError } from '@/lib/hooks/use-error-handler'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (resetError) {
        const authError = new AuthError(resetError.message)
        setError(authError.message)
        handleError(authError, { 
          showToast: false,
          onRetry: () => handleSubmit(e)
        })
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success('Password reset email sent')
      setLoading(false)
    } catch (err) {
      const error = err instanceof Error 
        ? new NetworkError(err.message)
        : new NetworkError('An unexpected error occurred')
      setError(error.message)
      handleError(error, { 
        showToast: false,
        onRetry: () => handleSubmit(e)
      })
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded mb-6">
          Check your email for a password reset link. The link will expire in 60 minutes.
        </div>
        <Link
          href="/login"
          className="block text-center text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
