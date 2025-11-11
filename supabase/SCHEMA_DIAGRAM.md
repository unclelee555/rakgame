# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                              │
│                    (Supabase Auth System)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id (UUID, PK)                                            │  │
│  │ email                                                    │  │
│  │ encrypted_password                                       │  │
│  │ ...                                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1 (ON DELETE CASCADE)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                           users                                 │
│                     (User Profiles)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id (UUID, PK, FK → auth.users.id)                       │  │
│  │ email (TEXT, UNIQUE, NOT NULL)                          │  │
│  │ currency (TEXT, NOT NULL, DEFAULT 'THB')                │  │
│  │ language (TEXT, NOT NULL, DEFAULT 'th')                 │  │
│  │ created_at (TIMESTAMPTZ, DEFAULT NOW())                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  RLS: Users can only access their own profile                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:many (ON DELETE CASCADE)
                              ↓
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ↓                                           ↓
┌──────────────────────────┐            ┌──────────────────────────┐
│       sellers            │            │         games            │
│   (Game Vendors)         │            │   (Game Collection)      │
│  ┌────────────────────┐  │            │  ┌────────────────────┐  │
│  │ id (UUID, PK)      │  │            │  │ id (UUID, PK)      │  │
│  │ user_id (UUID, FK) │  │            │  │ user_id (UUID, FK) │  │
│  │ name (TEXT)        │  │            │  │ seller_id (UUID)   │←─┤
│  │ url (TEXT)         │  │            │  │ title (TEXT)       │  │
│  │ note (TEXT)        │  │            │  │ platform (TEXT)    │  │
│  │ created_at         │  │            │  │ type (TEXT)        │  │
│  └────────────────────┘  │            │  │ price (NUMERIC)    │  │
│                          │            │  │ purchase_date      │  │
│  UNIQUE(user_id, name)   │            │  │ region (TEXT)      │  │
│                          │            │  │ condition (TEXT)   │  │
│  RLS: User-scoped access │            │  │ notes (TEXT)       │  │
└──────────────────────────┘            │  │ image_url (TEXT)   │  │
                                        │  │ created_at         │  │
                                        │  └────────────────────┘  │
                                        │                          │
                                        │  RLS: User-scoped access │
                                        └──────────────────────────┘
                                                    │
                                                    │ many:1 (ON DELETE SET NULL)
                                                    └──────────────┘
```

## Table Relationships

### users → sellers (1:many)
- One user can have many sellers
- Deleting a user cascades to delete all their sellers
- Each seller belongs to exactly one user

### users → games (1:many)
- One user can have many games
- Deleting a user cascades to delete all their games
- Each game belongs to exactly one user

### sellers → games (1:many, optional)
- One seller can be associated with many games
- A game can optionally reference a seller
- Deleting a seller sets `seller_id` to NULL in games (preserves game records)

## Indexes

### users table
```
PRIMARY KEY (id)
UNIQUE INDEX (email)
```

### sellers table
```
PRIMARY KEY (id)
INDEX (user_id)
INDEX (user_id, name)
UNIQUE (user_id, name)
```

### games table
```
PRIMARY KEY (id)
INDEX (user_id)
INDEX (seller_id)
INDEX (user_id, platform)
INDEX (user_id, purchase_date DESC)
INDEX (user_id, LOWER(title))
INDEX (user_id, type)
```

## Data Flow

### User Registration
```
1. User signs up via Supabase Auth
   ↓
2. auth.users record created
   ↓
3. Trigger: on_auth_user_created fires
   ↓
4. Function: handle_new_user() executes
   ↓
5. users profile record created automatically
```

### Adding a Game
```
1. User creates/selects a seller (optional)
   ↓
2. User fills game form
   ↓
3. check_duplicate_game() runs
   ↓
4. If duplicate found, show warning
   ↓
5. User confirms or cancels
   ↓
6. Game record inserted with seller_id reference
```

### Querying Games
```
1. User requests game list
   ↓
2. RLS policy filters: WHERE user_id = auth.uid()
   ↓
3. Query joins with sellers table
   ↓
4. Results returned with seller info
```

## Security Model

### Row Level Security (RLS)

All tables use RLS to ensure data isolation:

```sql
-- Example: games table SELECT policy
CREATE POLICY "Users can view own games"
  ON games FOR SELECT
  USING (auth.uid() = user_id);
```

This means:
- ✅ User A can only see their own games
- ❌ User A cannot see User B's games
- ✅ Queries are automatically filtered
- ✅ No additional WHERE clauses needed in application code

### Policy Types

Each table has 4 policies:
1. **SELECT** - View own records
2. **INSERT** - Create own records
3. **UPDATE** - Modify own records
4. **DELETE** - Remove own records

## Data Types

### Enums (Enforced via CHECK constraints)

**currency**
- THB (Thai Baht)
- AUD (Australian Dollar)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)

**language**
- en (English)
- th (Thai)

**type** (Game Type)
- Disc (Physical)
- Digital (Download)

**condition** (Physical Game Condition)
- New
- Used
- NULL (for digital games)

**platform** (Gaming Platform)
- Switch
- Switch 2
- PS5
- PS4
- Xbox Series X|S
- Xbox One
- PC
- Other

## Storage

### Supabase Storage Buckets

**game-images**
- Stores game cover art images
- Max file size: 5MB
- Allowed types: image/*
- Access: User-scoped via RLS policies

```
game-images/
  └── {user_id}/
      ├── {game_id}_1.jpg
      ├── {game_id}_2.png
      └── ...
```
