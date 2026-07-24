import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track whether the initial session restore has completed
  const initialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await authAPI.getMe();
          setUser(userData);
          localStorage.setItem('meditriage_user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear all stale auth data
        await supabase.auth.signOut().catch(() => {});
        localStorage.removeItem('meditriage_token');
        localStorage.removeItem('meditriage_user');
      } finally {
        initialized.current = true;
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only react to SIGNED_IN after the initial session restore is done
        // This prevents a race between initAuth() and onAuthStateChange
        if (event === 'SIGNED_IN' && session?.user && initialized.current) {
          try {
            const userData = await authAPI.getMe();
            setUser(userData);
            localStorage.setItem('meditriage_user', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to get user profile:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('meditriage_user');
          localStorage.removeItem('meditriage_token');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (userData) => {
    setUser(userData);
    localStorage.setItem('meditriage_user', JSON.stringify(userData));
  };

  const logout = async () => {
    initialized.current = false;
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('meditriage_user');
    localStorage.removeItem('meditriage_token');
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = await authAPI.updateProfile(updates);
      setUser(updatedUser);
      localStorage.setItem('meditriage_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
