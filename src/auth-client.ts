import { Clerk } from '@clerk/clerk-js';
import { ClerkOptions } from './types';

let clerkInstance: Clerk | null = null;

/**
 * Creates and initializes the Clerk authentication client
 * @param publishableKey - Your Clerk publishable key
 * @param options - Optional Clerk configuration options
 * @returns Promise that resolves when the client is initialized
 */
export async function createAuthClient(
  publishableKey: string,
  options?: ClerkOptions
): Promise<void> {
  if (clerkInstance) {
    // Client already initialized
    return;
  }

  if (!publishableKey) {
    throw new Error('Clerk publishable key is required');
  }

  try {
    // Build options object for Clerk constructor
    const clerkOptions: any = {};
    
    if (options) {
      if (options.domain) {
        clerkOptions.domain = options.domain;
      }
      if (options.isSatellite !== undefined) {
        clerkOptions.isSatellite = options.isSatellite;
      }
    }

    // Initialize Clerk with publishable key and options
    clerkInstance = new Clerk(publishableKey, clerkOptions);

    // Note: signInUrl, signUpUrl, afterSignInUrl, afterSignUpUrl are typically
    // configured via environment variables or Clerk dashboard, not via the client instance
    // These options are stored for reference but not directly applied to Clerk instance
    
    await clerkInstance.load();
  } catch (error) {
    clerkInstance = null;
    throw new Error(`Failed to initialize Clerk client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the current Clerk instance
 * @returns The Clerk instance or null if not initialized
 */
export function getClerkInstance(): Clerk | null {
  return clerkInstance;
}

