import axiosInstance from './axiosConfig';

export const reportAPI = {
  // Get project report data
  getProjectReport: (projectId) => 
    axiosInstance.get(`/api/reports/project/${projectId}`),  // Added /api/
  
  // Download PDF report
  downloadPDFReport: (projectId) => 
    axiosInstance.get(`/api/reports/project/${projectId}/pdf`, {  // Added /api/
      responseType: 'blob'
    }),
  
  // Download payment receipt
  downloadReceipt: (paymentId) => 
    axiosInstance.get(`/api/reports/payment/${paymentId}/receipt`, {  // Added /api/
      responseType: 'blob'
    }),
  
  // Send email report
  sendEmailReport: (projectId, email) => 
    axiosInstance.post(`/api/reports/project/${projectId}/email`, { email }),  // Added /api/
};