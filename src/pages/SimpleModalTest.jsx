import { useState } from 'react';

const SimpleModalTest = () => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState('selector');

  const remainingBalance = 100000;

  if (step === 'mpesa') {
    return (
      <div style={{ padding: '40px' }}>
        <button onClick={() => setStep('selector')}>← Back</button>
        <h2>M-Pesa Payment Form</h2>
        <p>This is where M-Pesa form would go</p>
        <button onClick={() => alert('Payment submitted')}>Pay Now</button>
      </div>
    );
  }

  if (step === 'bank') {
    return (
      <div style={{ padding: '40px' }}>
        <button onClick={() => setStep('selector')}>← Back</button>
        <h2>Bank Transfer Form</h2>
        <p>This is where Bank form would go</p>
        <button onClick={() => alert('Bank payment submitted')}>Submit</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Payment Test Page</h1>
      <p>Click the button below to open the payment selector modal</p>
      
      <button
        onClick={() => setShowModal(true)}
        style={{
          backgroundColor: '#27ae60',
          color: 'white',
          padding: '15px 30px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        💰 Make Payment
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '24px',
            width: '90%',
            maxWidth: '450px'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 10px 0' }}>Select Payment Method</h2>
            
            <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <strong>Remaining Balance:</strong> KES {remainingBalance.toLocaleString()}
            </div>
            
            <button
              onClick={() => {
                setShowModal(false);
                setStep('mpesa');
              }}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              📱 M-Pesa
            </button>
            
            <button
              onClick={() => {
                setShowModal(false);
                setStep('bank');
              }}
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
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
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleModalTest;