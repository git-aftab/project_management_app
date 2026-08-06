import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export const subtasksKey = (projectId, taskId) => ['subtasks', projectId, taskId];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetchSubtasks = async (projectId, taskId) => {
  const res = await api.get(`/tasks/${projectId}/t/${taskId}`);
  return res.data?.data?.subtasks || [];
};

// ─── Query ────────────────────────────────────────────────────────────────────

export const useSubtasks = (projectId, taskId) =>
  useQuery({
    queryKey: subtasksKey(projectId, taskId),
    queryFn: () => fetchSubtasks(projectId, taskId),
    enabled: Boolean(projectId && taskId),
    staleTime: 1000 * 30,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Add a subtask to a task */
export const useAddSubtask = (projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: subtasksKey(projectId, taskId) }),
  });
};

/** Toggle subtask completion */
export const useToggleSubtask = (projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subTaskId, isCompleted }) =>
      api.put(`/tasks/${projectId}/st/${subTaskId}`, { isCompleted }),
    // Optimistic toggle so the checkbox feels instant
    onMutate: async ({ subTaskId, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: subtasksKey(projectId, taskId) });
      const previous = queryClient.getQueryData(subtasksKey(projectId, taskId));
      queryClient.setQueryData(subtasksKey(projectId, taskId), (old = []) =>
        old.map((st) => (st._id === subTaskId ? { ...st, isCompleted } : st))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(subtasksKey(projectId, taskId), context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: subtasksKey(projectId, taskId) }),
  });
};

/** Delete a subtask */
export const useDeleteSubtask = (projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subTaskId) =>
      api.delete(`/tasks/${projectId}/st/${subTaskId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: subtasksKey(projectId, taskId) }),
  });
};
