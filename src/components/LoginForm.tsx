
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, get the user's email from the profiles table using their user ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userId)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Login Failed",
          description: "Invalid user ID or password",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // For now, we'll create a simple authentication check
      // Since we can't validate passwords directly with Supabase auth using custom user IDs,
      // we'll implement a basic check for the admin user
      if (userId === 'admin' && password === 'BloodConnect2024!') {
        // Create a session by signing in with a dummy email for the admin
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@bloodconnect.com',
          password: 'BloodConnect2024!'
        });

        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully!",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid user ID or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Blood Connect Portal</CardTitle>
          <CardDescription>
            Please enter your user ID and password to access the donor management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Default Admin Credentials</h3>
            <p className="text-sm text-gray-600">
              <strong>User ID:</strong> admin<br />
              <strong>Password:</strong> BloodConnect2024!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
