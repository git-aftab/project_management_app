import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export const notesKey = (projectId) => ['notes', projectId];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetchNotes = async (projectId) => {
  const res = await api.get(`/notes/${projectId}`);
  return res.data?.data || [];
};

// ─── Query ────────────────────────────────────────────────────────────────────

export const useNotes = (projectId) =>
  useQuery({
    queryKey: notesKey(projectId),
    queryFn: () => fetchNotes(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a note */
export const useCreateNote = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/notes/${projectId}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notesKey(projectId) }),
  });
};

/** Delete a note */
export const useDeleteNote = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId) => api.delete(`/notes/${projectId}/n/${noteId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notesKey(projectId) }),
  });
};
