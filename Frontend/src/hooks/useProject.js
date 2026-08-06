import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

export const projectsKey = () => ['projects'];
export const projectKey = (projectId) => ['project', projectId];

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const fetchProjects = async () => {
  const res = await api.get('/projects');
  return res.data?.data?.projects || res.data?.data || [];
};

const fetchProject = async (projectId) => {
  const res = await api.get(`/projects/${projectId}`);
  return res.data?.data;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch all projects for the dashboard */
export const useProjects = () =>
  useQuery({
    queryKey: projectsKey(),
    queryFn: fetchProjects,
    staleTime: 1000 * 30, // 30 seconds
  });

/** Fetch a single project by ID */
export const useProject = (projectId) =>
  useQuery({
    queryKey: projectKey(projectId),
    queryFn: () => fetchProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new project */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKey() }),
  });
};

/** Delete a project */
export const useDeleteProject = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/projects/${projectId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKey() }),
  });
};
