'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useErrorHandler, AuthError, ValidationError } from '@/lib/hooks/use-error-handler'
import { toast } from 'sonner'

export function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      const validationError = new ValidationError(passwordError)
      setError(validationError.message)
      handleError(validationError, { showToast: false })
      return
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      const validationError = new ValidationError('Passwords do not match')
      setError(validationError.message)
      handleError(validationError, { showToast: false })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        const authError = new AuthError(signUpError.message)
        setError(authError.message)
        handleError(authError, { showToast: false })
        setLoading(false)
        return
      }

      if (!authData.user) {
        const authError = new AuthError('Failed to create account')
        setError(authError.message)
        handleError(authError, { showToast: false })
        setLoading(false)
        return
      }

      // Initialize user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          currency: 'THB',
          language: 'th',
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't block registration if profile creation fails
        // The user can still use the app
      }

      toast.success('Account created successfully')
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
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
