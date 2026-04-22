import axiosInstance from './axiosConfig';

export const paymentAPI = {
  // Record payment for a material
  recordPayment: (materialId, paymentData) => 
    axiosInstance.post(`/api/materials/${materialId}/payments`, paymentData),
  
  // Get all payments for a material
  getMaterialPayments: (materialId) => {
    console.log(`Fetching payments for material ID: ${materialId}`);
    return axiosInstance.get(`/api/materials/${materialId}/payments`);
  },
  
  // Get all payments for a project
  getProjectPayments: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/payments`),
  
  // Delete payment
  deletePayment: (paymentId) => 
    axiosInstance.delete(`/api/payments/${paymentId}`),
};