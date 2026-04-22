import { useState } from 'react';

const MaterialCard = ({ material }) => {
  const [step, setStep] = useState('selector'); // 'selector', 'mpesa', 'bank'
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'FULLY PAID':
        return <span className="status-badge fully-paid">🟢 FULLY PAID</span>;
      case 'PARTIALLY PAID':
        return <span className="status-badge partially-paid">🟡 PARTIALLY PAID</span>;
      default:
        return <span className="status-badge not-paid">🔴 NOT PAID</span>;
    }
  };

  const remainingBalance = material.totalBudget - (material.totalPaid || 0);
  const isFullyPaid = material.paymentStatus === 'FULLY PAID';
  const maxAmount = remainingBalance;

  const resetForm = () => {
    setStep('selector');
    setPaymentType('full');
    setPartialAmount('');
    setMpesaCode('');
    setPayeeName('');
    setNotes('');
    setShowModal(false);
  };

  const handleMpesaSubmit = async () => {
    const amount = paymentType === 'full' ? maxAmount : parseFloat(partialAmount);
    
    if (!mpesaCode) {
      alert('Please enter M-Pesa code');
      return;
    }
    if (!payeeName) {
      alert('Please enter payee name');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/materials/${material.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mpesaCode: mpesaCode.toUpperCase(),
          amount: amount,
          payeeName: payeeName,
          notes: notes
        })
      });
      
      if (response.ok) {
        alert(`Payment of KES ${amount.toLocaleString()} recorded successfully!`);
        resetForm();
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Payment failed');
      }
    } catch {
      // Removed unused 'error' variable
      alert('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="material-card">
        <div className="material-header">
          <h3>{material.name}</h3>
          <div className="material-actions">
            {!isFullyPaid && (
              <button className="pay-btn" onClick={() => setShowModal(true)}>
                💰 Pay
              </button>
            )}
          </div>
        </div>
        
        <div className="material-details">
          <p>📊 Total Budget: KES {material.totalBudget?.toLocaleString()}</p>
          <p>✅ Paid: KES {(material.totalPaid || 0).toLocaleString()}</p>
          <p>💵 Remaining: KES {remainingBalance.toLocaleString()}</p>
        </div>
        
        <div className="payment-status">
          {getStatusBadge(material.paymentStatus)}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${material.percentagePaid || 0}%` }}></div>
          </div>
          <span className="percentage">{material.percentagePaid?.toFixed(1) || 0}% Paid</span>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <>
          {/* Overlay */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 99999,
          }} onClick={() => setShowModal(false)} />
          
          {/* Modal Content */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 100000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            
            {/* STEP 1: Payment Method Selector */}
            {step === 'selector' && (
              <>
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Select Payment Method</h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>Choose how you want to pay</p>
                
                <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <strong>Remaining Balance:</strong> KES {remainingBalance.toLocaleString()}
                </div>
                
                <button
                  onClick={() => setStep('mpesa')}
                  style={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '12px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  📱 M-Pesa
                </button>
                
                <button
                  onClick={() => setStep('bank')}
                  style={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '12px',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  🏦 Bank Transfer
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            {/* STEP 2: M-Pesa Payment Form */}
            {step === 'mpesa' && (
              <>
                <button
                  onClick={() => setStep('selector')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    marginBottom: '15px',
                    padding: 0,
                    fontSize: '14px'
                  }}
                >
                  ← Back to Methods
                </button>
                
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>📱 M-Pesa Payment</h2>
                
                <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <p style={{ margin: '5px 0' }}><strong>Paybill Number:</strong> <span style={{ fontSize: '20px', color: '#27ae60' }}>123456</span></p>
                  <p style={{ margin: '5px 0' }}><strong>Amount to Pay:</strong> KES {paymentType === 'full' ? maxAmount.toLocaleString() : 'Enter below'}</p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payment Amount</label>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      <input type="radio" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} /> Full Payment (KES {maxAmount.toLocaleString()})
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="radio" checked={paymentType === 'partial'} onChange={() => setPaymentType('partial')} /> Partial Payment
                    </label>
                  </div>
                  {paymentType === 'partial' && (
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  )}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>M-Pesa Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., QWER12TY" 
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payee Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Juja Hardware" 
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
                  <textarea 
                    placeholder="Additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '60px' }}
                  />
                </div>
                
                <button
                  onClick={handleMpesaSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </>
            )}

            {/* STEP 3: Bank Transfer Form */}
            {step === 'bank' && (
              <>
                <button
                  onClick={() => setStep('selector')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#48bb78',
                    cursor: 'pointer',
                    marginBottom: '15px',
                    padding: 0,
                    fontSize: '14px'
                  }}
                >
                  ← Back to Methods
                </button>
                
                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>🏦 Bank Transfer</h2>
                
                <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                  <p><strong>Bank:</strong> Cooperative Bank of Kenya</p>
                  <p><strong>Account Name:</strong> CPMS Construction Ltd</p>
                  <p><strong>Account Number:</strong> 01112345678900</p>
                  <p><strong>Swift Code:</strong> KCOOKENA</p>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount</label>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      <input type="radio" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} /> Full Payment (KES {maxAmount.toLocaleString()})
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="radio" checked={paymentType === 'partial'} onChange={() => setPaymentType('partial')} /> Partial Payment
                    </label>
                  </div>
                  {paymentType === 'partial' && (
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  )}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reference Number *</label>
                  <input type="text" placeholder="e.g., INV-001" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Payee Name *</label>
                  <input type="text" placeholder="e.g., Juja Hardware" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bank Name *</label>
                  <select style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <option>KCB Bank Kenya</option>
                    <option>Equity Bank</option>
                    <option>Cooperative Bank</option>
                    <option>Standard Chartered</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Holder Name *</label>
                  <input type="text" placeholder="Account holder name" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Account Number *</label>
                  <input type="text" placeholder="Account number" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                </div>
                
                <button
                  onClick={() => alert('Bank payment recorded! Awaiting confirmation.')}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Record Bank Payment
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default MaterialCard;