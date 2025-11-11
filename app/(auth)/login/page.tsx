import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login - RakGame',
  description: 'Login to your RakGame account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your RakGame account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
