import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Users, Settings, Trash2, Edit } from 'lucide-react';
import { universities } from '../types/donor';

const AdminManagement = () => {
  const { toast } = useToast();
  const { getAllUsers, addUser, updateUser, deleteUser, changePassword, user } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const [newUserData, setNewUserData] = useState({
    username: '',
    role: 'user' as 'admin' | 'user',
    university: '',
    fullName: '',
    note: '',
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

  const users = getAllUsers();

  const handleAddUser = () => {
    if (!newUserData.username || !newUserData.fullName || !newUserData.password) {
      toast({
        title: 'Error',
        description: 'Username, full name, and password are required',
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

    const success = addUser(newUserData);
    if (success) {
      toast({
        title: 'Success',
        description: `User added successfully! Password: ${newUserData.password}`,
        variant: 'default'
      });
      setNewUserData({
        username: '',
        role: 'user',
        university: '',
        fullName: '',
        note: '',
        password: ''
      });
      setShowAddUser(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add user. Username may already exist.',
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
        fullName: userToEdit.fullName || '',
        note: userToEdit.note || ''
      });
      setEditingUser(userId);
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const success = updateUser(editingUser, editUserData);
    if (success) {
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
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = deleteUser(userId);
      if (success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully!',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive'
        });
      }
    }
  };

  const handleChangePassword = () => {
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

    const success = changePassword(passwordData.oldPassword, passwordData.newPassword);
    if (success) {
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
    } else {
      toast({
        title: 'Error',
        description: 'Current password is incorrect',
        variant: 'destructive'
      });
    }
  };

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
            <CardDescription>Create a new user or admin account with initial password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="password">Initial Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  placeholder="Enter initial password (min 6 characters)"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
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
                      userData.fullName || '-'
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
                  <TableCell>{userData.dateAdded}</TableCell>
                  <TableCell>{userData.addedBy || '-'}</TableCell>
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
