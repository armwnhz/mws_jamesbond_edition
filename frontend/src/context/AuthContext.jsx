import { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      setUser(res.data);
      return res.data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    finally {
      setUser(null);
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const fetchMe = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      setUser(null);
      if (error.response?.status === 401) {
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    hasFetched.current = false;
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchMe, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};