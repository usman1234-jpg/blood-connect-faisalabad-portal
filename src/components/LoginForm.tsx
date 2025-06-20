
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if this is the admin user
      if (userId === 'admin' && password === 'BloodConnect2024!') {
        console.log('Attempting admin login...');
        
        // Try to sign in directly first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@bloodconnect.com',
          password: 'BloodConnect2024!'
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          
          // If sign in fails due to user not existing, try to create the user first
          if (signInError.message.includes('Invalid login credentials')) {
            console.log('Admin user not found, creating...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: 'admin@bloodconnect.com',
              password: 'BloodConnect2024!',
              options: {
                data: {
                  username: 'admin',
                  role: 'main-admin',
                  full_name: 'Main Administrator'
                }
              }
            });

            if (signUpError && !signUpError.message.includes('User already registered')) {
              console.error('Sign up error:', signUpError);
              toast({
                title: "Login Failed",
                description: signUpError.message,
                variant: "destructive"
              });
              return;
            }

            // Try to sign in again after signup
            const { data: retrySignInData, error: retrySignInError } = await supabase.auth.signInWithPassword({
              email: 'admin@bloodconnect.com',
              password: 'BloodConnect2024!'
            });

            if (retrySignInError) {
              console.error('Retry sign in error:', retrySignInError);
              toast({
                title: "Login Failed",
                description: retrySignInError.message,
                variant: "destructive"
              });
              return;
            }
          } else {
            toast({
              title: "Login Failed",
              description: signInError.message,
              variant: "destructive"
            });
            return;
          }
        }

        console.log('Admin login successful');
        toast({
          title: "Success",
          description: "Logged in successfully as admin!",
          variant: "default"
        });
      } else {
        // For other users, check if they exist in profiles table and validate password
        console.log('Checking for non-admin user:', userId);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', userId)
          .single();

        if (profileError || !profile) {
          console.error('Profile not found:', profileError);
          toast({
            title: "Login Failed",
            description: "Invalid user ID or password",
            variant: "destructive"
          });
          return;
        }

        // For now, we'll create a simple session simulation
        // In a real implementation, you'd want proper password hashing and validation
        // Since this is a closed system, we'll use a simplified approach
        
        // Store user session data in localStorage for this closed system
        const sessionData = {
          user: {
            id: profile.id,
            username: profile.username,
            role: profile.role,
            full_name: profile.full_name,
            university: profile.university
          },
          session: {
            access_token: 'internal-session-' + profile.id,
            user: profile
          }
        };
        
        localStorage.setItem('bloodconnect_session', JSON.stringify(sessionData));
        
        // Trigger a page reload to initialize the session
        window.location.reload();
        
        toast({
          title: "Success",
          description: `Logged in successfully as ${profile.username}!`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">BloodConnect</CardTitle>
          <CardDescription>Sign in to access the donor management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Default admin login:</p>
            <p>User ID: admin | Password: BloodConnect2024!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
