# Fix: SSO Google Sign-In Not Syncing to Supabase

## Problem
When signing in with Google SSO (redirect flow), the user data doesn't appear in Supabase, but manual email sign-in works.

## Root Cause
After SSO redirect, the page reloads and auto-sync might not trigger immediately because:
1. Clerk user data might not be fully loaded yet
2. Auto-sync interval might not have started
3. Page load timing issues

## Solution (v1.2.2)

The auto-sync has been improved to:
1. ✅ Check immediately on page load
2. ✅ Check after visibility change (when tab becomes visible)
3. ✅ Multiple delayed checks (500ms, 1s, 3s after page load)
4. ✅ Force Clerk reload before syncing
5. ✅ Better error handling

## Usage

### Option 1: Auto-Sync (Recommended)

Just enable auto-sync and it will handle SSO redirects:

```typescript
await authClient.createAuthClient(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  {
    ssoEnabled: true,
    autoSyncToSupabase: true, // ✅ Enable auto-sync
    supabaseTableName: 'users',
  }
);

authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);

// That's it! Auto-sync will handle SSO redirects
```

### Option 2: Manual Sync After Redirect

If auto-sync still doesn't work, add manual sync in your redirect page:

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function Dashboard() {
  useEffect(() => {
    const syncAfterRedirect = async () => {
      // Wait for Clerk to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hasSession = await authClient.checkSSOSession();
      if (hasSession) {
        try {
          await authClient.connectClerkUserToSupabase('users');
          console.log('✅ Synced after SSO redirect');
        } catch (error) {
          console.error('Sync error:', error);
        }
      }
    };

    syncAfterRedirect();
  }, []);

  return <div>Dashboard</div>;
}
```

## Testing

1. Sign in with Google SSO
2. Wait 3-5 seconds after redirect
3. Check Supabase - user should appear
4. Check browser console for: `✅ Auto-synced user to Supabase: user_xxx`

## If Still Not Working

Run this in browser console after SSO redirect:

```javascript
// Wait a moment
await new Promise(r => setTimeout(r, 2000));

// Check status
console.log('Auto-sync:', authClient.autoSyncEnabled);
console.log('Has session:', await authClient.checkSSOSession());

// Force sync
await authClient.connectClerkUserToSupabase('users');
console.log('✅ Manual sync complete');
```

