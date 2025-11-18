import { getEnvironment } from './environment';
import { createAuthClient } from './auth-client';
import { UniversalAuth, ClerkOptions } from './types';

/**
 * Universal authentication client for Clerk in Next.js applications
 */
export const authClient: UniversalAuth = {
  getEnvironment,
  authClientInitialized: false,
  createAuthClient: async (publishableKey: string, options?: ClerkOptions) => {
    await createAuthClient(publishableKey, options);
    // Update the initialized flag
    (authClient as any).authClientInitialized = true;
  },
};

// Export types
export type { Environment, UniversalAuth, ClerkOptions } from './types';

// Export the getEnvironment function directly as well
export { getEnvironment } from './environment';

// Export createAuthClient function directly
export { createAuthClient } from './auth-client';

