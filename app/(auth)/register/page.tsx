import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Register - RakGame',
  description: 'Create a new RakGame account',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Start managing your game collection
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
