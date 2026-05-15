import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, logoutApi, registerApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session on app launch
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
      } catch (_) {}
      finally { setLoading(false); }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    await AsyncStorage.setItem('access_token',  data.access);
    // Mobile: store refresh in AsyncStorage (no HttpOnly cookie available)
    if (data.refresh) await AsyncStorage.setItem('refresh_token', data.refresh);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    await registerApi(payload);
  };

  const logout = async () => {
    try {
      const refresh = await AsyncStorage.getItem('refresh_token');
      if (refresh) await logoutApi(refresh);
    } catch (_) {}
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
