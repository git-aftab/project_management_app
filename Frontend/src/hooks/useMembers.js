import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export const membersKey = (projectId) => ['members', projectId];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetchMembers = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/members`);
  return res.data?.data || [];
};

// ─── Query ────────────────────────────────────────────────────────────────────

export const useMembers = (projectId) =>
  useQuery({
    queryKey: membersKey(projectId),
    queryFn: () => fetchMembers(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Add a member */
export const useAddMember = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/projects/${projectId}/members`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membersKey(projectId) }),
  });
};

/** Remove a member */
export const useRemoveMember = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.delete(`/projects/${projectId}/members/${userId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membersKey(projectId) }),
  });
};

/** Update a member's role */
export const useUpdateMemberRole = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newRole }) =>
      api.put(`/projects/${projectId}/members/${userId}`, { newRole }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: membersKey(projectId) }),
  });
};
