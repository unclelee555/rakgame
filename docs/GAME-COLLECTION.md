# Game Collection Feature

This document describes the game collection CRUD operations implementation.

## Overview

The game collection feature allows users to:
- Add games to their collection with detailed information
- Edit existing game entries
- Delete games from their collection
- Upload cover images for games (up to 5MB)
- Associate games with sellers
- View games in a card-based grid layout

## Components

### `useGames` Hook (`lib/hooks/use-games.ts`)
Custom React hook that manages game data and operations:
- `games` - Array of game entries
- `loading` - Loading state
- `createGame(game, imageFile?)` - Add a new game
- `updateGame(id, updates, imageFile?)` - Update an existing game
- `deleteGame(id)` - Delete a game
- `refetch()` - Manually refresh game list

### `GameForm` Component (`components/games/game-form.tsx`)
Dialog-based form for creating and editing games with:
- Form validation using Zod schema
- Required fields: title, platform, type, price, purchase date
- Optional fields: seller, region, condition, notes, image
- Image upload with preview and 5MB size limit
- Real-time validation feedback

### `GameCard` Component (`components/games/game-card.tsx`)
Card component displaying game information:
- Cover image (if available)
- Title, platform, type
- Price and purchase date
- Region and condition (if set)
- Seller information (if associated)
- Notes preview
- Edit and delete actions

### `GameList` Component (`components/games/game-list.tsx`)
Grid layout for displaying games:
- Responsive grid (1-4 columns based on screen size)
- Empty state message
- Delete confirmation dialog

### Collection Page (`app/(dashboard)/collection/page.tsx`)
Main page for managing game collection:
- Game count display
- Add game button
- Game list with edit/delete functionality
- Form dialog for create/edit operations

## Data Model

```typescript
interface Game {
  id: string
  user_id: string
  seller_id: string | null
  title: string
  platform: Platform
  type: GameType
  price: number
  purchase_date: string
  region?: string
  condition?: Condition
  notes?: string
  image_url?: string
  created_at: string
  seller?: Seller
}
```

### Enums
- **Platform**: 'Switch' | 'Switch 2' | 'PS5' | 'PS4' | 'Xbox Series X|S' | 'Xbox One' | 'PC' | 'Other'
- **GameType**: 'Disc' | 'Digital'
- **Condition**: 'New' | 'Used'

## Image Upload

Game images are stored in Supabase Storage:
- Bucket: `game-images`
- Path structure: `{user_id}/{timestamp}.{extension}`
- Maximum size: 5MB
- Supported formats: All image types
- Public access for viewing
- User-scoped upload/delete permissions

### Storage Setup

Run the migration `20241110000004_storage_setup.sql` to create the storage bucket and policies:

```sql
-- Creates 'game-images' bucket with public read access
-- Sets up RLS policies for user-scoped uploads
```

## Validation Rules

### Required Fields
- Title (non-empty string)
- Platform (must be valid Platform enum)
- Type (must be 'Disc' or 'Digital')
- Price (positive number)
- Purchase Date (valid date)

### Optional Fields
- Seller (reference to sellers table)
- Region (free text)
- Condition ('New' or 'Used')
- Notes (free text)
- Image (file upload, max 5MB)

## Real-time Synchronization

The game list automatically updates when:
- Games are added, updated, or deleted
- Changes occur from other devices/sessions
- Uses Supabase real-time subscriptions

## Error Handling

All operations include error handling with toast notifications:
- Success messages for create/update/delete
- Error messages for failed operations
- Validation errors displayed inline in forms
- Image upload errors (size, type validation)

## Usage Example

```typescript
// In a component
const { games, createGame, updateGame, deleteGame } = useGames()
const { sellers } = useSellers()

// Add a new game
await createGame({
  title: 'The Legend of Zelda: Breath of the Wild',
  platform: 'Switch',
  type: 'Disc',
  price: 59.99,
  purchase_date: '2024-01-15',
  seller_id: sellerId,
  region: 'US',
  condition: 'New',
  notes: 'Launch edition'
}, imageFile)

// Update a game
await updateGame(gameId, {
  price: 49.99,
  condition: 'Used'
})

// Delete a game
await deleteGame(gameId)
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **2.1**: Create game entries with all required fields
- **2.2**: Save entries to database within 2 seconds
- **2.3**: Modify any field of existing game entries
- **2.4**: Delete entries with confirmation
- **2.5**: Support image upload with 5MB limit
