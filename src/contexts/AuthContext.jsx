import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from './SupabaseContext';

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
  const supabase = useSupabase();

  useEffect(() => {
    // Simulate auth state check
    const checkUser = async () => {
      setLoading(false);
    };
    
    checkUser();
  }, []);

  const signIn = async (email, password) => {
    // Demo sign in - replace with actual Supabase auth
    setUser({ 
      id: '1', 
      email, 
      role: email.includes('operator') ? 'operator' : 'customer' 
    });
    return { user: { email, role: email.includes('operator') ? 'operator' : 'customer' } };
  };

  const signUp = async (email, password, userData) => {
    // Demo sign up - replace with actual Supabase auth
    setUser({ 
      id: '1', 
      email, 
      role: userData.role || 'customer',
      ...userData 
    });
    return { user: { email, role: userData.role || 'customer', ...userData } };
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};