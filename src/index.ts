import { getEnvironment } from './environment';
import { createAuthClient } from './auth-client';
import { UniversalAuth, ClerkOptions } from './types';
import {
  signInWithSSO,
  signInWithProvider,
  checkSSOSession,
  getSSOUser,
  signOutSSO,
  getSSOSession,
} from './sso';

/**
 * Universal authentication client for Clerk in Next.js applications
 * Focused on Single Sign-On (SSO) capabilities
 */
export const authClient: UniversalAuth = {
  getEnvironment,
  authClientInitialized: false,
  createAuthClient: async (publishableKey: string, options?: ClerkOptions) => {
    await createAuthClient(publishableKey, options);
    // Update the initialized flag
    (authClient as any).authClientInitialized = true;
  },
  // SSO Methods
  signInWithSSO,
  signInWithProvider,
  checkSSOSession,
  getSSOUser,
  signOutSSO,
};

// Export types
export type { 
  Environment, 
  UniversalAuth, 
  ClerkOptions, 
  SSOProvider, 
  SSOSignInOptions 
} from './types';

// Export the getEnvironment function directly as well
export { getEnvironment } from './environment';

// Export createAuthClient function directly
export { createAuthClient, getClerkInstance } from './auth-client';

// Export SSO functions directly
export {
  signInWithSSO,
  signInWithProvider,
  checkSSOSession,
  getSSOUser,
  signOutSSO,
  getSSOSession,
} from './sso';

