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
    const { error } = await supabase
      .from(tableName)
      .upsert(userData, {
        onConflict: 'clerk_id',
      });

    if (error) {
      throw error;
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
    
    // Listen to focus events (when user comes back to tab)
    window.addEventListener('focus', checkAndSync);
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
    await clerk.load();
    const user = clerk.user;

    if (user) {
      const currentUserId = user.id;
      
      // Only sync if user changed or hasn't been synced yet
      if (currentUserId !== lastSyncedUserId) {
        try {
          await connectClerkUserToSupabase(autoSyncTableName);
          lastSyncedUserId = currentUserId;
          if (typeof window !== 'undefined' && window.console) {
            console.log('✅ Auto-synced user to Supabase');
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

