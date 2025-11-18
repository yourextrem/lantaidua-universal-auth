# Quick Start Guide - Complete Setup

## ✅ What You DON'T Need

- ❌ **Supabase Third Party Auth** - You don't need to enable Clerk in Supabase's Third Party Auth
- ❌ **Supabase Authentication** - We use Clerk for auth, Supabase only for database

## ✅ What You DO Need

1. **Clerk Account** - For authentication
2. **Supabase Project** - For database only
3. **The `users` table** - Created in Supabase
4. **Call the sync function** - After user logs in

## Step-by-Step Setup

### 1. Get Clerk Credentials
- Go to https://dashboard.clerk.com
- Get your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 2. Get Supabase Credentials
- Go to https://supabase.com/dashboard
- Go to **Settings** → **API**
- Get your **Project URL** and **anon/public key**

### 3. Create Users Table
- Run the SQL script `supabase-setup.sql` in Supabase SQL Editor
- Or create the table manually (see README)

### 4. Use in Your Code

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function App() {
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize Clerk (Authentication)
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          { ssoEnabled: true }
        );

        // 2. Initialize Supabase (Database)
        authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 3. Check if user is logged in
        const hasSession = await authClient.checkSSOSession();
        
        if (hasSession) {
          // 4. IMPORTANT: Sync user to Supabase database
          await authClient.connectClerkUserToSupabase('users');
          console.log('✅ User data synced to Supabase!');
        }
      } catch (error) {
        console.error('❌ Error:', error);
      }
    };

    init();
  }, []);

  return <div>Your app</div>;
}
```

## How It Works

```
User Login Flow:
1. User clicks "Sign in with Google" 
   → Clerk handles authentication
   
2. User successfully logs in
   → Clerk session created
   
3. Your code calls: connectClerkUserToSupabase('users')
   → User data synced to Supabase database
   
4. Data appears in Supabase `users` table
   → You can now query it!
```

## Important Notes

- ✅ **Clerk** = Authentication (login, SSO, sessions)
- ✅ **Supabase** = Database (store user data, query data)
- ✅ They work **separately** - Clerk doesn't need to be in Supabase Third Party Auth
- ✅ You **must call** `connectClerkUserToSupabase()` after login

## Troubleshooting

### No data in Supabase?
- ✅ Check: Did you call `connectClerkUserToSupabase('users')`?
- ✅ Check: Is user logged in? (`checkSSOSession()`)
- ✅ Check: Are both Clerk and Supabase initialized?

### Test in Browser Console

```typescript
// 1. Check if logged in
const hasSession = await authClient.checkSSOSession();
console.log('Logged in?', hasSession);

// 2. Get Clerk user
const user = authClient.getSSOUser();
console.log('Clerk user:', user);

// 3. Sync to Supabase
await authClient.connectClerkUserToSupabase('users');

// 4. Check Supabase
const userData = await authClient.getCurrentUserFromSupabase('users');
console.log('User in Supabase:', userData);
```

