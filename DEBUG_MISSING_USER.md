# Debug: User Not Appearing in Supabase

## Quick Check

Run this in your browser console after you sign up/login:

```javascript
// 1. Check if you're logged in
const hasSession = await authClient.checkSSOSession();
console.log('✅ Has session:', hasSession);

// 2. Get your Clerk user
const user = authClient.getSSOUser();
console.log('✅ Your Clerk user:', user);
console.log('✅ Your Clerk ID:', user?.id);

// 3. Check auto-sync status
console.log('✅ Auto-sync enabled:', authClient.autoSyncEnabled);
console.log('✅ Supabase initialized:', authClient.supabaseInitialized);

// 4. Try manual sync
try {
  await authClient.connectClerkUserToSupabase('users');
  console.log('✅ Manual sync successful!');
  
  // Check if you're in Supabase now
  const userData = await authClient.getCurrentUserFromSupabase('users');
  console.log('✅ Your data in Supabase:', userData);
} catch (error) {
  console.error('❌ Manual sync failed:', error);
  console.error('Error details:', error.message);
}
```

## Common Causes

### 1. Auto-Sync Not Enabled

**Check:**
```javascript
console.log('Auto-sync:', authClient.autoSyncEnabled);
```

**Fix:**
```typescript
// Make sure auto-sync is enabled
await authClient.createAuthClient(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  {
    autoSyncToSupabase: true, // ✅ Must be true!
    supabaseTableName: 'users',
  }
);
```

### 2. Wrong Supabase Instance

**Check:** Are you using the correct Supabase instance?

```typescript
// ✅ Should use AUTH_SUPABASE for user sync
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);
```

### 3. Timing Issue (SSO Redirect)

If you signed in with Google SSO, the sync might not have happened yet.

**Fix:** Wait a few seconds and check again, or force sync:

```javascript
// Wait 5 seconds after redirect
await new Promise(r => setTimeout(r, 5000));

// Force sync
await authClient.connectClerkUserToSupabase('users');
```

### 4. RLS Policies Blocking

**Check in Supabase:**
- Go to Table Editor → users table
- Check "RLS policies" button
- Make sure insert policy allows your user

**Fix:** Temporarily disable RLS for testing:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 5. Error During Sync

Check browser console for errors:
- `Auto-sync error: ...`
- `Failed to connect Clerk user to Supabase: ...`

### 6. Different Sign-Up Method

If your friend signed up with email and you signed up with Google:
- Email sign-up might sync immediately
- Google SSO might need the redirect fix

**Solution:** Use the same sync method for both.

## Force Sync Solution

Add this to your dashboard/redirect page:

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function Dashboard() {
  useEffect(() => {
    const ensureSync = async () => {
      // Wait for everything to load
      await new Promise(r => setTimeout(r, 2000));
      
      const hasSession = await authClient.checkSSOSession();
      if (hasSession) {
        const user = authClient.getSSOUser();
        console.log('Checking sync for:', user?.id);
        
        // Check if already in Supabase
        const existing = await authClient.getCurrentUserFromSupabase('users');
        
        if (!existing) {
          console.log('User not in Supabase, syncing...');
          try {
            await authClient.connectClerkUserToSupabase('users');
            console.log('✅ Synced successfully!');
          } catch (error) {
            console.error('❌ Sync failed:', error);
          }
        } else {
          console.log('✅ Already in Supabase');
        }
      }
    };

    ensureSync();
  }, []);

  return <div>Dashboard</div>;
}
```

## Compare with Working User

Check what's different:

```javascript
// Get your friend's user (if you know their clerk_id)
const friendData = await authClient.getUserFromSupabase(
  'user_35dYh84eymompNEQ5hKQKhj2Tfz', // Your friend's clerk_id
  'users'
);
console.log('Friend data:', friendData);

// Get your data
const yourData = await authClient.getCurrentUserFromSupabase('users');
console.log('Your data:', yourData);

// Compare
console.log('Difference:', {
  friendHasData: !!friendData,
  youHaveData: !!yourData,
});
```

