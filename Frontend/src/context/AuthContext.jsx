import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/current-user');
      setUser(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (loginIdentifier, password) => {
    const isEmail = loginIdentifier.includes('@');
    const payload = {
      loginIdentifier,
      email: isEmail ? loginIdentifier : undefined,
      username: !isEmail ? loginIdentifier : undefined,
      password,
    };
    const res = await api.post('/auth/login', payload);
    const { user: loggedUser, accessToken, refreshToken } = res.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(loggedUser);
    return res.data;
  };

  const register = async (username, email, fullName, password, avatarFile) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('fullName', fullName);
    formData.append('password', password);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    const res = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
