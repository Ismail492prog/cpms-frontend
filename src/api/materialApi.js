import axiosInstance from './axiosConfig';

export const materialAPI = {
  // Create material
  createMaterial: (projectId, materialData) => 
    axiosInstance.post(`/api/projects/${projectId}/materials`, materialData),
  
  // Get all materials for a project
  getProjectMaterials: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/materials`),
  
  // Get single material
  getMaterialById: (projectId, materialId) => 
    axiosInstance.get(`/api/projects/${projectId}/materials/${materialId}`),
  
  // Update material
  updateMaterial: (projectId, materialId, materialData) => 
    axiosInstance.put(`/api/projects/${projectId}/materials/${materialId}`, materialData),
  
  // Delete material
  deleteMaterial: (projectId, materialId) => 
    axiosInstance.delete(`/api/projects/${projectId}/materials/${materialId}`),
  
  // Get payment status
  getPaymentStatus: (projectId, materialId) => 
    axiosInstance.get(`/api/projects/${projectId}/materials/${materialId}/payment-status`),
};