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
  enableAutoSync,
  disableAutoSync,
  getAutoSyncStatus,
} from './supabase';

/**
 * Universal authentication client for Clerk in Next.js applications
 * Focused on Single Sign-On (SSO) capabilities with Supabase backend integration
 */
export const authClient: UniversalAuthWithSupabase = {
  getEnvironment,
  authClientInitialized: false,
  supabaseInitialized: false,
  autoSyncEnabled: false,
  createAuthClient: async (publishableKey: string, options?: ClerkOptions) => {
    await createAuthClient(publishableKey, options);
    // Update the initialized flag
    (authClient as any).authClientInitialized = true;
    
    // Store auto-sync preference if configured
    if (options?.autoSyncToSupabase) {
      (authClient as any).__autoSyncRequested = true;
      (authClient as any).__autoSyncTableName = options.supabaseTableName || 'users';
      
      // If Supabase is already initialized, enable auto-sync immediately
      const supabase = getSupabaseInstance();
      if (supabase) {
        enableAutoSync(options.supabaseTableName || 'users');
        (authClient as any).autoSyncEnabled = true;
        (authClient as any).__autoSyncRequested = false;
      }
    }
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
    
    // Enable auto-sync if it was requested in createAuthClient options
    // Check if autoSync was enabled in createAuthClient
    if ((authClient as any).__autoSyncRequested) {
      const tableName = (authClient as any).__autoSyncTableName || 'users';
      enableAutoSync(tableName);
      (authClient as any).autoSyncEnabled = true;
      (authClient as any).__autoSyncRequested = false;
    }
    
    return client;
  },
  connectClerkUserToSupabase,
  getCurrentUserFromSupabase,
  getUserFromSupabase,
  enableAutoSync: (tableName?: string) => {
    enableAutoSync(tableName);
    (authClient as any).autoSyncEnabled = true;
  },
  disableAutoSync: () => {
    disableAutoSync();
    (authClient as any).autoSyncEnabled = false;
  },
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
  enableAutoSync,
  disableAutoSync,
  getAutoSyncStatus,
} from './supabase';

