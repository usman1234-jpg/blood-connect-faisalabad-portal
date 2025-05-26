import React, { createContext, useContext, useState, useEffect } from 'react';

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
  changeUserPassword: (userId: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default main admin credentials
const DEFAULT_MAIN_ADMIN = {
  id: 'main-admin-1',
  username: 'admin',
  password: 'bloodconnect2024',
  role: 'main-admin' as UserRole,
  university: 'System',
  fullName: 'Main Administrator',
  note: 'Default main administrator',
  dateAdded: '2024-01-01',
  addedBy: 'System'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password: string })[]>([]);

  // Initialize users and load from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('bloodConnectUsers');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Error parsing users from localStorage:', error);
        // Initialize with default main admin if parsing fails
        const defaultUsers = [DEFAULT_MAIN_ADMIN];
        setUsers(defaultUsers);
        localStorage.setItem('bloodConnectUsers', JSON.stringify(defaultUsers));
      }
    } else {
      // Initialize with default main admin
      const defaultUsers = [DEFAULT_MAIN_ADMIN];
      setUsers(defaultUsers);
      localStorage.setItem('bloodConnectUsers', JSON.stringify(defaultUsers));
    }

    // Check if user is already logged in
    const authStatus = localStorage.getItem('bloodConnectAuth');
    const userData = localStorage.getItem('bloodConnectUser');
    if (authStatus === 'true' && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
  }, []);

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('bloodConnectUsers', JSON.stringify(users));
    }
  }, [users]);

  const login = (username: string, password: string): boolean => {
    const validUser = users.find(
      user => user.username === username && user.password === password
    );
    
    if (validUser) {
      const userData: User = {
        id: validUser.id,
        username: validUser.username,
        role: validUser.role,
        university: validUser.university,
        fullName: validUser.fullName,
        note: validUser.note,
        dateAdded: validUser.dateAdded,
        addedBy: validUser.addedBy
      };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('bloodConnectAuth', 'true');
      localStorage.setItem('bloodConnectUser', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('bloodConnectAuth');
    localStorage.removeItem('bloodConnectUser');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role === 'main-admin';
  };

  const isMainAdmin = (): boolean => {
    return user?.role === 'main-admin';
  };

  const canEdit = (): boolean => {
    return user?.role === 'admin' || user?.role === 'main-admin';
  };

  const getAllUsers = (): User[] => {
    return users.map(({ password, ...userData }) => userData);
  };

  const addUser = (userData: Omit<User, 'id' | 'dateAdded' | 'addedBy'> & { password: string }): boolean => {
    if (!isMainAdmin()) return false;

    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      return false;
    }

    const { password, ...userDataWithoutPassword } = userData;

    const newUser = {
      ...userDataWithoutPassword,
      id: Date.now().toString(),
      password: password, // Use the provided password instead of default
      dateAdded: new Date().toISOString().split('T')[0],
      addedBy: user?.username || 'Unknown'
    };

    setUsers([...users, newUser]);
    return true;
  };

  const updateUser = (userId: string, userData: Partial<User>): boolean => {
    if (!isMainAdmin()) return false;

    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    ));
    return true;
  };

  const deleteUser = (userId: string): boolean => {
    if (!isMainAdmin()) return false;
    
    // Prevent deleting main admin
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'main-admin') return false;

    setUsers(users.filter(user => user.id !== userId));
    return true;
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (!user) return false;

    const currentUser = users.find(u => u.id === user.id);
    if (!currentUser || currentUser.password !== oldPassword) {
      return false;
    }

    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, password: newPassword }
        : u
    ));
    return true;
  };

  const changeUserPassword = (userId: string, newPassword: string): boolean => {
    if (!isMainAdmin()) return false;

    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, password: newPassword }
        : u
    ));
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      isAdmin, 
      isMainAdmin, 
      canEdit,
      getAllUsers,
      addUser,
      updateUser,
      deleteUser,
      changePassword,
      changeUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
