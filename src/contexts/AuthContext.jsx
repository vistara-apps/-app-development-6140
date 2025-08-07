import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      const token = apiService.getToken();
      
      if (token) {
        try {
          // Verify token and get user profile
          const response = await apiService.getProfile();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, remove it
            apiService.setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          apiService.setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { data: response.data, error: null };
      } else {
        return { data: null, error: { message: response.error } };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { data: response.data, error: null };
      } else {
        return { data: null, error: { message: response.error } };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      return { error: null };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data);
        return { data: response.data, error: null };
      } else {
        return { data: null, error: { message: response.error } };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error: { message: error.message } };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        return { data: response, error: null };
      } else {
        return { data: null, error: { message: response.error } };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { data: null, error: { message: error.message } };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
