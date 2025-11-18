# Troubleshooting Guide

## Issue: No Data in Supabase Users Table After Login

### Problem
User successfully logs in with Clerk, but no data appears in the Supabase `users` table.

### Solution

The `connectClerkUserToSupabase()` function must be called **after** the user logs in. It doesn't happen automatically.

### Step-by-Step Fix

#### 1. Make Sure Both Clients Are Initialized

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function MyApp() {
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize Clerk FIRST
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          { ssoEnabled: true }
        );

        // 2. Initialize Supabase SECOND
        const supabase = authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 3. Check if user is already logged in
        const hasSession = await authClient.checkSSOSession();
        
        if (hasSession) {
          // 4. IMPORTANT: Connect user to Supabase
          await authClient.connectClerkUserToSupabase('users');
          console.log('✅ User synced to Supabase');
        }
      } catch (error) {
        console.error('❌ Initialization error:', error);
      }
    };

    init();
  }, []);

  return <div>Your app</div>;
}
```

#### 2. Call After Sign-In

You need to call `connectClerkUserToSupabase()` **after** the user successfully signs in:

```typescript
const handleSignIn = async () => {
  try {
    // Sign in with Clerk
    await authClient.signInWithSSO('oauth_google', '/dashboard');
    
    // After redirect back, in your dashboard/page:
    // Call this to sync user to Supabase
    await authClient.connectClerkUserToSupabase('users');
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
```

#### 3. Complete Example with Auto-Sync

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const initAndSync = async () => {
      try {
        // Initialize Clerk
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!
        );

        // Initialize Supabase
        authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Check session
        const hasSession = await authClient.checkSSOSession();
        
        if (hasSession) {
          const clerkUser = authClient.getSSOUser();
          setUser(clerkUser);

          // Sync to Supabase
          try {
            await authClient.connectClerkUserToSupabase('users');
            setSynced(true);
            console.log('✅ User synced to Supabase');
          } catch (syncError) {
            console.error('❌ Sync error:', syncError);
          }
        }
      } catch (error) {
        console.error('❌ Error:', error);
      }
    };

    initAndSync();
  }, []);

  return (
    <div>
      {user && (
        <div>
          <h1>Welcome, {user.firstName}!</h1>
          {synced ? (
            <p>✅ Synced to Supabase</p>
          ) : (
            <p>⏳ Syncing...</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Common Issues

#### Issue 1: "Auth client not initialized"
**Solution:** Make sure you call `createAuthClient()` before `connectClerkUserToSupabase()`

#### Issue 2: "Supabase client not initialized"
**Solution:** Make sure you call `createSupabaseClient()` before `connectClerkUserToSupabase()`

#### Issue 3: "No authenticated Clerk user found"
**Solution:** Make sure user has signed in with Clerk first. Check with:
```typescript
const hasSession = await authClient.checkSSOSession();
if (hasSession) {
  // Then sync
  await authClient.connectClerkUserToSupabase('users');
}
```

#### Issue 4: "Failed to connect Clerk user to Supabase"
**Possible causes:**
- Table `users` doesn't exist → Run the SQL script
- Wrong table name → Check table name matches
- RLS policies blocking → Check Supabase RLS settings
- Network error → Check Supabase URL and key

### Debugging Steps

1. **Check if Clerk user exists:**
```typescript
const user = authClient.getSSOUser();
console.log('Clerk user:', user);
```

2. **Check if Supabase is initialized:**
```typescript
console.log('Supabase initialized:', authClient.supabaseInitialized);
```

3. **Check Supabase connection:**
```typescript
import { getSupabaseInstance } from 'lantaidua-universal-auth';
const supabase = getSupabaseInstance();
if (supabase) {
  console.log('Supabase client:', supabase);
}
```

4. **Test Supabase query directly:**
```typescript
const { data, error } = await supabase
  .from('users')
  .select('*');
console.log('Users in Supabase:', data);
console.log('Error:', error);
```

5. **Check browser console for errors:**
- Open browser DevTools (F12)
- Check Console tab for error messages
- Check Network tab for failed requests

### Quick Test

Run this in your browser console after login:

```typescript
// Check Clerk
const hasSession = await authClient.checkSSOSession();
console.log('Has session:', hasSession);

const user = authClient.getSSOUser();
console.log('Clerk user:', user);

// Sync to Supabase
await authClient.connectClerkUserToSupabase('users');

// Check Supabase
const userData = await authClient.getCurrentUserFromSupabase('users');
console.log('User in Supabase:', userData);
```

### Expected Result

After successful sync, you should see in Supabase:
- A new row in the `users` table
- `clerk_id` matching the Clerk user ID
- `email`, `first_name`, `last_name` populated
- `created_at` and `updated_at` timestamps

