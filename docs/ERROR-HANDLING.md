# Error Handling and Loading States

This document describes the comprehensive error handling and loading state management implemented in the RakGame application.

## Overview

The application implements a robust error handling system that provides clear feedback to users and graceful degradation when errors occur. The system includes:

- Custom error handler hook
- Error boundaries for component failures
- Toast notifications for user feedback
- Loading spinners for async operations
- Specific handling for authentication, validation, database, and network errors

## Error Handler Hook

### Location
`lib/hooks/use-error-handler.ts`

### Custom Error Classes

The system defines specific error types for different scenarios:

```typescript
- AuthError: Authentication-related errors (login, registration, password reset)
- ValidationError: Form validation and input validation errors
- NetworkError: Network connectivity and API request errors
- DatabaseError: Database operations and constraint violations
```

### Usage

```typescript
import { useErrorHandler, ValidationError } from '@/lib/hooks/use-error-handler'

const { handleError } = useErrorHandler()

try {
  // Your code
} catch (err) {
  const error = new ValidationError('Invalid input')
  handleError(error, {
    showToast: true,
    onRetry: () => retryFunction()
  })
}
```

### Features

1. **Automatic Error Classification**: Detects error types and displays appropriate messages
2. **Retry Support**: Optional retry button in toast notifications
3. **Database Error Codes**: Handles specific PostgreSQL error codes:
   - `23505`: Duplicate key violation
   - `23503`: Foreign key constraint violation
   - `42501`: Insufficient privileges
   - `PGRST116`: No records found

4. **Supabase Error Handling**: Recognizes and translates Supabase-specific error codes

## Error Boundaries

### Location
`components/error-boundary.tsx`

### Usage

Error boundaries are already integrated into the dashboard layout:

```tsx
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

### Features

- Catches React component errors
- Displays user-friendly error message
- Provides "Try Again" button to reload the page
- Shows error details in development mode

## Toast Notifications

### Library
The application uses [Sonner](https://sonner.emilkowal.ski/) for toast notifications.

### Toast Types

```typescript
toast.success('Operation completed')
toast.error('Operation failed')
toast.info('Information message')
toast.warning('Warning message')
```

### Toast with Retry Action

```typescript
toast.error('Failed to load data', {
  description: 'Network connection lost',
  action: {
    label: 'Retry',
    onClick: () => refetch()
  }
})
```

## Loading States

### Loading Spinner Component
`components/ui/loading-spinner.tsx`

### Usage in Pages

All data-fetching pages implement loading states:

```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  )
}
```

## Error Handling by Feature

### Authentication

**Files:**
- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`
- `components/auth/reset-password-form.tsx`

**Error Handling:**
- Invalid credentials detection
- Password validation with clear messages
- Email format validation
- Network error handling with retry option
- Success notifications on successful operations

### Game Collection

**File:** `lib/hooks/use-games.ts`

**Error Handling:**
- Database operation errors
- Image upload validation (size, type)
- Network errors during sync
- Optimistic updates with rollback on error
- Offline operation queueing

**Exposed Error State:**
```typescript
const { games, loading, error, refetch } = useGames()
```

### Seller Management

**File:** `lib/hooks/use-sellers.ts`

**Error Handling:**
- Duplicate seller name detection
- Database constraint violations
- Network errors during sync
- Optimistic updates with rollback on error

**Exposed Error State:**
```typescript
const { sellers, loading, error, refetch } = useSellers()
```

### Analytics

**File:** `app/(dashboard)/analytics/page.tsx`

**Error Handling:**
- Data loading errors with retry option
- Graceful degradation when data unavailable

## Error Display Patterns

### Page-Level Error Display

```typescript
if (error) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <p className="text-destructive">{error.message}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    </div>
  )
}
```

### Inline Error Display

Form components display validation errors inline:

```tsx
{error && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
    {error}
  </div>
)}
```

## Network Error Handling

### Offline Detection

The application includes offline detection via `useOnlineStatus` hook:

```typescript
const isOnline = useOnlineStatus()

if (!isOnline) {
  // Queue operation for later sync
  syncQueue.add({ type: 'create_game', data })
  toast.info('Changes will be synced when online')
}
```

### Offline Indicator

Visual indicator shows when the user is offline:
- Component: `components/layout/offline-indicator.tsx`
- Automatically appears when network is unavailable

## Best Practices

### 1. Always Use Error Handler Hook

```typescript
const { handleError } = useErrorHandler()

try {
  await operation()
} catch (err) {
  handleError(err, { onRetry: operation })
}
```

### 2. Provide Retry Options

For network-related errors, always provide a retry option:

```typescript
handleError(error, {
  onRetry: () => fetchData()
})
```

### 3. Use Appropriate Error Types

Choose the correct error class for the situation:

```typescript
// For validation
throw new ValidationError('Email is required')

// For authentication
throw new AuthError('Invalid credentials')

// For network issues
throw new NetworkError('Connection timeout')

// For database issues
throw new DatabaseError('Constraint violation', '23505')
```

### 4. Expose Error State from Hooks

Custom hooks should expose error state:

```typescript
return {
  data,
  loading,
  error,  // Expose error
  refetch // Expose refetch for retry
}
```

### 5. Handle Optimistic Updates

When using optimistic updates, always revert on error:

```typescript
// Optimistic update
setData(newData)

try {
  await updateData(newData)
} catch (error) {
  // Revert on error
  refetch()
  handleError(error)
}
```

## Testing Error Handling

### Manual Testing Scenarios

1. **Network Errors**: Disable network and attempt operations
2. **Validation Errors**: Submit forms with invalid data
3. **Authentication Errors**: Use incorrect credentials
4. **Database Errors**: Attempt to create duplicate records
5. **Component Errors**: Trigger React component errors

### Error Recovery Testing

1. Verify retry buttons work correctly
2. Confirm optimistic updates revert on error
3. Test offline queue synchronization
4. Validate error messages are user-friendly

## Future Enhancements

1. **Error Logging Service**: Integrate with Sentry or similar service
2. **Error Analytics**: Track error frequency and types
3. **Automatic Retry**: Implement exponential backoff for network errors
4. **Error Recovery Suggestions**: Provide context-specific recovery steps
5. **Offline Mode**: Enhanced offline capabilities with local storage

## Related Documentation

- [Cloud Synchronization](./CLOUD-SYNC.md)
- [Authentication](./AUTHENTICATION.md)
- [Game Collection](./GAME-COLLECTION.md)
