# Quick Debug: Data Not in Supabase

## Run This in Browser Console (After Login)

Copy and paste this into your browser console:

```javascript
// 1. Check if everything is initialized
console.log('=== DEBUG INFO ===');
console.log('Auto-sync enabled:', window.authClient?.autoSyncEnabled);
console.log('Clerk initialized:', window.authClient?.authClientInitialized);
console.log('Supabase initialized:', window.authClient?.supabaseInitialized);

// 2. Check if user is logged in
const hasSession = await window.authClient.checkSSOSession();
console.log('Has session:', hasSession);

const user = window.authClient.getSSOUser();
console.log('Clerk user:', user);

// 3. Try manual sync
try {
  await window.authClient.connectClerkUserToSupabase('users');
  console.log('✅ Manual sync successful!');
  
  // Check Supabase
  const userData = await window.authClient.getCurrentUserFromSupabase('users');
  console.log('User in Supabase:', userData);
} catch (error) {
  console.error('❌ Manual sync failed:', error);
}
```

## Common Issues

### 1. Auto-Sync Not Enabled

**Check your code:**
```typescript
await authClient.createAuthClient(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  {
    autoSyncToSupabase: true, // ✅ Must be true!
  }
);
```

### 2. Wrong Supabase Instance

**Make sure you use AUTH_SUPABASE:**
```typescript
// ✅ Correct
authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);

// ❌ Wrong - Don't use Learning Supabase
```

### 3. Enable Auto-Sync Manually

If auto-sync didn't enable automatically:

```typescript
// In browser console or your code
authClient.enableAutoSync('users');
console.log('Auto-sync enabled:', authClient.autoSyncEnabled);
```

### 4. Check Browser Console for Errors

Look for:
- `✅ Auto-synced user to Supabase` - Good!
- `Auto-sync error: ...` - Bad, check the error
- No messages - Auto-sync might not be running

## Quick Fix: Force Sync Now

Run this in browser console:

```javascript
// Force sync right now
await window.authClient.connectClerkUserToSupabase('users');
console.log('✅ Forced sync complete!');
```

Then check Supabase table - data should appear!

