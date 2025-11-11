# RakGame Database Schema Documentation

## Overview

The RakGame database uses PostgreSQL (via Supabase) with Row Level Security to ensure data isolation between users. The schema is designed for optimal performance with appropriate indexes and foreign key relationships.

## Tables

### users

Stores user profile information and preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase Auth |
| email | TEXT | NOT NULL, UNIQUE | User's email address |
| currency | TEXT | NOT NULL, DEFAULT 'THB' | Preferred currency (THB, AUD, USD, EUR, GBP, JPY) |
| language | TEXT | NOT NULL, DEFAULT 'th' | Preferred language (en, th) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

### sellers

Stores information about game sellers/vendors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique seller ID |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Owner of this seller record |
| name | TEXT | NOT NULL | Seller name |
| url | TEXT | NULL | Seller website URL |
| note | TEXT | NULL | Additional notes about seller |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(user_id, name) - Prevents duplicate seller names per user

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Composite index on `(user_id, name)`

**RLS Policies:**
- Users can view their own sellers
- Users can insert their own sellers
- Users can update their own sellers
- Users can delete their own sellers

### games

Stores game collection entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique game entry ID |
| user_id | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Owner of this game entry |
| seller_id | UUID | NULL, REFERENCES sellers(id) ON DELETE SET NULL | Seller from whom game was purchased |
| title | TEXT | NOT NULL | Game title |
| platform | TEXT | NOT NULL | Gaming platform |
| type | TEXT | NOT NULL, CHECK IN ('Disc', 'Digital') | Physical or digital copy |
| price | NUMERIC(10,2) | NOT NULL, CHECK >= 0 | Purchase price |
| purchase_date | DATE | NOT NULL | Date of purchase |
| region | TEXT | NULL | Game region (e.g., US, EU, JP) |
| condition | TEXT | NULL, CHECK IN ('New', 'Used') | Condition for physical games |
| notes | TEXT | NULL | Additional notes |
| image_url | TEXT | NULL | URL to game cover image |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `seller_id`
- Composite index on `(user_id, platform)`
- Composite index on `(user_id, purchase_date DESC)`
- Composite index on `(user_id, LOWER(title))` for case-insensitive search
- Composite index on `(user_id, type)`

**RLS Policies:**
- Users can view their own games
- Users can insert their own games
- Users can update their own games
- Users can delete their own games

## Relationships

```
auth.users (Supabase Auth)
    ↓ (1:1)
users
    ↓ (1:many)
    ├── sellers
    └── games
            ↓ (many:1, optional)
        sellers
```

### Cascade Behavior

- **User deletion**: Cascades to delete all sellers and games
- **Seller deletion**: Sets `seller_id` to NULL in games (preserves game records)

## Helper Functions

### handle_new_user()

Automatically creates a user profile when a new user signs up via Supabase Auth.

**Trigger:** `on_auth_user_created` on `auth.users` table

**Usage:** Automatic - no manual invocation needed

### get_user_spending_analytics(user_uuid UUID)

Returns comprehensive spending analytics for a user.

**Parameters:**
- `user_uuid`: The user's UUID

**Returns:** JSON object with:
```json
{
  "total": 1234.56,
  "gameCount": 42,
  "byPlatform": {
    "Switch": 500.00,
    "PS5": 734.56
  },
  "bySeller": {
    "GameStop": 400.00,
    "Amazon": 834.56
  },
  "byMonth": {
    "2024-11": 200.00,
    "2024-10": 150.00
  }
}
```

**Example:**
```sql
SELECT get_user_spending_analytics(auth.uid());
```

### check_duplicate_game(user_uuid UUID, game_title TEXT, game_platform TEXT, exclude_game_id UUID)

Checks if a game with the same title and platform already exists for the user.

**Parameters:**
- `user_uuid`: The user's UUID
- `game_title`: Game title to check (case-insensitive)
- `game_platform`: Platform to check
- `exclude_game_id`: Optional game ID to exclude from check (for updates)

**Returns:** Table with matching game details or empty if no duplicate

**Example:**
```sql
SELECT * FROM check_duplicate_game(
  auth.uid(),
  'The Legend of Zelda: Breath of the Wild',
  'Switch',
  NULL
);
```

### get_games_with_sellers(user_uuid UUID)

Returns all games for a user with seller information joined.

**Parameters:**
- `user_uuid`: The user's UUID

**Returns:** Table with game and seller columns

**Example:**
```sql
SELECT * FROM get_games_with_sellers(auth.uid())
ORDER BY purchase_date DESC;
```

## Performance Considerations

### Indexes

All queries are optimized with appropriate indexes:

1. **User-scoped queries**: All tables have indexes on `user_id` for fast filtering
2. **Search queries**: Games table has a case-insensitive index on title
3. **Sorting**: Indexes on `purchase_date` and `platform` for common sort operations
4. **Joins**: Foreign key columns are indexed for efficient joins

### Query Patterns

**Recommended:**
```sql
-- Good: Uses index on (user_id, LOWER(title))
SELECT * FROM games 
WHERE user_id = auth.uid() 
  AND LOWER(title) LIKE LOWER('%zelda%');

-- Good: Uses index on (user_id, platform)
SELECT * FROM games 
WHERE user_id = auth.uid() 
  AND platform = 'Switch';
```

**Avoid:**
```sql
-- Bad: Full table scan
SELECT * FROM games WHERE title LIKE '%zelda%';

-- Bad: No user_id filter bypasses RLS efficiently
SELECT * FROM games WHERE platform = 'Switch';
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Automatically filter queries to only return the authenticated user's data
- Prevent users from accessing or modifying other users' data
- Use `auth.uid()` to identify the current user

### Best Practices

1. Always use authenticated requests
2. Never disable RLS on these tables
3. Use the Supabase client libraries which automatically handle auth tokens
4. Validate data on the client side before submission
5. Use prepared statements to prevent SQL injection (handled by Supabase client)

## Maintenance

### Backup Strategy

Supabase provides automatic daily backups. For additional safety:
- Use the export functionality to create user-level backups
- Store critical data exports in multiple locations
- Test restore procedures periodically

### Monitoring

Monitor these metrics:
- Table sizes and growth rates
- Index usage statistics
- Slow query logs
- RLS policy performance

### Optimization

If performance degrades:
1. Check index usage with `pg_stat_user_indexes`
2. Analyze slow queries with `EXPLAIN ANALYZE`
3. Consider partitioning games table if it exceeds 1M rows
4. Review and optimize RLS policies if needed

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| 20241110000001 | 2024-11-10 | Initial schema with tables, indexes, and RLS |
| 20241110000002 | 2024-11-10 | Verification queries |
| 20241110000003 | 2024-11-10 | Helper functions and triggers |
