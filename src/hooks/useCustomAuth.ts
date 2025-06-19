
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
          
          // If this is a new admin signup, create their profile
          if (event === 'SIGNED_IN' && session.user.email === 'admin@bloodconnect.com') {
            await ensureAdminProfile(session.user);
          }
        } else {
          setUserRole('user');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureAdminProfile = async (user: User) => {
    try {
      console.log('Ensuring admin profile exists for user:', user.id);
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating admin profile...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: 'admin',
            role: 'main-admin',
            full_name: 'Main Administrator',
            date_added: new Date().toISOString().split('T')[0]
          }]);

        if (insertError) {
          console.error('Error creating admin profile:', insertError);
        } else {
          console.log('Admin profile created successfully');
        }
      } else if (existingProfile) {
        console.log('Admin profile already exists:', existingProfile);
      }
    } catch (error) {
      console.error('Error in ensureAdminProfile:', error);
    }
  };

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
        // Update user with profile data
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
