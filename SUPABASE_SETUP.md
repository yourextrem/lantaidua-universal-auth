# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

### 1.1 Go to Supabase Dashboard
1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create an account
3. Create a new project or select an existing one

### 1.2 Get Your Project URL and API Key
1. In your Supabase project, go to **Settings** (gear icon in sidebar)
2. Click on **API**
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: A long JWT token starting with `eyJ...`

## Step 2: Create Environment File

### For Next.js Project (where you'll use the package):

Create `.env.local` in your Next.js project root:

```bash
# In your Next.js project directory
touch .env.local
```

Add these variables:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1NzI5NjAwLCJleHAiOjE5NjEzMDU2MDB9.your_key_here

# Optional
NEXT_PUBLIC_APP_ENV=dev
```

**Important Notes:**
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables
- ✅ Never commit `.env.local` to git (it's in .gitignore)
- ✅ Use `.env.local.example` as a template for your team

## Step 3: Create Users Table in Supabase

### Option A: Using Supabase Dashboard

1. Go to **Table Editor** in Supabase dashboard
2. Click **New Table**
3. Name it `users`
4. Add these columns:

| Column Name | Type | Default | Nullable | Unique |
|------------|------|---------|----------|--------|
| id | uuid | gen_random_uuid() | No | Yes (Primary Key) |
| clerk_id | text | - | No | Yes |
| email | text | - | Yes | No |
| first_name | text | - | Yes | No |
| last_name | text | - | Yes | No |
| image_url | text | - | Yes | No |
| created_at | timestamptz | now() | No | No |
| updated_at | timestamptz | now() | No | No |

5. Set `clerk_id` as UNIQUE
6. Create an index on `clerk_id` for faster queries

### Option B: Using SQL Editor

Go to **SQL Editor** in Supabase and run:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);
```

## Step 4: Use in Your Next.js App

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function MyApp() {
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize Clerk
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          { ssoEnabled: true }
        );

        // 2. Initialize Supabase
        const supabase = authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 3. Check if user is authenticated
        const hasSession = await authClient.checkSSOSession();
        if (hasSession) {
          // 4. Sync Clerk user to Supabase
          await authClient.connectClerkUserToSupabase('users');
          
          // 5. Get user data from Supabase
          const userData = await authClient.getCurrentUserFromSupabase('users');
          console.log('User data from Supabase:', userData);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();
  }, []);

  return <div>Your app content</div>;
}
```

## Step 5: Verify Connection

### Test in Browser Console

After initializing, check:

```typescript
// Check if Supabase is initialized
console.log('Supabase initialized:', authClient.supabaseInitialized);

// Check if Clerk is initialized
console.log('Clerk initialized:', authClient.authClientInitialized);

// Get Supabase instance
import { getSupabaseInstance } from 'lantaidua-universal-auth';
const supabase = getSupabaseInstance();
console.log('Supabase client:', supabase);
```

## Troubleshooting

### Error: "Supabase URL and anonymous key are required"
- ✅ Check that `.env.local` exists
- ✅ Verify variable names start with `NEXT_PUBLIC_`
- ✅ Restart your Next.js dev server after creating `.env.local`

### Error: "Failed to connect Clerk user to Supabase"
- ✅ Check that `users` table exists in Supabase
- ✅ Verify table has `clerk_id` column
- ✅ Check that user is authenticated with Clerk first

### Error: "No authenticated Clerk user found"
- ✅ Make sure user has signed in with Clerk first
- ✅ Call `authClient.createAuthClient()` before connecting to Supabase

## Quick Checklist

- [ ] Created Supabase project
- [ ] Got Project URL and anon key
- [ ] Created `.env.local` file
- [ ] Added Supabase credentials to `.env.local`
- [ ] Created `users` table in Supabase
- [ ] Restarted Next.js dev server
- [ ] Initialized both Clerk and Supabase in code

## Next Steps

After setup, you can:
1. Use Supabase for database queries
2. Store user data and preferences
3. Create relationships with other tables
4. Use Supabase real-time features
5. Use Supabase storage for files

