
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
  const [user, setUser] = useState<User | any>(null);
  const [session, setSession] = useState<Session | any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserRole('user');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
      }

      if (data) {
        console.log('Profile loaded:', data);
        setUserRole(data.role);
        const updatedUser = {
          ...user,
          username: data.username,
          university: data.university,
          full_name: data.full_name,
          note: data.note,
          date_added: data.date_added,
          added_by: data.added_by
        } as any;
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const isAuthenticated = !!session;
  const isAdmin = userRole === 'admin' || userRole === 'main-admin';
  const isMainAdmin = userRole === 'main-admin';

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
