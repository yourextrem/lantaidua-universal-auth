# Update .env.local with Auth Supabase

## Current Status

Your `.env.local` currently has:
- ✅ Clerk publishable key
- ✅ Learning Supabase (NEXT_PUBLIC_SUPABASE_URL)
- ❌ Missing Auth Supabase variables

## What to Add

Add these lines to your `.env.local` file:

```env
# Auth Supabase (for Clerk user sync)
# IMPORTANT: Use this for authClient.createSupabaseClient()
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
```

## Complete .env.local Structure

After adding, your `.env.local` should look like:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1ZS1kdWNrbGluZy00OS5jbGVyay5hY2NvdW50cy5kZXYk

# Auth Supabase (for Clerk user sync)
# IMPORTANT: Use this for authClient.createSupabaseClient()
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w

# Learning Supabase (for Obelisk Learning data)
NEXT_PUBLIC_SUPABASE_URL=https://ymskibugdasknvcrtsld.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2tpYnVnZGFza252Y3J0c2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ2OTMsImV4cCI6MjA3ODk5MDY5M30.f5aLn6XsMdTXOrvksUEeF2RUmyGwstiwLdWn6K5VV4w
```

## Usage in Code

Now use the Auth Supabase for user sync:

```typescript
// ✅ Use AUTH_SUPABASE for user sync
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);
```

## After Updating

1. **Restart your Next.js dev server** (important!)
2. **Clear browser cache** (optional but recommended)
3. **Test the connection**

## Verify It Works

Run in browser console:

```javascript
console.log('Auth Supabase URL:', process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL);
console.log('Auth Supabase Key:', process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
```

