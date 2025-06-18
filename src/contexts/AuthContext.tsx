
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

type UserRole = 'main-admin' | 'admin' | 'user';

interface User {
  id: string;
  username: string;
  role: UserRole;
  university?: string;
  fullName?: string;
  note?: string;
  dateAdded: string;
  addedBy?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  isMainAdmin: () => boolean;
  canEdit: () => boolean;
  getAllUsers: () => User[];
  addUser: (userData: Omit<User, 'id' | 'dateAdded' | 'addedBy'> & { password: string }) => boolean;
  updateUser: (userId: string, userData: Partial<User>) => boolean;
  deleteUser: (userId: string) => boolean;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole, isAuthenticated, signOut } = useSupabaseAuth();

  // Legacy compatibility functions - these now just redirect to Supabase auth
  const login = (username: string, password: string): boolean => {
    console.warn('Legacy login function called - use Supabase authentication instead');
    return false;
  };

  const logout = () => {
    signOut();
  };

  const isAdmin = (): boolean => {
    return userRole === 'admin' || userRole === 'main-admin';
  };

  const isMainAdmin = (): boolean => {
    return userRole === 'main-admin';
  };

  const canEdit = (): boolean => {
    return userRole === 'admin' || userRole === 'main-admin';
  };

  // Legacy functions - these are now handled in AdminManagement component
  const getAllUsers = (): User[] => {
    console.warn('Legacy getAllUsers function called - use AdminManagement component instead');
    return [];
  };

  const addUser = (userData: Omit<User, 'id' | 'dateAdded' | 'addedBy'> & { password: string }): boolean => {
    console.warn('Legacy addUser function called - use AdminManagement component instead');
    return false;
  };

  const updateUser = (userId: string, userData: Partial<User>): boolean => {
    console.warn('Legacy updateUser function called - use AdminManagement component instead');
    return false;
  };

  const deleteUser = (userId: string): boolean => {
    console.warn('Legacy deleteUser function called - use AdminManagement component instead');
    return false;
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    console.warn('Legacy changePassword function called - use AdminManagement component instead');
    return false;
  };

  const legacyUser: User | null = user ? {
    id: user.id,
    username: user.username || user.email || '',
    role: userRole as UserRole,
    university: user.university,
    fullName: user.full_name,
    note: user.note,
    dateAdded: user.date_added || '',
    addedBy: user.added_by
  } : null;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user: legacyUser, 
      login, 
      logout, 
      isAdmin, 
      isMainAdmin, 
      canEdit,
      getAllUsers,
      addUser,
      updateUser,
      deleteUser,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
