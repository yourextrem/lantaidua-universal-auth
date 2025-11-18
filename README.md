# lantaidua-universal-auth

A universal Single Sign-On (SSO) authentication wrapper for Clerk with Supabase backend integration in Next.js applications. 

**Clerk** handles authentication & user management, **Supabase** provides the database and backend services. Simplify SSO implementation with easy-to-use functions for Google, Microsoft, GitHub, and other providers.

## Installation

```bash
npm install lantaidua-universal-auth
```

## Quick Start

### 1. SSO Authentication (Clerk)

```typescript
import { authClient } from 'lantaidua-universal-auth';

// Initialize Clerk auth client
await authClient.createAuthClient(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!, {
  ssoEnabled: true,
  domain: 'your-domain.com',
  isSatellite: true, // For multi-domain SSO
});

// Sign in with SSO provider
await authClient.signInWithSSO('oauth_google', '/dashboard');

// Check SSO session
const hasSession = await authClient.checkSSOSession();

// Get current user
const user = authClient.getSSOUser();

// Sign out
await authClient.signOutSSO();
```

### 2. Database Integration (Supabase)

```typescript
import { authClient } from 'lantaidua-universal-auth';

// Initialize Supabase client
const supabase = authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Connect Clerk user to Supabase database
await authClient.connectClerkUserToSupabase('users');

// Get current user from Supabase
const userData = await authClient.getCurrentUserFromSupabase('users');

// Use Supabase for database operations
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userData.clerk_id);
```

## SSO Features

### Supported Providers

- **OAuth Providers**: Google, Microsoft, GitHub, Facebook, Apple
- **Enterprise SSO**: SAML, OIDC
- **Custom Providers**: Any provider supported by Clerk

### SSO Methods

#### `authClient.signInWithSSO(provider, redirectUrl?)`

Sign in using a specific SSO provider.

```typescript
// Sign in with Google
await authClient.signInWithSSO('oauth_google', '/dashboard');

// Sign in with Microsoft
await authClient.signInWithSSO('oauth_microsoft', '/dashboard');

// Sign in with GitHub
await authClient.signInWithSSO('oauth_github', '/dashboard');
```

#### `authClient.signInWithProvider(provider, options?)`

Sign in with custom options.

```typescript
await authClient.signInWithProvider('oauth_google', {
  redirectUrl: '/dashboard',
  redirectUrlComplete: '/dashboard',
  additionalScopes: ['email', 'profile'],
});
```

#### `authClient.checkSSOSession()`

Check if there's an active SSO session.

```typescript
const hasSession = await authClient.checkSSOSession();
if (hasSession) {
  console.log('User is authenticated via SSO');
}
```

#### `authClient.getSSOUser()`

Get the current authenticated user.

```typescript
const user = authClient.getSSOUser();
if (user) {
  console.log('User:', user.emailAddresses[0].emailAddress);
  console.log('Name:', user.firstName, user.lastName);
}
```

#### `authClient.signOutSSO()`

Sign out from SSO session.

```typescript
await authClient.signOutSSO();
```

