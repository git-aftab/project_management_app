import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

export const CURRENT_USER_KEY = ['currentUser'];

const fetchCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  const res = await api.get('/auth/current-user');
  return res.data?.data || null;
};

/**
 * useCurrentUser — wraps /auth/current-user with TanStack Query.
 * - Deduplicates concurrent requests automatically.
 * - Caches for 5 minutes; re-validates on window focus.
 * - Returns null (not an error) when no token exists.
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,             // don't retry auth failures
  });
};
