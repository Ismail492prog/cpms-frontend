import axiosInstance from './axiosConfig';

export const mpesaAPI = {
  // Initiate STK Push
  initiateSTKPush: (materialId, phoneNumber, amount) => 
    axiosInstance.post(`/materials/${materialId}/stkpush`, {
      phoneNumber: phoneNumber,
      amount: amount,
      accountReference: 'CPMS Payment',
      transactionDesc: 'Construction Material Payment'
    }),
  
  // Check transaction status
  checkTransactionStatus: (checkoutRequestId) => 
    axiosInstance.get(`/mpesa/status/${checkoutRequestId}`),
};