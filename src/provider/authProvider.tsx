import { Session, User } from '@supabase/supabase-js';
import React, { createContext, PropsWithChildren } from 'react';
import { DEMO_USER_ID, MOCK_PROFILE } from '../mock/mockData';

type AuthProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthProps | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─── Demo mock user & session ────────────────────────────────────────────────

const DEMO_USER = {
  id: DEMO_USER_ID,
  email: 'demo@echoyutian.com',
  app_metadata: {},
  user_metadata: { display_name: MOCK_PROFILE.display_name },
  aud: 'authenticated',
  created_at: '2025-01-01T00:00:00Z',
} as unknown as User;

const DEMO_SESSION = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 9999999,
  token_type: 'bearer',
  user: DEMO_USER,
} as unknown as Session;

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: PropsWithChildren) => {
  // Demo branch: always authenticated, no Supabase calls needed.
  const value: AuthProps = {
    user: DEMO_USER,
    session: DEMO_SESSION,
    initialized: true,
    signIn: async () => {},
    signUp: async () => ({}),
    signOut: async () => {},
    resetPassword: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
