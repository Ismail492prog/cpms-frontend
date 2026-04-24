import axiosInstance from './axiosConfig';

export const bankPaymentAPI = {
  // Record bank payment
  recordBankPayment: (materialId, paymentData) => 
    axiosInstance.post(`/api/bank-payments/materials/${materialId}`, paymentData),
  
  // Confirm bank payment
  confirmBankPayment: (paymentId) => 
    axiosInstance.put(`/api/bank-payments/${paymentId}/confirm`, {}),
  
  // Reject bank payment
  rejectBankPayment: (paymentId, reason) => 
    axiosInstance.put(`/api/bank-payments/${paymentId}/reject`, { reason }),
  
  // Get bank payments for material
  getMaterialBankPayments: (materialId) => 
    axiosInstance.get(`/api/bank-payments/materials/${materialId}`),
  
  // Get all pending payments
  getPendingPayments: () => 
    axiosInstance.get('/api/bank-payments/pending'),
  
  // Delete bank payment
  deleteBankPayment: (paymentId) => 
    axiosInstance.delete(`/api/bank-payments/${paymentId}`),
};