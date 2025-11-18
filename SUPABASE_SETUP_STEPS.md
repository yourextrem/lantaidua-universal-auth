# Supabase Setup Steps - Quick Guide

## Step 1: Run SQL Script in Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in and select your project

2. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Or go to: **"Database"** → **"SQL Editor"**

3. **Create New Query**
   - Click **"New query"** button

4. **Copy and Paste SQL**
   - Open the file `supabase-setup.sql` in this project
   - Copy the entire SQL script
   - Paste it into the SQL Editor

5. **Run the Query**
   - Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
   - You should see "Success. No rows returned" or similar success message

6. **Verify Table Created**
   - Go to **"Table Editor"** in the sidebar
   - You should see a `users` table with these columns:
     - `id` (uuid, primary key)
     - `clerk_id` (text, unique)
     - `email` (text)
     - `first_name` (text)
     - `last_name` (text)
     - `image_url` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
supabase db push supabase-setup.sql
```

## Step 2: Verify Setup

### Check Table Structure

Run this query in SQL Editor:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

You should see all the columns listed above.

### Test Insert (Optional)

You can test if the table works:

```sql
-- Test insert (will be used by the package automatically)
INSERT INTO users (clerk_id, email, first_name, last_name)
VALUES ('test_user_123', 'test@example.com', 'Test', 'User')
ON CONFLICT (clerk_id) DO UPDATE 
SET email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- Check if inserted
SELECT * FROM users WHERE clerk_id = 'test_user_123';

-- Clean up test data
DELETE FROM users WHERE clerk_id = 'test_user_123';
```

## Step 3: Configure Row Level Security (RLS)

The SQL script already enables RLS, but you might want to customize policies:

### Current Policies:
- ✅ Users can read all data (you can restrict this)
- ✅ Users can insert (for syncing)
- ✅ Users can update (for syncing)

### To Restrict Access (Optional):

```sql
-- Remove existing policy
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create restricted policy (only read own data)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT 
  USING (clerk_id = current_setting('app.clerk_user_id', true));
```

## Step 4: Ready to Use!

Once the table is created, your package will automatically:
1. Sync Clerk user data to this table
2. Update user data when they sign in
3. Allow you to query user data from Supabase

## Troubleshooting

### Error: "relation 'users' already exists"
- The table already exists, that's okay!
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run again

### Error: "permission denied"
- Make sure you're running the SQL as the database owner
- Check your Supabase project permissions

### Error: "function update_updated_at_column() already exists"
- The function already exists, that's okay!
- The script will work fine

## What the SQL Script Does

1. ✅ Creates `users` table with all necessary columns
2. ✅ Creates indexes for faster queries
3. ✅ Enables Row Level Security (RLS)
4. ✅ Creates security policies
5. ✅ Creates trigger to auto-update `updated_at` timestamp

## Next Steps

After running the SQL:
1. ✅ Your Supabase database is ready
2. ✅ You can now use `connectClerkUserToSupabase()` in your code
3. ✅ Users will be automatically synced when they sign in

