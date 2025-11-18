# lantaidua-universal-auth

A universal Single Sign-On (SSO) authentication wrapper for Clerk in Next.js applications. Simplify SSO implementation with easy-to-use functions for Google, Microsoft, GitHub, and other providers.

## Installation

```bash
npm install lantaidua-universal-auth
```

## Quick Start - SSO

```typescript
import { authClient } from 'lantaidua-universal-auth';

// 1. Initialize the auth client
await authClient.createAuthClient(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!, {
  ssoEnabled: true,
  domain: 'your-domain.com',
  isSatellite: true, // For multi-domain SSO
});

// 2. Sign in with SSO provider
await authClient.signInWithSSO('oauth_google', '/dashboard');

// 3. Check SSO session
const hasSession = await authClient.checkSSOSession();

// 4. Get current user
const user = authClient.getSSOUser();

// 5. Sign out
await authClient.signOutSSO();
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

## Requirements

- **Clerk Account**: You need a Clerk account and publishable key
- **Next.js**: Version 13.0.0 or higher
- **SSO Setup**: Configure SSO providers in your Clerk dashboard

## Setup Clerk for SSO

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication** → **Social Connections**
3. Enable your desired SSO providers (Google, Microsoft, etc.)
4. Configure redirect URLs
5. Copy your publishable key

## License

MIT

## Support

For issues and questions, visit: https://github.com/yourextrem/lantaidua-universal-auth/issues
