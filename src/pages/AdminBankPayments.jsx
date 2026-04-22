import React, { useState, useEffect, useCallback } from 'react';
import { bankPaymentAPI } from '../api/bankPaymentApi';
import toast from 'react-hot-toast';

const AdminBankPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingPayments = useCallback(async () => {
    try {
      const response = await bankPaymentAPI.getPendingPayments();
      setPayments(response.data.payments || []);
    } catch {
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const handleConfirm = async (paymentId) => {
    if (window.confirm('Confirm this payment? This will deduct the amount from the material budget.')) {
      try {
        await bankPaymentAPI.confirmBankPayment(paymentId);
        toast.success('Payment confirmed successfully');
        await fetchPendingPayments();
      } catch {
        toast.error('Failed to confirm payment');
      }
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await bankPaymentAPI.rejectBankPayment(paymentId, reason);
        toast.success('Payment rejected');
        await fetchPendingPayments();
      } catch {
        toast.error('Failed to reject payment');
      }
    }
  };

  if (loading) return <div className="loading-spinner">Loading pending payments...</div>;

  return (
    <div className="admin-payments">
      <h2>Pending Bank Payments</h2>
      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No pending payments.</p>
        </div>
      ) : (
        <div className="payments-list">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Amount (KES)</th>
                <th>Bank</th>
                <th>Account Holder</th>
                <th>Payee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.paymentId}>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td><code>{payment.referenceNumber}</code></td>
                  <td className="amount">KES {parseFloat(payment.amount).toLocaleString()}</td>
                  <td>{payment.bankName}</td>
                  <td>{payment.accountHolderName}</td>
                  <td>{payment.payeeName}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleConfirm(payment.paymentId)} 
                      className="confirm-btn"
                      title="Confirm payment"
                    >
                      ✅ Confirm
                    </button>
                    <button 
                      onClick={() => handleReject(payment.paymentId)} 
                      className="reject-btn"
                      title="Reject payment"
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBankPayments;