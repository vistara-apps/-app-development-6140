import React, { createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Demo credentials - replace with your actual Supabase credentials
const supabaseUrl = 'https://demo.supabase.co';
const supabaseKey = 'demo-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};