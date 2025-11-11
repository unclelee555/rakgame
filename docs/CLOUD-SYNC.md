# Cloud Synchronization

## Overview

RakGame implements real-time cloud synchronization using Supabase's real-time capabilities. This ensures that your game collection is always up-to-date across all your devices and handles offline scenarios gracefully.

## Features

### 1. Real-time Subscriptions

The application subscribes to database changes and automatically updates the UI when:
- Games are added, updated, or deleted
- Sellers are added, updated, or deleted
- Changes occur from any device or session

**Implementation:**
- Uses Supabase real-time channels
- Separate event handlers for INSERT, UPDATE, and DELETE operations
- Prevents duplicate entries from optimistic updates

### 2. Optimistic UI Updates

For better user experience, the UI updates immediately before the server confirms the change:

**Benefits:**
- Instant feedback to user actions
- Smooth, responsive interface
- No waiting for server round-trips

**How it works:**
1. User performs an action (create, update, delete)
2. UI updates immediately with temporary data
3. Request sent to server
4. On success: temporary data replaced with real server data
5. On error: UI reverts and shows error message

### 3. Offline Detection

The application monitors network connectivity and displays status:

**Offline Indicator:**
- Shows when device is offline
- Displays number of pending changes
- Appears in bottom-right corner
- Orange color when offline, blue when syncing

**Behavior:**
- Automatically detects online/offline status
- Updates in real-time
- Persists across page refreshes

### 4. Offline Queue

When offline, all changes are queued and synced when connection is restored:

**Queue Features:**
- Stores operations in localStorage
- Persists across browser sessions
- Automatic retry with exponential backoff
- Maximum 3 retry attempts per operation

**Supported Operations:**
- Create game
- Update game
- Delete game
- Create seller
- Update seller
- Delete seller

### 5. Automatic Sync on Reconnection

When the device comes back online:

1. Detects connection restoration
2. Waits 1 second for connection stability
3. Processes all queued operations
4. Shows success/failure notifications
5. Updates UI with synced data

**Error Handling:**
- Failed operations retry up to 3 times
- Permanent failures are reported to user
- Queue is cleared after successful sync

## Usage

### For Users

The synchronization happens automatically. You don't need to do anything special:

1. **Online:** Changes sync immediately
2. **Offline:** Changes are queued and you'll see an offline indicator
3. **Back Online:** Queued changes sync automatically

### For Developers

The synchronization is implemented in several key files:

**Hooks:**
- `lib/hooks/use-online-status.ts` - Monitors network status
- `lib/hooks/use-sync-manager.ts` - Manages automatic sync
- `lib/hooks/use-games.ts` - Game operations with sync
- `lib/hooks/use-sellers.ts` - Seller operations with sync

**Utilities:**
- `lib/utils/sync-queue.ts` - Queue management and processing

**Components:**
- `components/layout/offline-indicator.tsx` - Visual status indicator
- `components/layout/sync-manager.tsx` - Global sync coordinator

## Technical Details

### Real-time Subscriptions

```typescript
const channel = supabase
  .channel('games_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'games'
  }, (payload) => {
    // Handle insert
  })
  .subscribe()
```

### Optimistic Updates

```typescript
// 1. Update UI immediately
setGames(prev => [optimisticGame, ...prev])

// 2. Send to server
const { data, error } = await supabase.from('games').insert(...)

// 3. Replace with real data
setGames(prev => prev.map(g => g.id === optimisticGame.id ? data : g))
```

### Offline Queue

```typescript
// When offline
if (!isOnline) {
  syncQueue.add({ type: 'create_game', data: game })
  toast.info('Game will be synced when online')
}

// When back online
syncQueue.processQueue()
```

## Limitations

1. **Image Uploads:** Images cannot be uploaded while offline
2. **Conflict Resolution:** Last write wins (no merge conflict resolution)
3. **Queue Size:** Limited by localStorage capacity (~5-10MB)
4. **Retry Limit:** Operations fail permanently after 3 retries

## Future Enhancements

- Conflict resolution for concurrent edits
- Offline image caching
- Background sync using Service Workers
- Sync status per operation
- Manual sync trigger
- Sync history and logs
