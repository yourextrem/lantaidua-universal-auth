import { getEnvironment } from './environment';
import { createAuthClient } from './auth-client';
import { UniversalAuth, UniversalAuthWithSupabase, ClerkOptions } from './types';
import {
  signInWithSSO,
  signInWithProvider,
  checkSSOSession,
  getSSOUser,
  signOutSSO,
  getSSOSession,
} from './sso';
import {
  createSupabaseClient,
  connectClerkUserToSupabase,
  getCurrentUserFromSupabase,
  getUserFromSupabase,
  getSupabaseInstance,
} from './supabase';

/**
 * Universal authentication client for Clerk in Next.js applications
 * Focused on Single Sign-On (SSO) capabilities with Supabase backend integration
 */
export const authClient: UniversalAuthWithSupabase = {
  getEnvironment,
  authClientInitialized: false,
  supabaseInitialized: false,
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
  // Supabase Methods
  createSupabaseClient: (supabaseUrl: string, supabaseAnonKey: string, options?: any) => {
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, options);
    (authClient as any).supabaseInitialized = true;
    return client;
  },
  connectClerkUserToSupabase,
  getCurrentUserFromSupabase,
  getUserFromSupabase,
};

// Export types
export type { 
  Environment, 
  UniversalAuth, 
  UniversalAuthWithSupabase,
  ClerkOptions, 
  SSOProvider, 
  SSOSignInOptions,
  SupabaseOptions
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

// Export Supabase functions directly
export {
  createSupabaseClient,
  getSupabaseInstance,
  connectClerkUserToSupabase,
  getCurrentUserFromSupabase,
  getUserFromSupabase,
} from './supabase';

