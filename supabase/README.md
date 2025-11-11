# Supabase Database Setup

This directory contains SQL migration files for the RakGame database schema.

## Applying Migrations

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20241110000001_initial_schema.sql`
4. Paste and run the SQL in the editor

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual Application

You can also apply the migration using any PostgreSQL client by connecting to your Supabase database with the connection string from your project settings.

## Schema Overview

The migration creates three main tables:

1. **users** - Stores user profiles with currency and language preferences
2. **sellers** - Stores seller information linked to users
3. **games** - Stores game collection entries with relationships to users and sellers

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Migration Files

1. **20241110000001_initial_schema.sql** - Creates tables, indexes, and RLS policies
2. **20241110000002_verify_schema.sql** - Verification queries to check setup
3. **20241110000003_helper_functions.sql** - Utility functions for common operations
4. **20241110000004_storage_setup.sql** - Creates storage bucket and policies for game images

### Helper Functions

The helper functions migration includes:

- `handle_new_user()` - Automatically creates user profile on signup
- `get_user_spending_analytics(user_uuid)` - Returns spending analytics JSON
- `check_duplicate_game(user_uuid, title, platform, exclude_id)` - Checks for duplicate games
- `get_games_with_sellers(user_uuid)` - Returns games with joined seller information

## Indexes

Performance indexes are created for:
- User-based queries on all tables
- Game searches by title, platform, type, and purchase date
- Seller lookups by name

## Row Level Security

RLS policies ensure:
- Users can only view, insert, update, and delete their own data
- All operations are scoped to the authenticated user's ID
- Seller deletions preserve game references (SET NULL)
