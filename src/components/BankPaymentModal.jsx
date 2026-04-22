import React, { useState } from 'react';
import { bankPaymentAPI } from '../api/bankPaymentApi';
import toast from 'react-hot-toast';

const BankPaymentModal = ({ material, preselectedAmount, onClose, onPaymentComplete }) => {
  const [formData, setFormData] = useState({
    amount: preselectedAmount ? preselectedAmount.toString() : '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    referenceNumber: '',
    payeeName: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const remainingBalance = material.remainingBalance || 
    (material.totalBudget - (material.totalPaid || 0));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    if (amount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    
    if (amount > remainingBalance) {
      toast.error(`Amount cannot exceed remaining balance: KES ${remainingBalance.toLocaleString()}`);
      return;
    }
    
    setLoading(true);
    
    try {
      await bankPaymentAPI.recordBankPayment(material.id, {
        amount: amount,
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        referenceNumber: formData.referenceNumber,
        payeeName: formData.payeeName,
        notes: formData.notes,
        paymentDate: formData.paymentDate
      });
      
      toast.success(`Bank payment of KES ${amount.toLocaleString()} recorded. Awaiting confirmation.`);
      if (onPaymentComplete) onPaymentComplete();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record bank payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bank-payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏦 Bank Transfer Payment - {material.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-info">
          <div className="info-row">
            <span>Total Budget:</span>
            <strong>KES {parseFloat(material.totalBudget).toLocaleString()}</strong>
          </div>
          <div className="info-row">
            <span>Already Paid:</span>
            <strong>KES {parseFloat(material.totalPaid || 0).toLocaleString()}</strong>
          </div>
          <div className="info-row highlight">
            <span>Remaining Balance:</span>
            <strong>KES {parseFloat(remainingBalance).toLocaleString()}</strong>
          </div>
          {preselectedAmount && (
            <div className="info-row success">
              <span>Amount to Pay:</span>
              <strong className="success-amount">KES {parseFloat(preselectedAmount).toLocaleString()}</strong>
            </div>
          )}
        </div>

        <div className="bank-instructions">
          <h4>🏦 Bank Transfer Details</h4>
          <p><strong>Bank:</strong> Cooperative Bank of Kenya</p>
          <p><strong>Account Name:</strong> CPMS Construction Ltd</p>
          <p><strong>Account Number:</strong> 01112345678900</p>
          <p><strong>Branch:</strong> Nairobi, Kenya</p>
          <p><strong>Swift Code:</strong> KCOOKENA</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (KES) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
                max={remainingBalance}
                step="1000"
                placeholder="Enter amount"
                readOnly={!!preselectedAmount}
              />
              <small>Max: KES {parseFloat(remainingBalance).toLocaleString()}</small>
            </div>
            
            <div className="form-group">
              <label>Payment Date *</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reference Number *</label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              required
              placeholder="e.g., INV-001, TRF-2024-001"
            />
          </div>

          <div className="form-group">
            <label>Payee Name (Supplier/Vendor) *</label>
            <input
              type="text"
              name="payeeName"
              value={formData.payeeName}
              onChange={handleChange}
              required
              placeholder="e.g., Juja Hardware Ltd"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bank Name *</label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
              >
                <option value="">Select Bank</option>
                <option value="KCB Bank Kenya">KCB Bank Kenya</option>
                <option value="Equity Bank">Equity Bank</option>
                <option value="Cooperative Bank">Cooperative Bank</option>
                <option value="Standard Chartered">Standard Chartered</option>
                <option value="Absa Bank Kenya">Absa Bank Kenya</option>
                <option value="NCBA Bank">NCBA Bank</option>
                <option value="Diamond Trust Bank">Diamond Trust Bank</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Account Holder Name *</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                required
                placeholder="Account holder name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Account Number *</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="Account number"
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional payment details..."
              rows="3"
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Recording...' : `💰 Record Payment of KES ${parseFloat(formData.amount || 0).toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankPaymentModal;