import { Session, User } from '@supabase/supabase-js';
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { setupAuthLinking } from '../utils/authLinking';
import { supabase } from '../utils/supabase';

type AuthProps = {
  user: User | null;
  session: Session | null;
  initialized?: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  verifyInvitation: (code: string) => Promise<boolean>;
  consumeInvitation: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthProps | null>(null);

// Custom hook to read the context values
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Listen for changes to authentication state
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Event:', event, 'Session established:', !!session);

      setSession(session);
      setUser(session ? session.user : null);
      setInitialized(true);
    });

    // Setup deep linking handler
    // This allows password reset and email confirmation links to work
    // when clicked from email apps
    // It's safe to clear this subscription on unmount
    const cleanupLinking = setupAuthLinking();

    return () => {
      data.subscription.unsubscribe();
      cleanupLinking();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, options?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    if (error) throw error;
    return data;
  };

  const verifyInvitation = async (code: string) => {
    const { data, error } = await supabase
      .from('invitations')
      .select('id')
      .eq('code', code.trim())
      .single();

    if (error) throw error;
    return !!data;
  };

  const consumeInvitation = async (code: string) => {
    const { error } = await supabase.from('invitations').delete().eq('code', code.trim());
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'io.echoyutian://auth/reset-password',
    });
    if (error) throw error;
  };

  // Log out the user
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    initialized,
    signOut,
    signIn,
    signUp,
    verifyInvitation,
    consumeInvitation,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
