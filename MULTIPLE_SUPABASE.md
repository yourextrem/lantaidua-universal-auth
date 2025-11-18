# Using Multiple Supabase Instances

## Scenario: Two Supabase Projects

If you have **two separate Supabase instances**:
1. **Auth Supabase** - For Clerk user sync
2. **Learning Supabase** - For your application data

## Environment Variables Setup

You can use any environment variable names you want! The package accepts the URL and key directly, so you can name them however you like.

### Recommended `.env.local` Structure

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Auth Supabase (for Clerk user sync)
NEXT_PUBLIC_AUTH_SUPABASE_URL=your_auth_supabase_url
NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY=your_auth_supabase_anon_key

# Learning Supabase (for Obelisk Learning data)
NEXT_PUBLIC_SUPABASE_URL=your_learning_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_learning_supabase_anon_key
```

## Usage in Code

### Option 1: Use Auth Supabase for User Sync

```typescript
'use client';

import { authClient } from 'lantaidua-universal-auth';
import { createClient } from '@supabase/supabase-js';

export default function App() {
  useEffect(() => {
    const init = async () => {
      // 1. Initialize Clerk
      await authClient.createAuthClient(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
        {
          ssoEnabled: true,
          autoSyncToSupabase: true, // Enable auto-sync
          supabaseTableName: 'users',
        }
      );

      // 2. Initialize Auth Supabase (for user sync)
      // Use AUTH_SUPABASE variables for Clerk user sync
      authClient.createSupabaseClient(
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
      );

      // 3. Initialize Learning Supabase (for your app data)
      // Use regular SUPABASE variables for your learning data
      const learningSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Now you have:
      // - authClient: Clerk auth + Auth Supabase (user sync)
      // - learningSupabase: Your learning data Supabase
    };

    init();
  }, []);

  return <div>Your app</div>;
}
```

### Option 2: Separate Supabase Clients

```typescript
import { authClient } from 'lantaidua-universal-auth';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Auth Supabase (for Clerk user sync)
const authSupabase = authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
);

// Learning Supabase (for your app data)
const learningSupabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use authSupabase for user sync (handled by authClient)
// Use learningSupabase for your learning data queries
```

## Complete Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';
import { createClient } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [learningData, setLearningData] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize Clerk with auto-sync
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          {
            ssoEnabled: true,
            autoSyncToSupabase: true,
            supabaseTableName: 'users',
          }
        );

        // 2. Initialize Auth Supabase (for Clerk user sync)
        authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!
        );

        // 3. Initialize Learning Supabase (for your app data)
        const learningSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 4. Check if user is logged in
        const hasSession = await authClient.checkSSOSession();
        if (hasSession) {
          const clerkUser = authClient.getSSOUser();
          setUser(clerkUser);

          // 5. Get user from Auth Supabase (auto-synced)
          const userData = await authClient.getCurrentUserFromSupabase('users');
          console.log('User from Auth Supabase:', userData);

          // 6. Query learning data from Learning Supabase
          const { data: courses } = await learningSupabase
            .from('courses')
            .select('*')
            .eq('user_id', userData.clerk_id);

          setLearningData(courses);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    init();
  }, []);

  return (
    <div>
      {user && (
        <div>
          <h1>Welcome, {user.firstName}!</h1>
          <p>Learning data: {learningData?.length || 0} items</p>
        </div>
      )}
    </div>
  );
}
```

## Summary

- ✅ **You can use any env variable names** - The package accepts URL and key directly
- ✅ **Auth Supabase** - Use for Clerk user sync (via `authClient.createSupabaseClient()`)
- ✅ **Learning Supabase** - Use for your app data (via `createClient()` from `@supabase/supabase-js`)
- ✅ **Auto-sync** - Works with Auth Supabase instance
- ✅ **Both instances** - Can be used independently

## Important Notes

1. **User sync goes to Auth Supabase** - When you enable auto-sync, users are synced to the Supabase instance you pass to `authClient.createSupabaseClient()`

2. **Learning data uses Learning Supabase** - Create a separate client for your learning data using the Learning Supabase credentials

3. **Table names** - Make sure the `users` table exists in your **Auth Supabase** instance (not Learning Supabase)

4. **No conflicts** - Both Supabase instances work independently, no conflicts!

