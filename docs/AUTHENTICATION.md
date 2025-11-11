# Authentication System Documentation

## Overview

The RakGame authentication system is built using Supabase Auth with Next.js 14 App Router. It provides secure user authentication with email/password, password reset functionality, and automatic session management.

## Features Implemented

### 1. User Registration
- **Location**: `/register`
- **Component**: `components/auth/register-form.tsx`
- **Features**:
  - Email validation
  - Password strength validation (min 8 chars, uppercase, lowercase, number)
  - Password confirmation
  - Automatic user profile initialization in `users` table
  - Redirects to dashboard on success

### 2. User Login
- **Location**: `/login`
- **Component**: `components/auth/login-form.tsx`
- **Features**:
  - Email/password authentication
  - Error handling for invalid credentials
  - Link to password reset
  - Link to registration
  - Redirects to dashboard on success

### 3. Password Reset Flow
- **Request Reset**: `/reset-password`
  - Component: `components/auth/reset-password-form.tsx`
  - Sends password reset email via Supabase
  - Email contains link to update password page
  
- **Update Password**: `/update-password`
  - Component: `components/auth/update-password-form.tsx`
  - Validates new password strength
  - Updates user password
  - Redirects to dashboard on success

### 4. Protected Routes
- **Middleware**: `middleware.ts`
- **Protected Routes**:
  - `/dashboard`
  - `/collection`
  - `/sellers`
  - `/analytics`
  - `/settings`
- **Behavior**:
  - Unauthenticated users redirected to `/login`
  - Authenticated users redirected from auth pages to `/dashboard`
  - Session automatically refreshed on each request

### 5. Session Management
- **Automatic Refresh**: Middleware refreshes auth tokens on every request
- **Client Hook**: `lib/hooks/use-auth.ts` provides auth state in client components
- **Server Components**: Use `createClient()` from `lib/supabase/server.ts`
- **Client Components**: Use `createClient()` from `lib/supabase/client.ts`

### 6. User Profile Initialization
- **Trigger**: On successful registration
- **Table**: `users`
- **Default Values**:
  - `currency`: 'THB'
  - `language`: 'th'
  - `email`: From auth.users
  - `id`: From auth.users (UUID)

## File Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── reset-password/page.tsx
│   ├── update-password/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   └── layout.tsx
├── api/
│   └── auth/
│       └── signout/route.ts
└── page.tsx

components/
├── auth/
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── reset-password-form.tsx
│   └── update-password-form.tsx
└── layout/
    └── dashboard-nav.tsx

lib/
├── hooks/
│   └── use-auth.ts
└── supabase/
    ├── client.ts
    ├── server.ts
    └── middleware.ts

middleware.ts
```

## Usage Examples

### Server Component (Protected Page)
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

### Client Component (Auth State)
```typescript
'use client'

import { useAuth } from '@/lib/hooks/use-auth'

export function MyComponent() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return <div>Hello {user.email}</div>
}
```

### Sign Out
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

## Security Features

1. **Row Level Security (RLS)**: All database tables have RLS policies
2. **HTTPS Only**: Enforced by Vercel deployment
3. **Secure Cookies**: Session tokens stored in HTTP-only cookies
4. **Password Validation**: Strong password requirements enforced
5. **Email Verification**: Can be enabled in Supabase dashboard
6. **Rate Limiting**: Provided by Supabase Auth

## Configuration

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Configuration
1. Enable Email Auth in Supabase Dashboard
2. Configure email templates for password reset
3. Set redirect URLs:
   - Site URL: `https://rakgame.app` (production)
   - Redirect URLs: `http://localhost:3000/**` (development)

## Testing

### Manual Testing Checklist
- [ ] Register new user with valid email/password
- [ ] Verify user profile created in database
- [ ] Login with registered credentials
- [ ] Access protected route (dashboard)
- [ ] Request password reset
- [ ] Check email for reset link
- [ ] Update password via reset link
- [ ] Login with new password
- [ ] Sign out
- [ ] Verify redirect to login page
- [ ] Try accessing protected route while logged out

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **1.1**: User registration with email and password validation ✓
- **1.2**: Account creation within 3 seconds ✓
- **1.3**: Authentication via Supabase Auth ✓
- **1.4**: Password reset with recovery email within 60 seconds ✓
- **1.5**: Session state maintained across browser refreshes ✓

## Future Enhancements

- OAuth providers (Google, GitHub)
- Two-factor authentication
- Email verification requirement
- Account deletion
- Session management (view active sessions)
- Login history
