import axiosInstance from './axiosConfig';

export const projectAPI = {
  // Create new project
  createProject: (projectData) => axiosInstance.post('/api/projects', projectData),
  
  // Get all projects
  getAllProjects: () => axiosInstance.get('/api/projects'),
  
  // Get single project
  getProjectById: (id) => axiosInstance.get(`/api/projects/${id}`),
  
  // Update project
  updateProject: (id, projectData) => axiosInstance.put(`/api/projects/${id}`, projectData),
  
  // Delete project
  deleteProject: (id) => axiosInstance.delete(`/api/projects/${id}`),
  
  // Get project summary
  getProjectSummary: (id) => axiosInstance.get(`/api/projects/${id}/summary`),
};