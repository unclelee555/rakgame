import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password - RakGame',
  description: 'Reset your RakGame password',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
