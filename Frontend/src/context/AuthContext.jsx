import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { INITIAL_USERS } from '../services/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to Donor for immediate rich visual exploration
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nourishnet_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nourishnet_theme') || 'light';
  });

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nourishnet_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nourishnet_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nourishnet_auth_user');
    }
  }, [currentUser]);

  // Check health on startup & every 15 seconds
  const verifyBackendHealth = async () => {
    const res = await api.checkHealth();
    setIsBackendOnline(res.isOnline);
    setBackendHealth(res.data);
  };

  useEffect(() => {
    verifyBackendHealth();
    const interval = setInterval(verifyBackendHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const switchRole = (roleName) => {
    const userForRole = INITIAL_USERS.find(u => u.role === roleName) || {
      user_id: Date.now(),
      name: `${roleName} User`,
      email: `${roleName.toLowerCase()}@nourishnet.org`,
      role: roleName,
      phone: '+91 98765 00000',
      address: 'Bengaluru, India',
      latitude: 12.9716,
      longitude: 77.5946
    };
    setCurrentUser(userForRole);
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.user) {
      setCurrentUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.data) {
      setCurrentUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'DONOR',
        setCurrentUser,
        theme,
        toggleTheme,
        isBackendOnline,
        backendHealth,
        verifyBackendHealth,
        switchRole,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
