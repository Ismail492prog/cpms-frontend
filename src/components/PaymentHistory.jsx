import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../api/paymentApi';
import { bankPaymentAPI } from '../api/bankPaymentApi';
import toast from 'react-hot-toast';

const PaymentHistory = ({ materialId, materialName, onClose, onRefresh }) => {
  const [payments, setPayments] = useState([]);
  const [bankPayments, setBankPayments] = useState([]);
  const [showBank, setShowBank] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mpesaRes, bankRes] = await Promise.all([
          paymentAPI.getMaterialPayments(materialId),
          bankPaymentAPI.getMaterialBankPayments(materialId)
        ]);
        setPayments(mpesaRes.data.payments || []);
        setBankPayments(bankRes.data.payments || []);
        console.log('Bank payments:', bankRes.data.payments);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [materialId]);

  const handleDeleteMpesa = async (paymentId) => {
    if (window.confirm('Delete this M-Pesa payment?')) {
      try {
        await paymentAPI.deletePayment(paymentId);
        toast.success('Payment deleted');
        const [mpesaRes, bankRes] = await Promise.all([
          paymentAPI.getMaterialPayments(materialId),
          bankPaymentAPI.getMaterialBankPayments(materialId)
        ]);
        setPayments(mpesaRes.data.payments || []);
        setBankPayments(bankRes.data.payments || []);
        if (onRefresh) onRefresh();
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  const handleDeleteBank = async (paymentId) => {
    if (window.confirm('Delete this bank payment?')) {
      try {
        await bankPaymentAPI.deleteBankPayment(paymentId);
        toast.success('Bank payment deleted');
        const [mpesaRes, bankRes] = await Promise.all([
          paymentAPI.getMaterialPayments(materialId),
          bankPaymentAPI.getMaterialBankPayments(materialId)
        ]);
        setPayments(mpesaRes.data.payments || []);
        setBankPayments(bankRes.data.payments || []);
        if (onRefresh) onRefresh();
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  const totalMpesa = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const totalBank = bankPayments.reduce((s, p) => s + parseFloat(p.amount), 0);

  if (loading) {
    return (
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000}} onClick={onClose}>
        <div style={{background: 'white', borderRadius: 10, padding: 20}} onClick={e => e.stopPropagation()}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000}} onClick={onClose}>
      <div style={{background: 'white', borderRadius: 10, padding: 20, maxWidth: 900, width: '90%', maxHeight: '80vh', overflow: 'auto'}} onClick={e => e.stopPropagation()}>
        
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
          <h2>Payment History - {materialName}</h2>
          <button onClick={onClose} style={{fontSize: 24, background: 'none', border: 'none', cursor: 'pointer'}}>×</button>
        </div>

        {/* Simple buttons to switch views */}
        <div style={{display: 'flex', gap: 10, marginBottom: 20}}>
          <button 
            onClick={() => setShowBank(false)}
            style={{padding: '10px 20px', background: !showBank ? '#667eea' : '#ddd', color: !showBank ? 'white' : 'black', border: 'none', borderRadius: 5, cursor: 'pointer'}}
          >
            📱 M-Pesa ({payments.length})
          </button>
          <button 
            onClick={() => setShowBank(true)}
            style={{padding: '10px 20px', background: showBank ? '#667eea' : '#ddd', color: showBank ? 'white' : 'black', border: 'none', borderRadius: 5, cursor: 'pointer'}}
          >
            🏦 Bank Transfers ({bankPayments.length})
          </button>
        </div>

        {/* Bank Transfers View */}
        {showBank && (
          <div>
            {bankPayments.length === 0 ? (
              <p>No bank transfer payments recorded.</p>
            ) : (
              <>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{background: '#f0f0f0'}}>
                      <th style={{padding: 10, textAlign: 'left'}}>Date</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Reference</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Amount (KES)</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Bank</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Account Holder</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Status</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankPayments.map(p => (
                      <tr key={p.paymentId} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: 10}}>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                        <td style={{padding: 10}}><code>{p.referenceNumber}</code></td>
                        <td style={{padding: 10}}><strong>KES {parseFloat(p.amount).toLocaleString()}</strong></td>
                        <td style={{padding: 10}}>{p.bankName}</td>
                        <td style={{padding: 10}}>{p.accountHolderName}</td>
                        <td style={{padding: 10}}>
                          <span style={{
                            background: p.status === 'CONFIRMED' ? '#d4edda' : p.status === 'REJECTED' ? '#f8d7da' : '#fff3cd',
                            color: p.status === 'CONFIRMED' ? '#155724' : p.status === 'REJECTED' ? '#721c24' : '#856404',
                            padding: '4px 8px',
                            borderRadius: 4
                          }}>
                            {p.status === 'CONFIRMED' ? '✅ CONFIRMED' : p.status === 'REJECTED' ? '❌ REJECTED' : '⏳ PENDING'}
                          </span>
                        </td>
                        <td style={{padding: 10}}>
                          {p.status === 'PENDING' && (
                            <button onClick={() => handleDeleteBank(p.paymentId)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 18}}>🗑️</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background: '#f0f0f0'}}>
                      <td colSpan="2"><strong>Total Bank Transfers</strong></td>
                      <td colSpan="5"><strong>KES {totalBank.toLocaleString()}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </div>
        )}

        {/* M-Pesa View */}
        {!showBank && (
          <div>
            {payments.length === 0 ? (
              <p>No M-Pesa payments recorded.</p>
            ) : (
              <>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{background: '#f0f0f0'}}>
                      <th style={{padding: 10, textAlign: 'left'}}>Date</th>
                      <th style={{padding: 10, textAlign: 'left'}}>M-Pesa Code</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Amount (KES)</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Payee</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Notes</th>
                      <th style={{padding: 10, textAlign: 'left'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: 10}}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td style={{padding: 10}}><code>{p.mpesaCode}</code></td>
                        <td style={{padding: 10}}><strong>KES {parseFloat(p.amount).toLocaleString()}</strong></td>
                        <td style={{padding: 10}}>{p.payeeName}</td>
                        <td style={{padding: 10}}>{p.notes || '-'}</td>
                        <td style={{padding: 10}}>
                          <button onClick={() => handleDeleteMpesa(p.id)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 18}}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background: '#f0f0f0'}}>
                      <td colSpan="2"><strong>Total M-Pesa Paid</strong></td>
                      <td colSpan="4"><strong>KES {totalMpesa.toLocaleString()}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </div>
        )}

        <div style={{marginTop: 20, padding: 15, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: 8, display: 'flex', justifyContent: 'space-between'}}>
          <span>💰 Total All Payments</span>
          <strong>KES {(totalMpesa + totalBank).toLocaleString()}</strong>
        </div>

        <div style={{marginTop: 20, display: 'flex', justifyContent: 'flex-end'}}>
          <button onClick={onClose} style={{padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: 5, cursor: 'pointer'}}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;