import React, { useState } from 'react';
import STKPaymentModal from './STKPaymentModal';
import BankPaymentModal from './BankPaymentModal';

const PaymentMethodSelector = ({ material, onClose, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentType, setPaymentType] = useState('full');
  const [partialAmount, setPartialAmount] = useState('');
  
  const remainingBalance = material.remainingBalance || 
    (material.totalBudget - (material.totalPaid || 0));
  
  // Calculate the actual amount to pay
  const getPaymentAmount = () => {
    if (paymentType === 'full') {
      return remainingBalance;
    }
    return parseFloat(partialAmount) || 0;
  };
  
  const paymentAmount = getPaymentAmount();
  
  // Check if M-Pesa is available for the selected amount
  const isMpesaAvailable = () => {
    if (paymentType === 'full') {
      return remainingBalance <= 250000;
    } else {
      return paymentAmount > 0 && paymentAmount <= 250000;
    }
  };
  
  const canUseMpesa = isMpesaAvailable();
  const mpesaDisabledReason = !canUseMpesa ? 
    (paymentType === 'full' ? `Full amount (KES ${remainingBalance.toLocaleString()}) exceeds M-Pesa limit of KES 250,000` :
     `Amount KES ${paymentAmount.toLocaleString()} is ${paymentAmount > 250000 ? 'above' : 'invalid'}`) : '';
  
  // Handle partial amount change without step validation issues
  const handlePartialAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPartialAmount(value);
    }
  };
  
  if (selectedMethod === 'mpesa') {
    return (
      <STKPaymentModal 
        material={material}
        preselectedAmount={paymentAmount}
        onClose={onClose}
        onPaymentComplete={onPaymentComplete}
      />
    );
  }
  
  if (selectedMethod === 'bank') {
    return (
      <BankPaymentModal 
        material={material}
        preselectedAmount={paymentAmount}
        onClose={onClose}
        onPaymentComplete={onPaymentComplete}
      />
    );
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-method-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Payment Method - {material.name}</h3>
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
        </div>
        
        {/* Payment Amount Selection */}
        <div className="payment-amount-section">
          <h4>Payment Amount</h4>
          <div className="payment-options">
            <label className="radio-label">
              <input
                type="radio"
                checked={paymentType === 'full'}
                onChange={() => setPaymentType('full')}
              />
              Pay Full Remaining (KES {parseFloat(remainingBalance).toLocaleString()})
            </label>
            <label className="radio-label">
              <input
                type="radio"
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
              value={partialAmount}
              onChange={handlePartialAmountChange}
              pattern="[0-9]*"
            />
          )}
        </div>
        
        {/* M-Pesa Option - Conditionally enabled based on selected amount */}
        <div 
          className={`payment-method ${canUseMpesa ? 'active' : 'disabled'}`}
          onClick={() => {
            if (canUseMpesa) {
              setSelectedMethod('mpesa');
            } else {
              alert(mpesaDisabledReason);
            }
          }}
          style={{ 
            opacity: canUseMpesa ? 1 : 0.5, 
            cursor: canUseMpesa ? 'pointer' : 'not-allowed' 
          }}
        >
          <div className="method-icon">📱</div>
          <h4>M-Pesa STK Push</h4>
          <p>Up to KES 250,000 per transaction</p>
          <p className="method-features">✓ Instant confirmation</p>
          <p className="method-features">✓ No manual code entry</p>
          {!canUseMpesa && (
            <p className="method-warning">
              ⚠️ {paymentType === 'full' 
                ? `Full amount exceeds KES 250,000 limit. Use partial payment.` 
                : `Amount exceeds KES 250,000 limit.`}
            </p>
          )}
          {canUseMpesa && paymentType === 'partial' && paymentAmount > 0 && (
            <p className="method-info">✓ Paying KES {paymentAmount.toLocaleString()} via M-Pesa</p>
          )}
        </div>
        
        {/* Bank Transfer Option - Always available */}
        <div 
          className="payment-method active"
          onClick={() => setSelectedMethod('bank')}
        >
          <div className="method-icon">🏦</div>
          <h4>Bank Transfer</h4>
          <p>Unlimited amount</p>
          <p className="method-features">✓ Large payments supported</p>
          <p className="method-features">✓ Payment confirmation required</p>
          <p className="method-features">✓ Secure bank transfer</p>
          {paymentType === 'partial' && paymentAmount > 0 && (
            <p className="method-info">✓ Paying KES {paymentAmount.toLocaleString()} via Bank Transfer</p>
          )}
        </div>
        
        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;