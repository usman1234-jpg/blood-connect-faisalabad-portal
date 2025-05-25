
import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'user';

interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Credentials - you can change these as needed
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'bloodconnect2024', role: 'admin' as UserRole },
  { username: 'user', password: 'user123', role: 'user' as UserRole }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in on page load
  useEffect(() => {
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

  const login = (username: string, password: string): boolean => {
    const validUser = VALID_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    );
    
    if (validUser) {
      const userData = { username: validUser.username, role: validUser.role };
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
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
