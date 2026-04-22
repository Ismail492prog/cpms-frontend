/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { projectAPI } from '../api/projectApi';
import { materialAPI } from '../api/materialApi';
import { expenseAPI } from '../api/expenseApi';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import ExpenseSummary from '../components/ExpenseSummary';
import PaymentHistory from '../components/PaymentHistory';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('materials');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [expenseType, setExpenseType] = useState('expense');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  const [materialForm, setMaterialForm] = useState({
    name: '',
    quantityNeeded: '',
    unitOfMeasurement: 'units',
    unitPrice: '',
    totalBudget: ''
  });
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    categoryId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      const [projectRes, materialsRes] = await Promise.all([
        projectAPI.getProjectById(id),
        materialAPI.getProjectMaterials(id)
      ]);
      
      setProject(projectRes.data.project);
      setMaterials(materialsRes.data.materials || []);
      setFormData({
        name: projectRes.data.project.name,
        clientName: projectRes.data.project.clientName,
        location: projectRes.data.project.location || '',
        startDate: projectRes.data.project.startDate || '',
        endDate: projectRes.data.project.endDate || ''
      });
    } catch {
      toast.error('Failed to load project data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await expenseAPI.getCategories(id);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [id]);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await expenseAPI.getProjectExpenses(id);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCategories();
      fetchExpenses();
    }
  }, [id, fetchCategories, fetchExpenses]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMaterialInputChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'quantityNeeded' || name === 'unitPrice') {
      const quantity = name === 'quantityNeeded' ? value : materialForm.quantityNeeded;
      const price = name === 'unitPrice' ? value : materialForm.unitPrice;
      
      if (quantity && price && !isNaN(quantity) && !isNaN(price) && quantity > 0 && price > 0) {
        const total = parseFloat(quantity) * parseFloat(price);
        setMaterialForm(prev => ({
          ...prev,
          totalBudget: total.toFixed(2)
        }));
      }
    }
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await projectAPI.updateProject(id, formData);
      toast.success('Project updated successfully');
      setShowEditModal(false);
      await fetchProjectData();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await materialAPI.createMaterial(id, {
        name: materialForm.name,
        quantityNeeded: materialForm.quantityNeeded ? parseFloat(materialForm.quantityNeeded) : null,
        unitOfMeasurement: materialForm.unitOfMeasurement,
        unitPrice: materialForm.unitPrice ? parseFloat(materialForm.unitPrice) : null,
        totalBudget: parseFloat(materialForm.totalBudget)
      });
      
      toast.success('Material added successfully');
      setShowMaterialModal(false);
      resetMaterialForm();
      await fetchProjectData();
    } catch {
      toast.error('Failed to add material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await expenseAPI.createExpense(id, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        categoryId: parseInt(expenseForm.categoryId),
        expenseDate: expenseForm.expenseDate,
        notes: expenseForm.notes
      });
      
      toast.success('Expense added successfully');
      setShowExpenseModal(false);
      resetExpenseForms();
      await fetchExpenses();
      await fetchProjectData();
    } catch {
      toast.error('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      expenseDate: expense.expenseDate,
      notes: expense.notes || ''
    });
    setShowEditExpenseModal(true);
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await expenseAPI.updateExpense(id, editingExpense.id, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        categoryId: parseInt(expenseForm.categoryId),
        expenseDate: expenseForm.expenseDate,
        notes: expenseForm.notes
      });
      
      toast.success('Expense updated successfully');
      setShowEditExpenseModal(false);
      setEditingExpense(null);
      resetExpenseForms();
      await fetchExpenses();
      await fetchProjectData();
    } catch {
      toast.error('Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        await expenseAPI.deleteExpense(id, expenseId);
        toast.success('Expense deleted successfully');
        await fetchExpenses();
        await fetchProjectData();
      } catch {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      quantityNeeded: material.quantityNeeded || '',
      unitOfMeasurement: material.unitOfMeasurement || 'units',
      unitPrice: material.unitPrice || '',
      totalBudget: material.totalBudget
    });
    setShowMaterialModal(true);
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await materialAPI.updateMaterial(id, editingMaterial.id, {
        name: materialForm.name,
        quantityNeeded: materialForm.quantityNeeded ? parseFloat(materialForm.quantityNeeded) : null,
        unitOfMeasurement: materialForm.unitOfMeasurement,
        unitPrice: materialForm.unitPrice ? parseFloat(materialForm.unitPrice) : null,
        totalBudget: parseFloat(materialForm.totalBudget)
      });
      
      toast.success('Material updated successfully');
      setShowMaterialModal(false);
      setEditingMaterial(null);
      resetMaterialForm();
      await fetchProjectData();
    } catch {
      toast.error('Failed to update material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId, materialName) => {
    if (window.confirm(`Are you sure you want to delete "${materialName}"? This action cannot be undone.`)) {
      try {
        await materialAPI.deleteMaterial(id, materialId);
        toast.success('Material deleted successfully');
        await fetchProjectData();
      } catch {
        toast.error('Failed to delete material');
      }
    }
  };

  const handleMakePayment = (material) => {
    setSelectedMaterial(material);
    setShowPaymentModal(true);
  };

  const handleViewHistory = (material) => {
    setSelectedMaterial(material);
    setShowHistoryModal(true);
  };

  const resetMaterialForm = () => {
    setMaterialForm({
      name: '',
      quantityNeeded: '',
      unitOfMeasurement: 'units',
      unitPrice: '',
      totalBudget: ''
    });
  };

  const resetExpenseForms = () => {
    setExpenseForm({
      description: '',
      amount: '',
      categoryId: '',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

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

  const getRemainingBalance = (material) => {
    return material.remainingBalance || (material.totalBudget - (material.totalPaid || 0));
  };

  const isFullyPaid = (material) => {
    return material.paymentStatus === 'FULLY PAID';
  };

  // Filter expenses based on selected tab
  const getFilteredExpenses = () => {
    if (expenseType === 'labor') {
      return expenses.filter(e => e.categoryName === 'Labor');
    }
    if (expenseType === 'equipment') {
      return expenses.filter(e => e.categoryName === 'Equipment');
    }
    return expenses;
  };

  const getEmptyMessage = () => {
    if (expenseType === 'labor') return 'No labor costs recorded yet.';
    if (expenseType === 'equipment') return 'No equipment rentals recorded yet.';
    return 'No expenses recorded yet.';
  };

  const filteredExpenses = getFilteredExpenses();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-spinner">Loading project details...</div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="loading-spinner">Project not found</div>
      </>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      
      <main className="dashboard-content">
        <div className="project-details-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Projects
          </button>
          <div className="header-buttons">
            <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
              ✏️ Edit Project
            </button>
            <button className="btn-primary" onClick={() => {
              setEditingMaterial(null);
              resetMaterialForm();
              setShowMaterialModal(true);
            }}>
              + Add Material
            </button>
            <button className="btn-primary expense-btn" onClick={() => setShowExpenseModal(true)}>
              + Add Expense
            </button>
          </div>
        </div>

        <div className="project-info-card">
          <h1>{project.name}</h1>
          <div className="info-grid">
            <div className="info-item">
              <label>Client</label>
              <p>{project.clientName}</p>
            </div>
            {project.location && (
              <div className="info-item">
                <label>Location</label>
                <p>{project.location}</p>
              </div>
            )}
            {project.startDate && (
              <div className="info-item">
                <label>Start Date</label>
                <p>{project.startDate}</p>
              </div>
            )}
            {project.endDate && (
              <div className="info-item">
                <label>End Date</label>
                <p>{project.endDate}</p>
              </div>
            )}
            <div className="info-item">
              <label>Total Spent</label>
              <p className="amount">KES {project.totalSpent?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="project-tabs">
          <button 
            className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            📦 Materials
          </button>
          <button 
            className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            💰 Expenses & Labor
          </button>
        </div>

        {activeTab === 'materials' && (
          <div className="materials-section">
            <h2>Materials</h2>
            
            {materials.length === 0 ? (
              <div className="empty-materials">
                <p>No materials added yet. Click "Add Material" to get started.</p>
              </div>
            ) : (
              <div className="materials-grid">
                {materials.map((material) => (
                  <div key={material.id} className="material-card">
                    <div className="material-header">
                      <h3>{material.name}</h3>
                      <div className="material-actions">
                        <button 
                          className="edit-material-btn"
                          onClick={() => handleEditMaterial(material)}
                          title="Edit material"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-material-btn"
                          onClick={() => handleDeleteMaterial(material.id, material.name)}
                          title="Delete material"
                        >
                          🗑️
                        </button>
                        <button 
                          className="history-btn"
                          onClick={() => handleViewHistory(material)}
                          title="View payment history"
                        >
                          📜 History
                        </button>
                        {!isFullyPaid(material) && (
                          <button 
                            className="pay-btn"
                            onClick={() => handleMakePayment(material)}
                            title="Make payment"
                          >
                            💰 Pay
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="material-details">
                      {material.quantityNeeded && (
                        <p>📦 Quantity: {parseFloat(material.quantityNeeded).toLocaleString()} {material.unitOfMeasurement}</p>
                      )}
                      {material.unitPrice && (
                        <p>💰 Unit Price: KES {parseFloat(material.unitPrice).toLocaleString()}</p>
                      )}
                      <p>📊 Total Budget: KES {parseFloat(material.totalBudget).toLocaleString()}</p>
                      <p>✅ Paid: KES {parseFloat(material.totalPaid || 0).toLocaleString()}</p>
                      <p>💵 Remaining: KES {parseFloat(getRemainingBalance(material)).toLocaleString()}</p>
                    </div>
                    
                    <div className="payment-status">
                      {getStatusBadge(material.paymentStatus)}
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${material.percentagePaid || 0}%` }}
                        ></div>
                      </div>
                      <span className="percentage">{material.percentagePaid?.toFixed(1) || 0}% Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-section">
            <ExpenseSummary projectId={id} />
            
            <div className="expense-tabs">
              <button 
                className={`expense-tab ${expenseType === 'expense' ? 'active' : ''}`}
                onClick={() => setExpenseType('expense')}
              >
                General Expenses
              </button>
              <button 
                className={`expense-tab ${expenseType === 'labor' ? 'active' : ''}`}
                onClick={() => setExpenseType('labor')}
              >
                Labor Costs
              </button>
              <button 
                className={`expense-tab ${expenseType === 'equipment' ? 'active' : ''}`}
                onClick={() => setExpenseType('equipment')}
              >
                Equipment Rentals
              </button>
            </div>

            <div className="expense-list">
              {filteredExpenses.length === 0 ? (
                <div className="empty-state">{getEmptyMessage()}</div>
              ) : (
                <table className="expense-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="date-cell">{expense.expenseDate}</td>
                        <td className="desc-cell">{expense.description}</td>
                        <td className="category-cell">
                          <span className="category-badge" style={{ backgroundColor: expense.categoryColor + '20', color: expense.categoryColor }}>
                            {expense.categoryIcon} {expense.categoryName}
                          </span>
                        </td>
                        <td className="amount-cell">KES {parseFloat(expense.amount).toLocaleString()}</td>
                        <td className="notes-cell">{expense.notes || '-'}</td>
                        <td className="actions-cell">
                          <button 
                            className="edit-expense-btn"
                            onClick={() => handleEditExpense(expense)}
                            title="Edit expense"
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-expense-btn"
                            onClick={() => handleDeleteExpense(expense.id)}
                            title="Delete expense"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Project</h3>
                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="modal-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Material Modal */}
        {showMaterialModal && (
          <div className="modal-overlay" onClick={() => {
            setShowMaterialModal(false);
            setEditingMaterial(null);
            resetMaterialForm();
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h3>
                <button className="close-btn" onClick={() => {
                  setShowMaterialModal(false);
                  setEditingMaterial(null);
                  resetMaterialForm();
                }}>×</button>
              </div>
              <form onSubmit={editingMaterial ? handleUpdateMaterial : handleAddMaterial}>
                <div className="form-group">
                  <label>Material Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={materialForm.name}
                    onChange={handleMaterialInputChange}
                    required
                    placeholder="e.g., Cement, Sand, Iron Sheets"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity Needed</label>
                    <input
                      type="number"
                      name="quantityNeeded"
                      value={materialForm.quantityNeeded}
                      onChange={handleMaterialInputChange}
                      placeholder="e.g., 100"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Unit</label>
                    <select
                      name="unitOfMeasurement"
                      value={materialForm.unitOfMeasurement}
                      onChange={handleMaterialInputChange}
                    >
                      <option value="units">Units</option>
                      <option value="bags">Bags</option>
                      <option value="tons">Tons</option>
                      <option value="pieces">Pieces</option>
                      <option value="meters">Meters</option>
                      <option value="liters">Liters</option>
                      <option value="kg">Kilograms</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Unit Price (KES)</label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={materialForm.unitPrice}
                      onChange={handleMaterialInputChange}
                      placeholder="e.g., 500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Total Budget (KES) *</label>
                    <input
                      type="number"
                      name="totalBudget"
                      value={materialForm.totalBudget}
                      onChange={handleMaterialInputChange}
                      required
                      placeholder="Auto-calculated or manual"
                      step="0.01"
                      min="0.01"
                    />
                  </div>
                </div>
                
                <div className="modal-buttons">
                  <button type="button" className="btn-secondary" onClick={() => {
                    setShowMaterialModal(false);
                    setEditingMaterial(null);
                    resetMaterialForm();
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingMaterial ? 'Update Material' : 'Add Material')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showExpenseModal && (
          <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
            <div className="modal-content expense-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>➕ Add Expense</h3>
                <button className="close-btn" onClick={() => setShowExpenseModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddExpense}>
                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={expenseForm.description}
                    onChange={handleExpenseInputChange}
                    required
                    placeholder="e.g., Cement purchase, Permit fee"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (KES) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseInputChange}
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={expenseForm.expenseDate}
                      onChange={handleExpenseInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="categoryId"
                    value={expenseForm.categoryId}
                    onChange={handleExpenseInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={expenseForm.notes}
                    onChange={handleExpenseInputChange}
                    rows="2"
                    placeholder="Additional details..."
                  />
                </div>
                
                <div className="modal-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Expense Modal */}
        {showEditExpenseModal && editingExpense && (
          <div className="modal-overlay" onClick={() => setShowEditExpenseModal(false)}>
            <div className="modal-content expense-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>✏️ Edit Expense</h3>
                <button className="close-btn" onClick={() => setShowEditExpenseModal(false)}>×</button>
              </div>
              <form onSubmit={handleUpdateExpense}>
                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={expenseForm.description}
                    onChange={handleExpenseInputChange}
                    required
                    placeholder="e.g., Cement purchase, Permit fee"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (KES) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseInputChange}
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={expenseForm.expenseDate}
                      onChange={handleExpenseInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="categoryId"
                    value={expenseForm.categoryId}
                    onChange={handleExpenseInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={expenseForm.notes}
                    onChange={handleExpenseInputChange}
                    rows="2"
                    placeholder="Additional details..."
                  />
                </div>
                
                <div className="modal-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setShowEditExpenseModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Update Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Method Selector Modal */}
        {showPaymentModal && selectedMaterial && (
          <PaymentMethodSelector 
            material={selectedMaterial}
            onClose={() => setShowPaymentModal(false)}
            onPaymentComplete={() => {
              setShowPaymentModal(false);
              fetchProjectData();
            }}
          />
        )}

        {/* Payment History Modal */}
        {showHistoryModal && selectedMaterial && (
          <PaymentHistory 
            materialId={selectedMaterial.id}
            materialName={selectedMaterial.name}
            onClose={() => setShowHistoryModal(false)}
            onRefresh={() => {
              fetchProjectData();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default ProjectDetails;