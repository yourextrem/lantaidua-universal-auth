import { Environment } from './types';

/**
 * Detects the current environment based on NODE_ENV and NEXT_PUBLIC_APP_ENV
 * @returns The detected environment: 'dev', 'staging', or 'prod'
 */
export function getEnvironment(): Environment {
  // Check for explicit environment variable first
  if (typeof process !== 'undefined' && process.env) {
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
    
    if (appEnv === 'production' || appEnv === 'prod') {
      return 'prod';
    }
    
    if (appEnv === 'staging' || appEnv === 'stage') {
      return 'staging';
    }
  }
  
  // Default to dev for development
  return 'dev';
}

