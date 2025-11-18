import { getClerkInstance } from './auth-client';
import { SSOProvider, SSOSignInOptions } from './types';

/**
 * Signs in using SSO with a specific provider
 * @param provider - The SSO provider to use (e.g., 'oauth_google', 'oauth_microsoft', 'saml')
 * @param redirectUrl - Optional redirect URL after successful sign-in
 */
export async function signInWithSSO(
  provider: SSOProvider,
  redirectUrl?: string
): Promise<void> {
  const clerk = getClerkInstance();
  
  if (!clerk) {
    throw new Error('Auth client not initialized. Call createAuthClient() first.');
  }

  if (typeof window === 'undefined') {
    throw new Error('SSO sign-in is only available in browser environment.');
  }

  try {
    const defaultRedirectUrl = redirectUrl || window.location.origin + '/dashboard';
    
    // Redirect to Clerk sign-in with provider
    window.location.href = `${clerk.buildUrlWithAuth('/sign-in')}?redirect_url=${encodeURIComponent(defaultRedirectUrl)}`;
  } catch (error) {
    throw new Error(
      `SSO sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Signs in with a provider using custom options
 * @param provider - The SSO provider to use
 * @param options - Optional SSO sign-in configuration
 */
export async function signInWithProvider(
  provider: SSOProvider,
  options?: SSOSignInOptions
): Promise<void> {
  const clerk = getClerkInstance();
  
  if (!clerk) {
    throw new Error('Auth client not initialized. Call createAuthClient() first.');
  }

  if (typeof window === 'undefined') {
    throw new Error('SSO sign-in is only available in browser environment.');
  }

  try {
    const finalRedirectUrl = options?.redirectUrl || window.location.origin + '/dashboard';
    const signInUrl = clerk.buildUrlWithAuth('/sign-in');
    
    // Build URL with provider and redirect
    const url = new URL(signInUrl);
    url.searchParams.set('redirect_url', finalRedirectUrl);
    if (provider) {
      url.searchParams.set('strategy', provider);
    }
    
    window.location.href = url.toString();
  } catch (error) {
    throw new Error(
      `Provider sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Checks if there's an active SSO session
 * @returns Promise that resolves to true if session exists, false otherwise
 */
export async function checkSSOSession(): Promise<boolean> {
  const clerk = getClerkInstance();
  
  if (!clerk) {
    return false;
  }

  try {
    await clerk.load();
    return clerk.session !== null && clerk.user !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the current SSO user
 * @returns The current user object or null if not authenticated
 */
export function getSSOUser(): any | null {
  const clerk = getClerkInstance();
  
  if (!clerk) {
    return null;
  }

  try {
    return clerk.user;
  } catch (error) {
    return null;
  }
}

/**
 * Signs out from SSO session
 */
export async function signOutSSO(): Promise<void> {
  const clerk = getClerkInstance();
  
  if (!clerk) {
    throw new Error('Auth client not initialized. Call createAuthClient() first.');
  }

  try {
    await clerk.signOut();
  } catch (error) {
    throw new Error(
      `SSO sign-out failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets the current SSO session
 * @returns The current session object or null if not authenticated
 */
export function getSSOSession(): any | null {
  const clerk = getClerkInstance();
  
  if (!clerk) {
    return null;
  }

  try {
    return clerk.session;
  } catch (error) {
    return null;
  }
}
