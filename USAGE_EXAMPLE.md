# Usage Example - lantaidua-universal-auth

This document shows what it looks like when someone installs and uses your package in their Next.js project.

## Step 1: Installation

Your friend runs this in their Next.js project:

```bash
npm install lantaidua-universal-auth
```

**Output:**
```
added 2 packages, and audited 1234 packages in 3s
found 0 vulnerabilities
```

## Step 2: Add Clerk Key to Environment

They create/update `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123...
NEXT_PUBLIC_APP_ENV=dev  # Optional: dev, staging, or prod
```

## Step 3: Use in Their Code

### Option A: In App Router (app/layout.tsx or app/page.tsx)

```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAuth = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      
      if (publishableKey) {
        try {
          await authClient.createAuthClient(publishableKey);
          console.log('✅ Auth client initialized');
          console.log('🌍 Environment:', authClient.getEnvironment());
        } catch (error) {
          console.error('❌ Failed to initialize auth:', error);
        }
      }
    };

    initAuth();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Option B: In Pages Router (pages/_app.tsx)

```typescript
import { useEffect } from 'react';
import { authClient } from 'lantaidua-universal-auth';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const initAuth = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      
      if (publishableKey) {
        try {
          await authClient.createAuthClient(publishableKey);
          console.log('✅ Auth client initialized');
          console.log('🌍 Environment:', authClient.getEnvironment());
        } catch (error) {
          console.error('❌ Failed to initialize auth:', error);
        }
      }
    };

    initAuth();
  }, []);

  return <Component {...pageProps} />;
}
```

### Option C: Create a Test Page

```typescript
// app/test-auth/page.tsx or pages/test-auth.tsx
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function TestAuthPage() {
  const [status, setStatus] = useState('Initializing...');
  const [env, setEnv] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
          setStatus('❌ Missing Clerk publishable key');
          return;
        }

        await authClient.createAuthClient(publishableKey);
        setStatus('✅ Auth client initialized successfully!');
        setEnv(authClient.getEnvironment());
        setInitialized(authClient.authClientInitialized);
      } catch (error) {
        setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    init();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Universal Auth Test</h1>
      <div style={{ marginTop: '1rem' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Environment:</strong> {env}</p>
        <p><strong>Initialized:</strong> {initialized ? 'Yes ✅' : 'No ❌'}</p>
      </div>
    </div>
  );
}
```

## Step 4: What They See

### In Browser Console:
```
✅ Auth client initialized
🌍 Environment: dev
```

### On Test Page:
```
Universal Auth Test

Status: ✅ Auth client initialized successfully!
Environment: dev
Initialized: Yes ✅
```

## Step 5: Using Environment Detection

They can use the environment detection in their code:

```typescript
import { authClient } from 'lantaidua-universal-auth';

// Get current environment
const env = authClient.getEnvironment();

if (env === 'prod') {
  // Production-specific code
  console.log('Running in production');
} else if (env === 'staging') {
  // Staging-specific code
  console.log('Running in staging');
} else {
  // Development code
  console.log('Running in development');
}
```

## Step 6: Check Initialization Status

```typescript
import { authClient } from 'lantaidua-universal-auth';

if (authClient.authClientInitialized) {
  // Safe to use Clerk features
  console.log('Auth is ready!');
} else {
  console.log('Auth not initialized yet');
}
```

## Complete Example: Full Integration

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'lantaidua-universal-auth';

export default function Dashboard() {
  const [authReady, setAuthReady] = useState(false);
  const [env, setEnv] = useState('');

  useEffect(() => {
    const initializeAuth = async () => {
      const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      
      if (!key) {
        console.error('Missing Clerk key');
        return;
      }

      try {
        await authClient.createAuthClient(key, {
          domain: 'your-domain.com', // Optional
          isSatellite: false, // Optional
        });
        
        setAuthReady(true);
        setEnv(authClient.getEnvironment());
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initializeAuth();
  }, []);

  if (!authReady) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Environment: {env}</p>
      <p>Auth Status: ✅ Ready</p>
      {/* Rest of your app */}
    </div>
  );
}
```

## What Their package.json Looks Like

After installation, their `package.json` will have:

```json
{
  "dependencies": {
    "lantaidua-universal-auth": "^1.0.1",
    "next": "14.2.16",
    "react": "^18",
    // ... other dependencies
  }
}
```

## TypeScript Support

Your package includes TypeScript types, so they get:
- ✅ Full autocomplete in their IDE
- ✅ Type checking
- ✅ IntelliSense support

## Summary

Your friend's experience:
1. ✅ Simple installation: `npm install lantaidua-universal-auth`
2. ✅ Easy to use: Just import and call `createAuthClient()`
3. ✅ TypeScript support out of the box
4. ✅ Environment detection works automatically
5. ✅ Clean, simple API

That's it! Your package makes Clerk authentication setup super easy for Next.js developers! 🎉

