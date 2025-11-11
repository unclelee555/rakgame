'use client'

import { toast } from 'sonner'
import { useCallback } from 'react'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  onRetry?: () => void | Promise<void>
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      onRetry
    } = options

    if (logError) {
      console.error('Error:', error)
    }

    // Handle different error types
    if (error instanceof AuthError) {
      if (showToast) {
        toast.error('Authentication Error', {
          description: error.message,
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry
          } : undefined
        })
      }
      return
    }

    if (error instanceof ValidationError) {
      if (showToast) {
        toast.error('Validation Error', {
          description: error.message
        })
      }
      return
    }

    if (error instanceof NetworkError) {
      if (showToast) {
        toast.error('Network Error', {
          description: error.message,
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry
          } : undefined
        })
      }
      return
    }

    if (error instanceof DatabaseError) {
      if (showToast) {
        let description = error.message

        // Handle specific database error codes
        switch (error.code) {
          case '23505':
            description = 'This record already exists'
            break
          case '23503':
            description = 'Cannot delete: related records exist'
            break
          case '42501':
            description = 'You do not have permission to perform this action'
            break
          case 'PGRST116':
            description = 'No records found'
            break
        }

        toast.error('Database Error', {
          description,
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry
          } : undefined
        })
      }
      return
    }

    // Handle Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as { code: string; message: string }
      
      if (showToast) {
        let description = supabaseError.message

        // Handle specific Supabase error codes
        if (supabaseError.code === 'invalid_credentials') {
          description = 'Invalid email or password'
        } else if (supabaseError.code === 'email_exists') {
          description = 'An account with this email already exists'
        } else if (supabaseError.code === 'weak_password') {
          description = 'Password must be at least 6 characters'
        } else if (supabaseError.code === 'user_not_found') {
          description = 'No account found with this email'
        }

        toast.error('Error', {
          description,
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry
          } : undefined
        })
      }
      return
    }

    // Handle generic errors
    if (error instanceof Error) {
      if (showToast) {
        toast.error('Error', {
          description: error.message || 'An unexpected error occurred',
          action: onRetry ? {
            label: 'Retry',
            onClick: onRetry
          } : undefined
        })
      }
      return
    }

    // Handle unknown errors
    if (showToast) {
      toast.error('Error', {
        description: 'An unexpected error occurred. Please try again.',
        action: onRetry ? {
          label: 'Retry',
          onClick: onRetry
        } : undefined
      })
    }
  }, [])

  return { handleError }
}
