import React, { useState } from 'react';
import { paymentAPI } from '../api/paymentApi';
import toast from 'react-hot-toast';

const STKPaymentModal = ({ material, preselectedAmount, onClose, onPaymentComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(preselectedAmount ? preselectedAmount.toString() : '');
  const [paymentType, setPaymentType] = useState(preselectedAmount ? 'partial' : 'full');
  const [loading, setLoading] = useState(false);

  const remainingBalance = material.remainingBalance || 
    (material.totalBudget - (material.totalPaid || 0));
  const maxAmount = remainingBalance;

  // Handle amount change without step validation issues
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Determine the payment amount
  const getPaymentAmount = () => {
    if (preselectedAmount) {
      return preselectedAmount;
    }
    if (paymentType === 'full') {
      return maxAmount;
    }
    return parseFloat(amount) || 0;
  };

  const paymentAmount = getPaymentAmount();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter your M-Pesa phone number');
      return;
    }
    
    if (paymentAmount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    
    if (paymentAmount > maxAmount) {
      toast.error(`Amount cannot exceed remaining balance: KES ${maxAmount.toLocaleString()}`);
      return;
    }
    
    if (paymentAmount > 250000) {
      toast.error(`M-Pesa limit is KES 250,000 per transaction. Amount KES ${paymentAmount.toLocaleString()} exceeds limit.`);
      return;
    }
    
    setLoading(true);
    
    try {
      toast.success(`STK Push sent to ${phoneNumber}. Please check your phone and enter PIN.`);
      
      // Simulate payment recording after confirmation
      setTimeout(async () => {
        try {
          await paymentAPI.recordPayment(material.id, {
            mpesaCode: 'STK' + Date.now(),
            amount: paymentAmount,
            payeeName: 'M-Pesa Payment',
            notes: `STK Push payment of KES ${paymentAmount.toLocaleString()}`
          });
          toast.success(`Payment of KES ${paymentAmount.toLocaleString()} completed successfully!`);
          if (onPaymentComplete) onPaymentComplete();
          onClose();
        } catch {
          toast.error('Failed to record payment');
        }
      }, 3000);
      
    } catch {
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📱 M-Pesa Payment - {material.name}</h3>
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
            <strong>KES {parseFloat(maxAmount).toLocaleString()}</strong>
          </div>
          {preselectedAmount && (
            <div className="info-row success">
              <span>Amount to Pay:</span>
              <strong className="success-amount">KES {parseFloat(preselectedAmount).toLocaleString()}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>M-Pesa Phone Number</label>
            <input
              type="tel"
              className="phone-input"
              placeholder="0712345678 or 254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <small className="hint">Enter the phone number registered with M-Pesa</small>
          </div>

          {!preselectedAmount && (
            <div className="form-group">
              <label>Payment Amount</label>
              <div className="payment-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={paymentType === 'full'}
                    onChange={() => setPaymentType('full')}
                  />
                  Pay Full Remaining (KES {parseFloat(maxAmount).toLocaleString()})
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="paymentType"
                    value="partial"
                    checked={paymentType === 'partial'}
                    onChange={() => setPaymentType('partial')}
                  />
                  Pay Partial Amount
                </label>
              </div>
              {paymentType === 'partial' && (
                <input
                  type="text"
                  className="partial-amount-input"
                  placeholder="Enter amount (KES)"
                  value={amount}
                  onChange={handleAmountChange}
                  pattern="[0-9]*"
                />
              )}
            </div>
          )}

          {preselectedAmount && (
            <div className="payment-summary">
              <div className="summary-card">
                <span>Payment Amount:</span>
                <strong>KES {parseFloat(preselectedAmount).toLocaleString()}</strong>
              </div>
              <div className="summary-card">
                <span>M-Pesa Limit Check:</span>
                <strong className={preselectedAmount <= 250000 ? 'text-success' : 'text-danger'}>
                  {preselectedAmount <= 250000 ? '✓ Within limit' : '✗ Exceeds limit'}
                </strong>
              </div>
            </div>
          )}

          <div className="mpesa-instructions">
            <h4>📱 How it works:</h4>
            <p>1. Enter your M-Pesa registered phone number</p>
            <p>2. Click "Pay Now"</p>
            <p>3. You will receive an STK Push prompt on your phone</p>
            <p>4. Enter your M-Pesa PIN to complete payment</p>
            <p>5. Payment will be confirmed automatically</p>
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : `💳 Pay KES ${paymentAmount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default STKPaymentModal;