export type Environment = 'dev' | 'staging' | 'prod';

export type SSOProvider = 
  | 'oauth_google'
  | 'oauth_microsoft'
  | 'oauth_github'
  | 'oauth_facebook'
  | 'oauth_apple'
  | 'saml'
  | 'oidc'
  | string; // Allow custom providers

export interface UniversalAuth {
  getEnvironment: () => Environment;
  authClientInitialized: boolean;
  createAuthClient: (publishableKey: string, options?: ClerkOptions) => Promise<void>;
  // SSO Methods
  signInWithSSO: (provider: SSOProvider, redirectUrl?: string) => Promise<void>;
  signInWithProvider: (provider: SSOProvider, options?: SSOSignInOptions) => Promise<void>;
  checkSSOSession: () => Promise<boolean>;
  getSSOUser: () => any | null;
  signOutSSO: () => Promise<void>;
}

export interface ClerkOptions {
  domain?: string;
  isSatellite?: boolean;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  // SSO Configuration
  ssoEnabled?: boolean;
  ssoDomain?: string;
  ssoProviders?: SSOProvider[];
}

export interface SSOSignInOptions {
  redirectUrl?: string;
  redirectUrlComplete?: string;
  strategy?: string;
  additionalScopes?: string[];
}

