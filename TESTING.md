# Testing universal-auth Package

## Method 1: Using npm link (Recommended for Development)

### Step 1: Link the package globally
```bash
cd /home/nicholas/projects/sso
npm link
```

### Step 2: Link it in your Next.js app
```bash
cd /home/nicholas/projects/companyportal  # or your Next.js app
npm link universal-auth
```

### Step 3: Use it in your Next.js app

#### Option A: In `app/layout.tsx` (App Router)
```typescript
'use client';

import { useEffect } from 'react';
import { authClient } from 'universal-auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAuth = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (publishableKey) {
        await authClient.createAuthClient(publishableKey);
        console.log('Auth client initialized');
        console.log('Environment:', authClient.getEnvironment());
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

#### Option B: In `pages/_app.tsx` (Pages Router)
```typescript
import { useEffect } from 'react';
import { authClient } from 'universal-auth';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const initAuth = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (publishableKey) {
        await authClient.createAuthClient(publishableKey);
        console.log('Auth client initialized');
        console.log('Environment:', authClient.getEnvironment());
      }
    };
    initAuth();
  }, []);

  return <Component {...pageProps} />;
}
```

#### Option C: Create a test page
Create `app/test-auth/page.tsx` (App Router) or `pages/test-auth.tsx` (Pages Router):

```typescript
'use client';

import { useEffect, useState } from 'react';
import { authClient } from 'universal-auth';

export default function TestAuthPage() {
  const [status, setStatus] = useState('Initializing...');
  const [env, setEnv] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
          setStatus('Error: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found');
          return;
        }

        await authClient.createAuthClient(publishableKey);
        setStatus('✅ Auth client initialized successfully!');
        setEnv(authClient.getEnvironment());
      } catch (error) {
        setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    init();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Universal Auth Test</h1>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Environment:</strong> {env}</p>
      <p><strong>Initialized:</strong> {authClient.authClientInitialized ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Method 2: Using npm pack (Alternative)

### Step 1: Create tarball
```bash
cd /home/nicholas/projects/sso
npm run build
npm pack
```

### Step 2: Install in your Next.js app
```bash
cd /home/nicholas/projects/companyportal  # or your Next.js app
npm install /home/nicholas/projects/sso/universal-auth-1.0.0.tgz
```

Then use it the same way as Method 1.

## Method 3: Direct file path (Quick test)

### Step 1: Install from local path
```bash
cd /home/nicholas/projects/companyportal  # or your Next.js app
npm install /home/nicholas/projects/sso
```

## Environment Variables

Make sure you have a `.env.local` file in your Next.js app:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_ENV=dev  # Optional: dev, staging, or prod
```

## Testing Checklist

- [ ] Package installs without errors
- [ ] `authClient.createAuthClient()` initializes successfully
- [ ] `authClient.getEnvironment()` returns correct environment
- [ ] `authClient.authClientInitialized` is true after initialization
- [ ] No TypeScript errors
- [ ] No runtime errors in browser console

## Troubleshooting

### If you get "Module not found" error:
- Make sure you've run `npm link` in the sso directory
- Make sure you've run `npm link universal-auth` in your Next.js app
- Restart your Next.js dev server

### If you get TypeScript errors:
- Make sure the package is built: `cd /home/nicholas/projects/sso && npm run build`
- Check that `dist/` folder exists with compiled files

### If Clerk doesn't initialize:
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Check browser console for detailed error messages

