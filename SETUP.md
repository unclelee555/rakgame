# RakGame Setup Guide

This guide will help you set up the RakGame application with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project created at [supabase.com](https://supabase.com)

## Step 1: Clone and Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key

3. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Set Up Database Schema

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20241110000001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Verify the Setup

1. In the SQL Editor, create a new query
2. Copy the contents of `supabase/migrations/20241110000002_verify_schema.sql`
3. Run each query section to verify:
   - Tables are created
   - RLS is enabled
   - Indexes are in place
   - Policies are configured

## Step 4: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates if desired (optional)

## Step 5: Set Up Storage (For Image Uploads)

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `game-images`
3. Set the bucket to **Public** or configure appropriate policies
4. Add the following policy for authenticated uploads:

```sql
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'game-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to images (optional, for sharing)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-images');
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Create Your First User

1. Navigate to the registration page
2. Create an account with your email and password
3. Check your email for the confirmation link (if email confirmation is enabled)
4. Log in and start adding games to your collection!

## Troubleshooting

### Database Connection Issues

- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active
- Ensure you're using the correct project URL (not the API URL)

### RLS Policy Errors

- Make sure all RLS policies were created successfully
- Verify that RLS is enabled on all tables
- Check that you're authenticated when making requests

### Migration Errors

- If you get constraint errors, ensure you're running the migration on a fresh database
- Check for any existing tables with the same names
- Verify that the `auth.users` table exists (it should be created automatically by Supabase)

## Next Steps

- Customize the theme and branding
- Add your game collection
- Explore the analytics dashboard
- Set up your preferred sellers

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [RakGame Design Document](.kiro/specs/rakgame-core-system/design.md)