## Complete SSO Example

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function SSOLoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSSO = async () => {
      try {
        // Initialize auth client
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          {
            ssoEnabled: true,
            domain: 'your-domain.com',
          }
        );

        // Check if user is already signed in
        const hasSession = await authClient.checkSSOSession();
        if (hasSession) {
          const currentUser = authClient.getSSOUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('SSO initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initSSO();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signInWithSSO('oauth_google', '/dashboard');
    } catch (error) {
      console.error('Google SSO failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOutSSO();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.firstName}!</h1>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h1>Sign In with SSO</h1>
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}
```

## Multi-Domain SSO (Satellite Apps)

For SSO across multiple domains:

```typescript
await authClient.createAuthClient(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!, {
  domain: 'your-domain.com',
  isSatellite: true, // Enable satellite mode for multi-domain SSO
  ssoEnabled: true,
});
```

## API Reference

### `authClient.createAuthClient(publishableKey, options?)`

Initializes the Clerk authentication client with SSO support.

- `publishableKey` (string, required): Your Clerk publishable key
- `options` (object, optional): Configuration options
  - `domain`: Custom domain for Clerk
  - `isSatellite`: Enable multi-domain SSO (satellite mode)
  - `ssoEnabled`: Enable SSO features
  - `ssoDomain`: SSO domain configuration
  - `ssoProviders`: List of enabled SSO providers
  - `signInUrl`: URL for sign-in page
  - `signUpUrl`: URL for sign-up page
  - `afterSignInUrl`: Redirect URL after sign-in
  - `afterSignUpUrl`: Redirect URL after sign-up

### `authClient.signInWithSSO(provider, redirectUrl?)`

Signs in using SSO with a specific provider.

- `provider` (SSOProvider, required): The SSO provider ('oauth_google', 'oauth_microsoft', etc.)
- `redirectUrl` (string, optional): URL to redirect after successful sign-in

### `authClient.signInWithProvider(provider, options?)`

Signs in with a provider using custom options.

- `provider` (SSOProvider, required): The SSO provider
- `options` (SSOSignInOptions, optional): Custom sign-in options
  - `redirectUrl`: Redirect URL after sign-in
  - `redirectUrlComplete`: Redirect URL after completion
  - `additionalScopes`: Additional OAuth scopes

### `authClient.checkSSOSession()`

Checks if there's an active SSO session.

Returns: `Promise<boolean>`

### `authClient.getSSOUser()`

Gets the current authenticated user.

Returns: User object or `null`

### `authClient.signOutSSO()`

Signs out from the current SSO session.

### `authClient.getEnvironment()`

Detects the current environment based on `NODE_ENV` and `NEXT_PUBLIC_APP_ENV`.

Returns: `'dev' | 'staging' | 'prod'`

## SSO Provider Types

```typescript
type SSOProvider = 
  | 'oauth_google'
  | 'oauth_microsoft'
  | 'oauth_github'
  | 'oauth_facebook'
  | 'oauth_apple'
  | 'saml'
  | 'oidc'
  | string; // Custom providers
```

## Environment Detection

The package detects the environment using:
1. `NEXT_PUBLIC_APP_ENV` environment variable
2. `NODE_ENV` environment variable
3. Defaults to `'dev'` if neither is set

## Supabase Integration

### Why Supabase?

- **Clerk**: Handles authentication & user management (SSO, OAuth, etc.)
- **Supabase**: Provides database, real-time subscriptions, storage, and backend services

### Supabase Methods

#### `authClient.createSupabaseClient(supabaseUrl, supabaseAnonKey, options?)`

Initializes the Supabase client for database operations.

```typescript
const supabase = authClient.createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    persistSession: true,
    autoRefreshToken: true,
  }
);
```

#### `authClient.connectClerkUserToSupabase(tableName?)`

Syncs Clerk user data to Supabase database. Creates or updates user record.

```typescript
// After user signs in with Clerk
await authClient.connectClerkUserToSupabase('users');
```

This will create/update a user record with:
- `clerk_id` - Clerk user ID
- `email` - User email
- `first_name` - User first name
- `last_name` - User last name
- `image_url` - User profile image
- `updated_at` - Last update timestamp

#### `authClient.getCurrentUserFromSupabase(tableName?)`

Gets the current authenticated user's data from Supabase.

```typescript
const userData = await authClient.getCurrentUserFromSupabase('users');
```

#### `authClient.getUserFromSupabase(clerkUserId, tableName?)`

Gets user data from Supabase by Clerk user ID.

```typescript
const userData = await authClient.getUserFromSupabase('user_abc123', 'users');
```

### Complete Example: Clerk + Supabase

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize Clerk
        await authClient.createAuthClient(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
          { ssoEnabled: true }
        );

        // 2. Initialize Supabase
        const supabase = authClient.createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 3. Check if user is authenticated
        const hasSession = await authClient.checkSSOSession();
        if (hasSession) {
          const clerkUser = authClient.getSSOUser();
          setUser(clerkUser);

          // 4. Sync user to Supabase
          await authClient.connectClerkUserToSupabase('users');

          // 5. Get user data from Supabase
          const data = await authClient.getCurrentUserFromSupabase('users');
          setUserData(data);

          // 6. Use Supabase for queries
          const { data: posts } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', data.clerk_id);
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();
  }, []);

  return (
    <div>
      {user && (
        <div>
          <h1>Welcome, {user.firstName}!</h1>
          <p>Email: {userData?.email}</p>
        </div>
      )}
    </div>
  );
}
```

### Supabase Database Schema Example

Create a `users` table in Supabase:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
```

## Requirements

- **Clerk Account**: You need a Clerk account and publishable key
- **Supabase Account**: You need a Supabase project with URL and anonymous key
- **Next.js**: Version 13.0.0 or higher
- **SSO Setup**: Configure SSO providers in your Clerk dashboard

## Setup

### Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication** → **Social Connections**
3. Enable your desired SSO providers (Google, Microsoft, etc.)
4. Configure redirect URLs
5. Copy your publishable key

### Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**
5. Create a `users` table (see schema example above)

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
NEXT_PUBLIC_APP_ENV=dev
```

## License

MIT

## Support

For issues and questions, visit: https://github.com/yourextrem/lantaidua-universal-auth/issues
