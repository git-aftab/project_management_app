import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export const tasksKey = (projectId) => ['tasks', projectId];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetchTasks = async (projectId) => {
  const res = await api.get(`/tasks/${projectId}`);
  return res.data?.data || [];
};

// ─── Query ────────────────────────────────────────────────────────────────────

export const useTasks = (projectId) =>
  useQuery({
    queryKey: tasksKey(projectId),
    queryFn: () => fetchTasks(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a task */
export const useCreateTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/tasks/${projectId}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
};

/** Update a task (status, title, etc.) */
export const useUpdateTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }) =>
      api.put(`/tasks/${projectId}/t/${taskId}`, data),
    // Optimistic update for drag-and-drop
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: tasksKey(projectId) });
      const previous = queryClient.getQueryData(tasksKey(projectId));
      queryClient.setQueryData(tasksKey(projectId), (old) =>
        (old || []).map((t) => (t._id === taskId ? { ...t, ...data } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Revert on failure
      queryClient.setQueryData(tasksKey(projectId), context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
};

/** Delete a task */
export const useDeleteTask = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${projectId}/t/${taskId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: tasksKey(projectId) }),
  });
};
