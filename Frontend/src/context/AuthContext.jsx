import React, { createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { useCurrentUser, CURRENT_USER_KEY } from '../hooks/useAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading } = useCurrentUser();

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

    // Seed the cache with the logged-in user — no extra request needed
    queryClient.setQueryData(CURRENT_USER_KEY, loggedUser);
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
      // Clear all cached data on logout
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        loading,
        login,
        register,
        logout,
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
