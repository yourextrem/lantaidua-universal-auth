import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getClerkInstance } from './auth-client';
import { SupabaseOptions } from './types';

let supabaseInstance: SupabaseClient | null = null;
let autoSyncEnabled: boolean = false;
let autoSyncTableName: string = 'users';
let autoSyncInterval: NodeJS.Timeout | null = null;
let lastSyncedUserId: string | null = null;

/**
 * Creates and initializes the Supabase client
 * @param supabaseUrl - Your Supabase project URL
 * @param supabaseAnonKey - Your Supabase anonymous/public key
 * @param options - Optional Supabase configuration
 * @returns The Supabase client instance
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: SupabaseOptions
): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anonymous key are required');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: options?.persistSession !== false,
        autoRefreshToken: options?.autoRefreshToken !== false,
        detectSessionInUrl: options?.detectSessionInUrl !== false,
      },
      ...options?.clientOptions,
    });

    return supabaseInstance;
  } catch (error) {
    throw new Error(
      `Failed to initialize Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets the current Supabase instance
 * @returns The Supabase instance or null if not initialized
 */
export function getSupabaseInstance(): SupabaseClient | null {
  return supabaseInstance;
}

/**
 * Connects Clerk user with Supabase
 * This creates/updates a user record in Supabase based on Clerk user data
 * @param tableName - The table name in Supabase to store user data (default: 'users')
 * @returns Promise that resolves when user is synced
 */
export async function connectClerkUserToSupabase(
  tableName: string = 'users'
): Promise<void> {
  const clerk = getClerkInstance();
  const supabase = getSupabaseInstance();

  if (!clerk) {
    throw new Error('Clerk client not initialized. Call createAuthClient() first.');
  }

  if (!supabase) {
    throw new Error('Supabase client not initialized. Call createSupabaseClient() first.');
  }

  try {
    await clerk.load();
    const user = clerk.user;

    if (!user) {
      throw new Error('No authenticated Clerk user found');
    }

    // Prepare user data for Supabase
    const userData = {
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      image_url: user.imageUrl || null,
      updated_at: new Date().toISOString(),
    };

    // Upsert user data (insert or update if exists)
    const { data, error } = await supabase
      .from(tableName)
      .upsert(userData, {
        onConflict: 'clerk_id',
      })
      .select();

    if (error) {
      // Log detailed error for debugging
      if (typeof window !== 'undefined' && window.console) {
        console.error('Supabase upsert error:', {
          error,
          userData,
          tableName,
          clerkId: userData.clerk_id,
        });
      }
      throw error;
    }

    // Log success for debugging
    if (typeof window !== 'undefined' && window.console) {
      console.log('✅ User synced to Supabase:', {
        clerkId: userData.clerk_id,
        email: userData.email,
        data,
      });
    }
  } catch (error) {
    throw new Error(
      `Failed to connect Clerk user to Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets user data from Supabase using Clerk user ID
 * @param clerkUserId - The Clerk user ID
 * @param tableName - The table name in Supabase (default: 'users')
 * @returns Promise that resolves to user data or null
 */
export async function getUserFromSupabase(
  clerkUserId: string,
  tableName: string = 'users'
): Promise<any | null> {
  const supabase = getSupabaseInstance();

  if (!supabase) {
    throw new Error('Supabase client not initialized. Call createSupabaseClient() first.');
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error(
      `Failed to get user from Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Gets the current authenticated user's data from Supabase
 * @param tableName - The table name in Supabase (default: 'users')
 * @returns Promise that resolves to user data or null
 */
export async function getCurrentUserFromSupabase(
  tableName: string = 'users'
): Promise<any | null> {
  const clerk = getClerkInstance();

  if (!clerk) {
    throw new Error('Clerk client not initialized. Call createAuthClient() first.');
  }

  try {
    await clerk.load();
    const user = clerk.user;

    if (!user) {
      return null;
    }

    return await getUserFromSupabase(user.id, tableName);
  } catch (error) {
    throw new Error(
      `Failed to get current user from Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Enables auto-sync from Clerk to Supabase
 * Automatically syncs user data whenever user logs in or session changes
 * @param tableName - The table name in Supabase (default: 'users')
 */
export function enableAutoSync(tableName: string = 'users'): void {
  if (autoSyncEnabled) {
    // Already enabled, just update table name if different
    autoSyncTableName = tableName;
    return;
  }

  autoSyncEnabled = true;
  autoSyncTableName = tableName;

  // Check and sync immediately
  checkAndSync();

  // Set up interval to check for user changes every 2 seconds
  if (typeof window !== 'undefined') {
    autoSyncInterval = setInterval(() => {
      checkAndSync();
    }, 2000);

    // Listen to storage events (for cross-tab sync)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen to focus events (when user comes back from redirect)
    window.addEventListener('focus', checkAndSync);
    
    // Listen to visibility change (when tab becomes visible after redirect)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Tab is visible, check and sync
        checkAndSync();
      }
    });

    // Check immediately when page loads (important for SSO redirects)
    if (document.readyState === 'complete') {
      // Page already loaded, check immediately
      setTimeout(checkAndSync, 500);
    } else {
      // Wait for page to load
      window.addEventListener('load', () => {
        setTimeout(checkAndSync, 500);
      });
    }

    // Also check after a short delay (for SSO redirects)
    setTimeout(checkAndSync, 1000);
    setTimeout(checkAndSync, 3000);
  }
}

/**
 * Disables auto-sync from Clerk to Supabase
 */
export function disableAutoSync(): void {
  autoSyncEnabled = false;
  
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('focus', checkAndSync);
    document.removeEventListener('visibilitychange', checkAndSync);
    window.removeEventListener('load', checkAndSync);
  }
  
  lastSyncedUserId = null;
}

/**
 * Checks if user is logged in and syncs to Supabase if needed
 */
async function checkAndSync(): Promise<void> {
  if (!autoSyncEnabled) {
    return;
  }

  const clerk = getClerkInstance();
  const supabase = getSupabaseInstance();

  if (!clerk || !supabase) {
    return;
  }

  try {
    // Force reload Clerk to ensure we have the latest user data
    // This is important after SSO redirects
    await clerk.load();
    
    // Wait a bit for Clerk to fully initialize user
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = clerk.user;

    if (user) {
      const currentUserId = user.id;
      
      // Only sync if user changed or hasn't been synced yet
      if (currentUserId !== lastSyncedUserId) {
        try {
          await connectClerkUserToSupabase(autoSyncTableName);
          lastSyncedUserId = currentUserId;
          if (typeof window !== 'undefined' && window.console) {
            console.log('✅ Auto-synced user to Supabase:', currentUserId);
          }
        } catch (error) {
          if (typeof window !== 'undefined' && window.console) {
            console.error('Auto-sync error:', error);
          }
        }
      }
    } else {
      // User logged out
      lastSyncedUserId = null;
    }
  } catch (error) {
    // Silently fail - user might not be logged in yet
    // But log in development
    if (typeof window !== 'undefined' && window.console && process.env.NODE_ENV === 'development') {
      console.debug('Auto-sync check failed (user might not be logged in):', error);
    }
  }
}

/**
 * Handles storage change events for cross-tab sync
 */
function handleStorageChange(event: StorageEvent): void {
  // Check if it's a Clerk-related storage change
  if (event.key && event.key.includes('clerk')) {
    checkAndSync();
  }
}

/**
 * Gets auto-sync status
 */
export function getAutoSyncStatus(): { enabled: boolean; tableName: string } {
  return {
    enabled: autoSyncEnabled,
    tableName: autoSyncTableName,
  };
}

