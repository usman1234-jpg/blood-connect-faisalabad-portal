
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  role: string;
  university?: string;
  full_name?: string;
  note?: string;
  date_added: string;
  added_by?: string;
}

export const useCustomAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth hook initializing...');
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Initial session:', currentSession?.user?.id || 'none');
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Load profile for role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
          
          setUserRole(profile?.role || 'user');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id || 'none');
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Load profile for role
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', newSession.user.id)
              .single();
            
            setUserRole(profile?.role || 'user');
          } catch (error) {
            console.error('Profile load error:', error);
            setUserRole('user');
          }
        } else {
          setUserRole('user');
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole('user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isAuthenticated = !!session;
  const isAdmin = userRole === 'admin' || userRole === 'main-admin';
  const isMainAdmin = userRole === 'main-admin';

  console.log('Auth state:', { isAuthenticated, loading, userRole });

  return {
    user,
    session,
    userRole,
    loading,
    isAuthenticated,
    isAdmin,
    isMainAdmin,
    signOut
  };
};
