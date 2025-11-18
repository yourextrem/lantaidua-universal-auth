# Environment Variables Check

## Required Environment Variables

### For Clerk
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... or pk_live_...
```

### For Supabase (User Sync)
```env
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://your-auth-project.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Learning Supabase (Optional - Your App Data)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-learning-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Issues

### Issue 1: Using Wrong Supabase Instance

**Wrong:**
```typescript
// ❌ Using Learning Supabase for user sync
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // This is for learning data!
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Correct:**
```typescript
// ✅ Using Auth Supabase for user sync
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!, // This is for user sync!
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);
```

### Issue 2: Missing NEXT_PUBLIC_ Prefix

**Wrong:**
```env
AUTH_SUPABASE_URL=...  # ❌ Missing NEXT_PUBLIC_
```

**Correct:**
```env
NEXT_PUBLIC_AUTH_SUPABASE_URL=...  # ✅ Has NEXT_PUBLIC_ prefix
```

### Issue 3: Env Variables Not Loaded

Make sure:
1. File is named `.env.local` (not `.env`)
2. Restart Next.js dev server after changing `.env.local`
3. Variables start with `NEXT_PUBLIC_` for client-side access

### Issue 4: Connection/Disconnection Pattern

If Clerk and Supabase keep connecting/disconnecting:

1. **Check initialization order:**
```typescript
// ✅ Correct order
await authClient.createAuthClient(publishableKey, {
  autoSyncToSupabase: true,
});
authClient.createSupabaseClient(authSupabaseUrl, authSupabaseKey);
```

2. **Check if both are initialized:**
```javascript
console.log('Clerk:', authClient.authClientInitialized);
console.log('Supabase:', authClient.supabaseInitialized);
console.log('Auto-sync:', authClient.autoSyncEnabled);
```

3. **Check env variables are loaded:**
```javascript
console.log('Clerk key exists:', !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
console.log('Auth Supabase URL exists:', !!process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL);
console.log('Auth Supabase key exists:', !!process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY);
```

## Complete .env.local Template

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_here

# Auth Supabase (for Clerk user sync) - IMPORTANT: Use this for authClient.createSupabaseClient()
NEXT_PUBLIC_AUTH_SUPABASE_URL=https://your-auth-project-id.supabase.co
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_auth_key_here

# Learning Supabase (for your app data) - Use this for your app's data queries
NEXT_PUBLIC_SUPABASE_URL=https://your-learning-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_learning_key_here

# Optional
NEXT_PUBLIC_APP_ENV=dev
```

## Verification Script

Run this in your code to verify env variables:

```typescript
console.log('=== ENV VARIABLES CHECK ===');
console.log('Clerk key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing');
console.log('Auth Supabase URL:', process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Auth Supabase Key:', process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('Learning Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('Learning Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
```

## Quick Fix Checklist

- [ ] `.env.local` file exists in project root
- [ ] All variables start with `NEXT_PUBLIC_`
- [ ] Using `NEXT_PUBLIC_AUTH_SUPABASE_URL` for `authClient.createSupabaseClient()`
- [ ] Restarted Next.js dev server after changing `.env.local`
- [ ] No typos in variable names
- [ ] Values are correct (no extra spaces, correct URLs)

