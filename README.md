# lantaidua-universal-auth

A universal authentication wrapper for Clerk in Next.js applications.

## Installation

```bash
npm install lantaidua-universal-auth
```

## Usage

```typescript
import { authClient } from 'lantaidua-universal-auth';

// Initialize the auth client
await authClient.createAuthClient('your-clerk-publishable-key', {
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
});

// Get the current environment
const env = authClient.getEnvironment(); // 'dev' | 'staging' | 'prod'

// Check if client is initialized
if (authClient.authClientInitialized) {
  // Client is ready to use
}
```

## API

### `authClient.createAuthClient(publishableKey, options?)`

Initializes the Clerk authentication client.

- `publishableKey` (string, required): Your Clerk publishable key
- `options` (object, optional): Configuration options
  - `domain`: Custom domain for Clerk
  - `isSatellite`: Whether this is a satellite application
  - `signInUrl`: URL for sign-in page
  - `signUpUrl`: URL for sign-up page
  - `afterSignInUrl`: Redirect URL after sign-in
  - `afterSignUpUrl`: Redirect URL after sign-up

### `authClient.getEnvironment()`

Detects the current environment based on `NODE_ENV` and `NEXT_PUBLIC_APP_ENV`.

Returns: `'dev' | 'staging' | 'prod'`

### `authClient.authClientInitialized`

Boolean flag indicating whether the auth client has been initialized.

## Environment Detection

The package detects the environment using:
1. `NEXT_PUBLIC_APP_ENV` environment variable
2. `NODE_ENV` environment variable
3. Defaults to `'dev'` if neither is set

## License

MIT

