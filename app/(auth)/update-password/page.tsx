import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export const metadata: Metadata = {
  title: 'Update Password - RakGame',
  description: 'Set your new password',
}

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Set new password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
