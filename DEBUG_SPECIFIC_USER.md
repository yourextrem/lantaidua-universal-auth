# Debug: User Spesifik Tidak Muncul di Supabase

## Masalah
Teman bisa login dan data tersimpan, tapi user Anda tidak.

## Quick Debug Script

Jalankan ini di browser console SETELAH Anda login:

```javascript
// 1. Check if you're logged in
const hasSession = await authClient.checkSSOSession();
console.log('=== YOUR STATUS ===');
console.log('Has session:', hasSession);

if (!hasSession) {
  console.error('❌ You are NOT logged in!');
} else {
  // 2. Get your Clerk user data
  const user = authClient.getSSOUser();
  console.log('Your Clerk user:', user);
  console.log('Your Clerk ID:', user?.id);
  console.log('Your email:', user?.emailAddresses?.[0]?.emailAddress);
  console.log('Your first name:', user?.firstName);
  console.log('Your last name:', user?.lastName);
  
  // 3. Check initialization
  console.log('=== INIT STATUS ===');
  console.log('Clerk initialized:', authClient.authClientInitialized);
  console.log('Supabase initialized:', authClient.supabaseInitialized);
  console.log('Auto-sync enabled:', authClient.autoSyncEnabled);
  
  // 4. Check if you're already in Supabase
  const existing = await authClient.getCurrentUserFromSupabase('users');
  console.log('=== SUPABASE CHECK ===');
  console.log('Already in Supabase?', existing ? '✅ YES' : '❌ NO');
  if (existing) {
    console.log('Your Supabase data:', existing);
  }
  
  // 5. Try manual sync
  console.log('=== ATTEMPTING MANUAL SYNC ===');
  try {
    await authClient.connectClerkUserToSupabase('users');
    console.log('✅ Manual sync successful!');
    
    // Check again
    const afterSync = await authClient.getCurrentUserFromSupabase('users');
    console.log('After sync, in Supabase?', afterSync ? '✅ YES' : '❌ NO');
    if (afterSync) {
      console.log('Your data:', afterSync);
    }
  } catch (error) {
    console.error('❌ Manual sync FAILED:', error);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}
```

## Common Causes & Solutions

### Cause 1: Auto-Sync Not Triggered for Your Session

**Check:**
```javascript
console.log('Auto-sync enabled:', authClient.autoSyncEnabled);
```

**Solution:**
```javascript
// Force enable auto-sync
authClient.enableAutoSync('users');

// Or force manual sync
await authClient.connectClerkUserToSupabase('users');
```

### Cause 2: Missing User Data from Clerk

**Check:**
```javascript
const user = authClient.getSSOUser();
console.log('Email:', user?.emailAddresses?.[0]?.emailAddress);
console.log('First name:', user?.firstName);
console.log('Last name:', user?.lastName);
```

**If null/empty:**
- Your Clerk profile might be incomplete
- Update your profile in Clerk dashboard
- Or sign out and sign in again

### Cause 3: Error During Sync (Silent Failure)

**Check browser console for:**
- `Supabase upsert error:`
- `Auto-sync error:`
- `Failed to connect Clerk user to Supabase:`

**Solution:**
- Check the error message
- Common errors:
  - RLS policy blocking
  - Network error
  - Invalid data

### Cause 4: RLS Policy Blocking Your User

**Check in Supabase:**
1. Go to Table Editor → users table
2. Click "RLS policies"
3. Check if policies allow your user

**Solution:**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or update policy to allow all
DROP POLICY IF EXISTS "Allow user inserts" ON users;
CREATE POLICY "Allow user inserts" ON users
  FOR INSERT
  WITH CHECK (true);
```

### Cause 5: Different Sign-In Method

**Check:**
- Did your friend sign in with email?
- Did you sign in with Google SSO?

**Solution:**
- Try signing in with the same method as your friend
- Or wait longer after SSO redirect (5-10 seconds)
- Or force sync manually

### Cause 6: Timing Issue

**Solution:**
Wait 5-10 seconds after login, then run:

```javascript
await authClient.connectClerkUserToSupabase('users');
```

## Force Sync Solution

Add this to your dashboard/page component:

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function Dashboard() {
  useEffect(() => {
    const ensureSync = async () => {
      // Wait for everything to load
      await new Promise(r => setTimeout(r, 3000));
      
      const hasSession = await authClient.checkSSOSession();
      if (hasSession) {
        const user = authClient.getSSOUser();
        console.log('Ensuring sync for:', user?.id);
        
        // Check if already synced
        const existing = await authClient.getCurrentUserFromSupabase('users');
        
        if (!existing) {
          console.log('User not in Supabase, forcing sync...');
          try {
            await authClient.connectClerkUserToSupabase('users');
            console.log('✅ Force sync successful!');
          } catch (error) {
            console.error('❌ Force sync failed:', error);
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
// Get your friend's data (if you know their clerk_id)
const friendId = 'user_35dYh84eymompNEQ5hKQKhj2Tfz'; // Replace with friend's ID
const friendData = await authClient.getUserFromSupabase(friendId, 'users');
console.log('Friend data:', friendData);

// Get your data
const yourData = await authClient.getCurrentUserFromSupabase('users');
console.log('Your data:', yourData);

// Compare
console.log('Comparison:', {
  friendHasData: !!friendData,
  youHaveData: !!yourData,
  yourClerkId: authClient.getSSOUser()?.id,
  friendClerkId: friendId,
});
```

## Step-by-Step Fix

1. **Run the debug script above** - Copy-paste ke browser console
2. **Check the output** - Lihat apa yang error atau missing
3. **Try manual sync** - `await authClient.connectClerkUserToSupabase('users')`
4. **Check Supabase** - Lihat apakah data muncul
5. **If still fails** - Check error message dan share dengan saya

## Most Likely Solution

Kemungkinan besar auto-sync tidak terpicu untuk session Anda. Coba:

```javascript
// Force sync sekarang
await authClient.connectClerkUserToSupabase('users');
console.log('✅ Force sync done!');
```

Lalu cek Supabase - data Anda harus muncul!

