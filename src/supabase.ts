import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getClerkInstance } from './auth-client';
import { SupabaseOptions } from './types';

let supabaseInstance: SupabaseClient | null = null;

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

