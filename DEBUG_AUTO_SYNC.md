# Debug Auto-Sync: Data Not Appearing in Supabase

## Quick Debug Checklist

### Step 1: Check if Auto-Sync is Enabled

Open your browser console and run:

```typescript
// Check auto-sync status
console.log('Auto-sync enabled:', authClient.autoSyncEnabled);
console.log('Clerk initialized:', authClient.authClientInitialized);
console.log('Supabase initialized:', authClient.supabaseInitialized);
```

### Step 2: Verify User is Logged In

```typescript
// Check if user is logged in
const hasSession = await authClient.checkSSOSession();
console.log('Has session:', hasSession);

const user = authClient.getSSOUser();
console.log('Clerk user:', user);
```

### Step 3: Check Supabase Connection

```typescript
import { getSupabaseInstance } from 'lantaidua-universal-auth';

const supabase = getSupabaseInstance();
console.log('Supabase instance:', supabase);

// Test query
if (supabase) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(5);
  console.log('Users in Supabase:', data);
  console.log('Error:', error);
}
```

### Step 4: Manual Sync Test

```typescript
// Try manual sync
try {
  await authClient.connectClerkUserToSupabase('users');
  console.log('✅ Manual sync successful');
} catch (error) {
  console.error('❌ Manual sync failed:', error);
}
```

## Common Issues & Solutions

### Issue 1: Auto-Sync Not Enabled

**Solution:** Make sure you enable auto-sync when initializing:

```typescript
await authClient.createAuthClient(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  {
    autoSyncToSupabase: true, // ✅ Must be true!
    supabaseTableName: 'users',
  }
);
```

### Issue 2: Wrong Supabase Instance

**Solution:** Make sure you're using the **Auth Supabase** for user sync:

```typescript
// ✅ Correct: Use AUTH_SUPABASE for user sync
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);

// ❌ Wrong: Don't use Learning Supabase for user sync
// const learningSupabase = createClient(...);
```

### Issue 3: Supabase Initialized Before Auto-Sync

**Solution:** Initialize Supabase **after** enabling auto-sync, or enable auto-sync **after** Supabase:

```typescript
// Option 1: Enable auto-sync in createAuthClient
await authClient.createAuthClient(publishableKey, {
  autoSyncToSupabase: true,
});

// Then initialize Supabase
authClient.createSupabaseClient(authSupabaseUrl, authSupabaseKey);

// Option 2: Enable auto-sync manually after both are initialized
await authClient.createAuthClient(publishableKey);
authClient.createSupabaseClient(authSupabaseUrl, authSupabaseKey);
authClient.enableAutoSync('users'); // Enable manually
```

### Issue 4: Table Name Mismatch

**Solution:** Make sure table name matches:

```typescript
// If your table is 'users'
await authClient.createAuthClient(publishableKey, {
  autoSyncToSupabase: true,
  supabaseTableName: 'users', // ✅ Must match your table name
});
```

### Issue 5: RLS Policies Blocking

**Solution:** Check Supabase RLS policies. Run this SQL in Supabase:

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- If too restrictive, temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or update policy to allow inserts
DROP POLICY IF EXISTS "Allow user inserts" ON users;
CREATE POLICY "Allow user inserts" ON users
  FOR INSERT
  WITH CHECK (true);
```

## Complete Working Example

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function App() {
  useEffect(() => {
    const init = async () => {
      try {
        console.log('1. Initializing Clerk...');
        
        // Initialize Clerk WITH auto-sync enabled
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          {
            ssoEnabled: true,
            autoSyncToSupabase: true, // ✅ Enable auto-sync
            supabaseTableName: 'users',
          }
        );

        console.log('2. Initializing Auth Supabase...');
        
        // Initialize Auth Supabase (for user sync)
        authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
        );

        console.log('3. Checking status...');
        console.log('Auto-sync enabled:', authClient.autoSyncEnabled);
        console.log('Clerk initialized:', authClient.authClientInitialized);
        console.log('Supabase initialized:', authClient.supabaseInitialized);

        // Check if user is already logged in
        const hasSession = await authClient.checkSSOSession();
        if (hasSession) {
          console.log('4. User is logged in, checking Supabase...');
          
          // Wait a moment for auto-sync
          setTimeout(async () => {
            const userData = await authClient.getCurrentUserFromSupabase('users');
            console.log('User data in Supabase:', userData);
          }, 2000);
        } else {
          console.log('4. User not logged in yet');
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

## Test After Login

After user signs in, check browser console for:
- `✅ Auto-synced user to Supabase` message
- Any error messages

If you see errors, share them and we can fix them!

