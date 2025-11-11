# Quick Start Guide - Database Setup

This is a quick reference for setting up the RakGame database schema.

## 🚀 Fast Setup (5 minutes)

### 1. Open Supabase SQL Editor

Go to your Supabase project → **SQL Editor** → **New Query**

### 2. Run Migrations in Order

Copy and paste each file's contents into the SQL editor and run:

#### Migration 1: Core Schema
```
supabase/migrations/20241110000001_initial_schema.sql
```
This creates:
- ✅ users, sellers, and games tables
- ✅ All indexes for performance
- ✅ Row Level Security policies

#### Migration 2: Helper Functions (Optional but Recommended)
```
supabase/migrations/20241110000003_helper_functions.sql
```
This adds:
- ✅ Auto-create user profile on signup
- ✅ Analytics helper functions
- ✅ Duplicate detection function

### 3. Verify Setup

Run the verification queries from:
```
supabase/migrations/20241110000002_verify_schema.sql
```

You should see:
- 3 tables created (users, sellers, games)
- RLS enabled on all tables
- Multiple indexes created
- 12 RLS policies active

### 4. Update Environment Variables

In your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Test the Connection

```bash
npm run dev
```

Visit http://localhost:3000 and try to register a new user!

## ✅ Verification Checklist

- [ ] All 3 tables exist (users, sellers, games)
- [ ] RLS is enabled on all tables
- [ ] Indexes are created (check with verify script)
- [ ] Helper functions are installed
- [ ] Environment variables are set
- [ ] Can register a new user
- [ ] User profile is auto-created on signup

## 🔧 Troubleshooting

**"relation auth.users does not exist"**
- This is normal - Supabase creates auth.users automatically
- Make sure you're running the migration in your Supabase project, not locally

**"permission denied for table"**
- Check that RLS policies were created successfully
- Verify you're authenticated when making requests

**"duplicate key value violates unique constraint"**
- You may have run the migration twice
- Drop the tables and run again, or use `CREATE TABLE IF NOT EXISTS`

## 📚 Next Steps

- Read [DATABASE.md](./DATABASE.md) for detailed schema documentation
- Check [SETUP.md](../SETUP.md) for full application setup
- Review [README.md](./README.md) for migration options

## 🆘 Need Help?

Common issues and solutions:

1. **Can't connect to database**: Check your Supabase URL and keys
2. **RLS blocking queries**: Make sure you're authenticated
3. **Slow queries**: Check that indexes are created properly
4. **User profile not created**: Verify the trigger is installed

For more details, see the full documentation in DATABASE.md
