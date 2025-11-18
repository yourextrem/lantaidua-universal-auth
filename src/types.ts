export type Environment = 'dev' | 'staging' | 'prod';

export interface UniversalAuth {
  getEnvironment: () => Environment;
  authClientInitialized: boolean;
  createAuthClient: (publishableKey: string, options?: ClerkOptions) => Promise<void>;
}

export interface ClerkOptions {
  domain?: string;
  isSatellite?: boolean;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
}

