
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { UserPlus, Users, Settings, Trash2, Edit } from 'lucide-react';
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

const AdminManagement = () => {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newUserData, setNewUserData] = useState({
    username: '',
    role: 'user' as 'admin' | 'user',
    university: '',
    fullName: '',
    note: '',
    email: '',
    password: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [editUserData, setEditUserData] = useState({
    username: '',
    university: '',
    fullName: '',
    note: ''
  });

  // Load users and universities
  useEffect(() => {
    loadUsers();
    loadUniversities();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setUniversities(data?.map(u => u.name) || []);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.username || !newUserData.fullName || !newUserData.email || !newUserData.password) {
      toast({
        title: 'Error',
        description: 'Username, full name, email, and password are required',
        variant: 'destructive'
      });
      return;
    }

    if (newUserData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserData.email,
        password: newUserData.password,
        user_metadata: {
          username: newUserData.username,
          full_name: newUserData.fullName,
          role: newUserData.role
        }
      });

      if (authError) throw authError;

      // The profile will be created automatically via the trigger
      // Just refresh the users list
      await loadUsers();

      toast({
        title: 'Success',
        description: `User added successfully!`,
        variant: 'default'
      });

      setNewUserData({
        username: '',
        role: 'user',
        university: '',
        fullName: '',
        note: '',
        email: '',
        password: ''
      });
      setShowAddUser(false);
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add user',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setEditUserData({
        username: userToEdit.username,
        university: userToEdit.university || '',
        fullName: userToEdit.full_name || '',
        note: userToEdit.note || ''
      });
      setEditingUser(userId);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUserData.username,
          university: editUserData.university,
          full_name: editUserData.fullName,
          note: editUserData.note
        })
        .eq('id', editingUser);

      if (error) throw error;

      await loadUsers();
      
      toast({
        title: 'Success',
        description: 'User updated successfully!',
        variant: 'default'
      });
      
      setEditingUser(null);
      setEditUserData({
        username: '',
        university: '',
        fullName: '',
        note: ''
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'main-admin') {
      toast({
        title: 'Error',
        description: 'Cannot delete main admin user',
        variant: 'destructive'
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete from auth.users (this will cascade to profiles)
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) throw error;

        await loadUsers();
        
        toast({
          title: 'Success',
          description: 'User deleted successfully!',
          variant: 'default'
        });
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive'
        });
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password changed successfully!',
        variant: 'default'
      });
      
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-96">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
          <p className="text-gray-600">Manage users, admins, and system settings</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddUser(!showAddUser)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button
            onClick={() => setShowChangePassword(!showChangePassword)}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user or admin account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData({...newUserData, role: value as 'admin' | 'user'})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (Read Only)</SelectItem>
                    <SelectItem value="admin">Admin (Can Edit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="university">University</Label>
                <Select value={newUserData.university} onValueChange={(value) => setNewUserData({...newUserData, university: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={newUserData.note}
                onChange={(e) => setNewUserData({...newUserData, note: e.target.value})}
                placeholder="Additional notes about this user"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
                Add User
              </Button>
              <Button onClick={() => setShowAddUser(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Password Form */}
      {showChangePassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleChangePassword} className="bg-blue-600 hover:bg-blue-700">
                Change Password
              </Button>
              <Button onClick={() => setShowChangePassword(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users & Admins
          </CardTitle>
          <CardDescription>Manage all system users and administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell className="font-medium">{userData.username}</TableCell>
                  <TableCell>
                    {editingUser === userData.id ? (
                      <Input
                        value={editUserData.fullName}
                        onChange={(e) => setEditUserData({...editUserData, fullName: e.target.value})}
                        className="h-8"
                      />
                    ) : (
                      userData.full_name || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      userData.role === 'main-admin' ? 'bg-red-100 text-red-800' :
                      userData.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userData.role === 'main-admin' ? 'Main Admin' : 
                       userData.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {editingUser === userData.id ? (
                      <Select value={editUserData.university} onValueChange={(value) => setEditUserData({...editUserData, university: value})}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((uni) => (
                            <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      userData.university || '-'
                    )}
                  </TableCell>
                  <TableCell>{userData.date_added}</TableCell>
                  <TableCell>{userData.added_by || '-'}</TableCell>
                  <TableCell>
                    {editingUser === userData.id ? (
                      <Textarea
                        value={editUserData.note}
                        onChange={(e) => setEditUserData({...editUserData, note: e.target.value})}
                        className="h-16 text-xs"
                        rows={2}
                      />
                    ) : (
                      <span className="text-xs">{userData.note || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingUser === userData.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleUpdateUser}
                            className="h-8 bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(null)}
                            className="h-8"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {userData.role !== 'main-admin' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(userData.id)}
                                className="h-8"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(userData.id)}
                                className="h-8 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
