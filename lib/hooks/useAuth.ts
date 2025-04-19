import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthError } from '../types/auth';



export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        // Use getUser to get the verified user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setUser(userData.user);
        setSession(sessionData.session);
      } catch (e) {
        setError(e instanceof Error ? e as AuthError : { name: 'AuthError', message: 'An unknown error occurred' });
        console.error('Error getting session:', e);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session) {
        // Get verified user data
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } else {
        setUser(null);
      }
      
      setSession(session);
      setLoading(false);
      
      // Refresh the page data when auth state changes
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e as AuthError : { name: 'AuthError', message: 'An unknown error occurred' });
      throw e;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e as AuthError : { name: 'AuthError', message: 'An unknown error occurred' });
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Signing in with Google, redirecting to:', `${window.location.origin}/auth/callback`);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback` 
        }
      });
      
      if (error) throw error;
    } catch (e) {
      console.error('Google sign-in error:', e);
      setError(e instanceof Error ? e as AuthError : { name: 'AuthError', message: 'An unknown error occurred' });
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear state
      setUser(null);
      setSession(null);
      // Force a full page reload to clear all state
      window.location.href = '/login';
    } catch (e) {
      setError(e instanceof Error ? e as AuthError : { name: 'AuthError', message: 'An unknown error occurred' });
      throw e;
    }
  };

  return { user, session, loading, error, signIn, signUp, signInWithGoogle, signOut };
}
