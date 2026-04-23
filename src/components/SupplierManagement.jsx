import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        category: 'HARDWARE',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        physicalLocation: '',
        paymentTerms: ''
    });

    const getAuthHeader = useCallback(() => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }), []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const url = filterCategory === 'all' 
                ? 'https://cpms-backend-production.up.railway.app/api/suppliers'
                : `const API_BASE_URL = 'https://cpms-backend-production.up.railway.app/api/suppliers/category/${filterCategory}`;
            const response = await axios.get(url, {
                headers: getAuthHeader()
            });
            if (response.data.success) {
                setSuppliers(response.data.suppliers || []);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    }, [filterCategory, getAuthHeader]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'HARDWARE',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
            physicalLocation: '',
            paymentTerms: ''
        });
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Supplier name is required');
            return;
        }

        try {
            const response = await axios.post('https://cpms-backend-production.up.railway.app/api/suppliers', formData, {
                headers: getAuthHeader()
            });
            if (response.data.success) {
                toast.success('Supplier added successfully!');
                setShowAddModal(false);
                fetchSuppliers();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to add supplier:', error);
            toast.error(error.response?.data?.message || 'Failed to add supplier');
        }
    };

    const handleDeleteSupplier = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const response = await axios.delete(`const API_BASE_URL = 'https://cpms-backend-production.up.railway.app/api/suppliers/${id}`, {
                    headers: getAuthHeader()
                });
                if (response.data.success) {
                    toast.success('Supplier removed successfully');
                    fetchSuppliers();
                }
            } catch (error) {
                console.error('Failed to delete supplier:', error);
                toast.error('Failed to delete supplier');
            }
        }
    };

    const getCategoryIcon = (category) => {
        switch(category) {
            case 'HARDWARE': return '🏪';
            case 'MANUFACTURER': return '🏭';
            case 'WHOLESALER': return '📦';
            default: return '🏢';
        }
    };

    if (loading) {
        return <div className="loading">Loading suppliers...</div>;
    }

    return (
        <div className="supplier-management">
            <div className="supplier-header">
                <div>
                    <h2>🏭 Supplier Management</h2>
                    <p>Manage material suppliers including hardware stores, manufacturers, and wholesalers</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Supplier
                </button>
            </div>

            <div className="supplier-filters">
                <button 
                    className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('all')}
                >
                    All
                </button>
                <button 
                    className={`filter-btn ${filterCategory === 'HARDWARE' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('HARDWARE')}
                >
                    🏪 Hardware Stores
                </button>
                <button 
                    className={`filter-btn ${filterCategory === 'MANUFACTURER' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('MANUFACTURER')}
                >
                    🏭 Manufacturers
                </button>
                <button 
                    className={`filter-btn ${filterCategory === 'WHOLESALER' ? 'active' : ''}`}
                    onClick={() => setFilterCategory('WHOLESALER')}
                >
                    📦 Wholesalers
                </button>
            </div>

            <div className="suppliers-list">
                {suppliers.length === 0 ? (
                    <div className="empty-state">
                        <span>🏭</span>
                        <h3>No Suppliers Yet</h3>
                        <p>Add suppliers to track material sources</p>
                    </div>
                ) : (
                    <div className="suppliers-grid">
                        {suppliers.map(supplier => (
                            <div key={supplier.id} className="supplier-card">
                                <div className="supplier-card-header">
                                    <div className="supplier-title">
                                        <span className="supplier-icon">{getCategoryIcon(supplier.category)}</span>
                                        <h3>{supplier.name}</h3>
                                    </div>
                                    <button 
                                        className="delete-btn-small"
                                        onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                <div className="supplier-category-badge">
                                    {supplier.category}
                                </div>
                                
                                {supplier.physicalLocation && (
                                    <p className="supplier-location">
                                        📍 {supplier.physicalLocation}
                                    </p>
                                )}
                                
                                {supplier.contactPerson && (
                                    <p className="supplier-contact">
                                        👤 {supplier.contactPerson}
                                    </p>
                                )}
                                
                                {supplier.phone && (
                                    <p className="supplier-phone">
                                        📞 {supplier.phone}
                                    </p>
                                )}
                                
                                {supplier.email && (
                                    <p className="supplier-email">
                                        ✉️ {supplier.email}
                                    </p>
                                )}
                                
                                {supplier.paymentTerms && (
                                    <p className="supplier-terms">
                                        💳 Terms: {supplier.paymentTerms}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Supplier Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Supplier</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddSupplier}>
                            <div className="form-group">
                                <label>Supplier Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Tuskys Hardware - Mombasa Rd"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Supplier Type</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange}>
                                        <option value="HARDWARE">🏪 Hardware Store</option>
                                        <option value="MANUFACTURER">🏭 Manufacturer</option>
                                        <option value="WHOLESALER">📦 Wholesaler</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Physical Location/Branch</label>
                                    <input
                                        type="text"
                                        name="physicalLocation"
                                        value={formData.physicalLocation}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Mombasa Road Branch"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleInputChange}
                                        placeholder="Name of contact person"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="0712345678"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="supplier@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Payment Terms</label>
                                    <input
                                        type="text"
                                        name="paymentTerms"
                                        value={formData.paymentTerms}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 30 days, Cash on delivery"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Full physical address"
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;