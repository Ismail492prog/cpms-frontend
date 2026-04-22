import axiosInstance from './axiosConfig';

export const expenseAPI = {
  // Categories
  getCategories: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/expense-categories`),
  
  // Expenses
  createExpense: (projectId, expenseData) => 
    axiosInstance.post(`/api/projects/${projectId}/expenses`, expenseData),
  getProjectExpenses: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/expenses`),
  deleteExpense: (projectId, expenseId) => 
    axiosInstance.delete(`/api/projects/${projectId}/expenses/${expenseId}`),
  
  // Labor Costs
  createLaborCost: (projectId, laborData) => 
    axiosInstance.post(`/api/projects/${projectId}/labor-costs`, laborData),
  getLaborCosts: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/labor-costs`),
  
  // Equipment Rentals
  createEquipmentRental: (projectId, rentalData) => 
    axiosInstance.post(`/api/projects/${projectId}/equipment-rentals`, rentalData),
  getEquipmentRentals: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/equipment-rentals`),

  // Update expense
  updateExpense: (projectId, expenseId, expenseData) => 
    axiosInstance.put(`/api/projects/${projectId}/expenses/${expenseId}`, expenseData),
  
  // Summary
  getExpenseSummary: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/expense-summary`),
};