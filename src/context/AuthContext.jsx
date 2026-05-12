import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/users/profile');
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/users/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const { token, ...userData } = res.data;
    setUser(userData);
  };

  const register = async (userData) => {
    const res = await api.post('/api/users/register', userData);
    localStorage.setItem('token', res.data.token);
    const { token, ...newUser } = res.data;
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const loginWithToken = async (token) => {
    localStorage.setItem('token', token);
    try {
      const res = await api.get('/api/users/profile');
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      throw new Error('Failed to load profile after Google login.');
    }
  };

  const updateProfile = async (data) => {
    const res = await api.put('/api/users/profile', data);
    setUser(res.data);
  };

  const updateCurrency = async (currency) => {
    await api.put('/api/users/currency', { currency });
    setUser({ ...user, currency });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, register, logout, updateProfile, updateCurrency }}>
      {children}
    </AuthContext.Provider>
  );
};
