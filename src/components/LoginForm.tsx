
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
      if (userId === 'admin' && password === 'BloodConnect2024!') {
        // Admin login with Supabase Auth
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@bloodconnect.com',
          password: 'BloodConnect2024!'
        });

        if (signInError) {
          console.error('Admin login error:', signInError);
          toast({
            title: "Login Failed",
            description: signInError.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Logged in successfully as admin!",
          variant: "default"
        });
      } else {
        // For other users, find their profile and use Supabase Auth
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

        // Generate the same email format used when creating the user
        const generatedEmail = `${profile.username.toLowerCase().replace(/\s+/g, '')}@bloodconnect.internal`;
        
        // Try to sign in with the generated email and the password they provided
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: generatedEmail,
          password: password
        });

        if (signInError) {
          console.error('User login error:', signInError);
          toast({
            title: "Login Failed",
            description: "Invalid user ID or password",
            variant: "destructive"
          });
          return;
        }

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
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
