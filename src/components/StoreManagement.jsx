import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StoreManagement = ({ projectId }) => {
    const [materials, setMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [issuedTo, setIssuedTo] = useState('');
    const [location, setLocation] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [activeTab, setActiveTab] = useState('receive');
    const [stockLevels, setStockLevels] = useState({});
    const [loading, setLoading] = useState(true);

    const getAuthHeader = useCallback(() => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }), []);

    // Fetch all materials for this project
    const fetchMaterials = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/projects/${projectId}/materials`,
                { headers: getAuthHeader() }
            );
            const materialsData = response.data.materials || [];
            setMaterials(materialsData);
            return materialsData;
        } catch (error) {
            console.error('Failed to fetch materials:', error);
            return [];
        }
    }, [projectId, getAuthHeader]);

    // Fetch all suppliers
    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/suppliers', {
                headers: getAuthHeader()
            });
            if (response.data.success) {
                setSuppliers(response.data.suppliers || []);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    }, [getAuthHeader]);

    // Fetch stock levels only (no prices)
    const fetchStockLevels = useCallback(async (materialsList) => {
        try {
            const stockMap = {};
            for (const material of materialsList) {
                try {
                    const response = await axios.get(
                        `http://localhost:8080/api/store/materials/${material.id}/stock?projectId=${projectId}`,
                        { headers: getAuthHeader() }
                    );
                    stockMap[material.id] = response.data.currentStock || 0;
                } catch {
                    stockMap[material.id] = 0;
                }
            }
            setStockLevels(stockMap);
        } catch (error) {
            console.error('Failed to load stock levels:', error);
        }
    }, [projectId, getAuthHeader]);

    // Initialize data
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const materialsList = await fetchMaterials();
            await fetchStockLevels(materialsList);
            await fetchSuppliers();
            setLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setSelectedMaterial(null);
        setSelectedSupplier('');
        setQuantity('');
        setUnitPrice('');
        setIssuedTo('');
        setLocation('');
        setReferenceNumber('');
        setReason('');
        setNotes('');
    };

    const refreshData = useCallback(async () => {
        const materialsList = await fetchMaterials();
        await fetchStockLevels(materialsList);
        await fetchSuppliers();
    }, [fetchMaterials, fetchStockLevels, fetchSuppliers]);

    // Auto-fill unit price when material is selected (optional)
    const handleMaterialSelect = (materialId) => {
        setSelectedMaterial(materialId);
        const material = materials.find(m => m.id === materialId);
        if (material && material.unitPrice) {
            setUnitPrice(material.unitPrice.toString());
        } else {
            setUnitPrice('');
        }
    };

    // Receive stock with supplier selection
    const handleReceiveStock = async () => {
        if (!selectedMaterial || !quantity) {
            toast.error('Please select material and enter quantity');
            return;
        }

        const material = materials.find(m => m.id === selectedMaterial);
        const supplier = suppliers.find(s => s.id === Number(selectedSupplier));
        
        setLoading(true);
        try {
            await axios.post(
                `http://localhost:8080/api/store/materials/${selectedMaterial}/receive`,
                null,
                {
                    params: { 
                        quantity: Number(quantity), 
                        unitPrice: unitPrice ? Number(unitPrice) : 0,
                        referenceNumber, 
                        notes: notes + (supplier ? ` | Supplier: ${supplier.name}` : '')
                    },
                    headers: getAuthHeader()
                }
            );
            
            const supplierText = supplier ? ` from ${supplier.name}` : '';
            toast.success(`✅ Received ${quantity} ${material?.unitOfMeasurement || 'units'} of ${material?.name}${supplierText}`);
            await refreshData();
            resetForm();
        } catch (receiveErr) {
            console.error('Receive stock error:', receiveErr);
            toast.error(receiveErr.response?.data?.message || 'Failed to receive stock');
        } finally {
            setLoading(false);
        }
    };

    const handleIssueStock = async () => {
        if (!selectedMaterial || !quantity || !issuedTo) {
            toast.error('Please select material, quantity, and worker name');
            return;
        }

        const material = materials.find(m => m.id === selectedMaterial);
        const currentStock = stockLevels[selectedMaterial] || 0;
        
        if (Number(quantity) > currentStock) {
            toast.error(`❌ Insufficient stock! Available: ${currentStock} ${material?.unitOfMeasurement || 'units'}`);
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `http://localhost:8080/api/store/materials/${selectedMaterial}/issue`,
                null,
                {
                    params: { 
                        quantity: Number(quantity), 
                        issuedTo, 
                        location, 
                        notes 
                    },
                    headers: getAuthHeader()
                }
            );
            toast.success(`✅ Issued ${quantity} ${material?.unitOfMeasurement || 'units'} of ${material?.name} to ${issuedTo}`);
            await refreshData();
            resetForm();
        } catch (issueErr) {
            console.error('Issue stock error:', issueErr);
            toast.error(issueErr.response?.data?.message || 'Failed to issue stock');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordWastage = async () => {
        if (!selectedMaterial || !quantity || !reason) {
            toast.error('Please select material, quantity, and reason');
            return;
        }

        const material = materials.find(m => m.id === selectedMaterial);
        const currentStock = stockLevels[selectedMaterial] || 0;
        
        if (Number(quantity) > currentStock) {
            toast.error(`❌ Insufficient stock! Available: ${currentStock} ${material?.unitOfMeasurement || 'units'}`);
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `http://localhost:8080/api/store/materials/${selectedMaterial}/wastage`,
                null,
                {
                    params: { 
                        quantity: Number(quantity), 
                        reason 
                    },
                    headers: getAuthHeader()
                }
            );
            toast.success(`🗑️ Recorded wastage: ${quantity} ${material?.unitOfMeasurement || 'units'} of ${material?.name}`);
            await refreshData();
            resetForm();
        } catch (wastageErr) {
            console.error('Record wastage error:', wastageErr);
            toast.error(wastageErr.response?.data?.message || 'Failed to record wastage');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedMaterialDetails = () => {
        return materials.find(m => m.id === selectedMaterial);
    };

    const currentStock = selectedMaterial ? (stockLevels[selectedMaterial] || 0) : 0;
    const selectedMaterialDetails = getSelectedMaterialDetails();

    // Group suppliers by category
    const hardwareStores = suppliers.filter(s => s.category === 'HARDWARE');
    const manufacturers = suppliers.filter(s => s.category === 'MANUFACTURER');
    const wholesalers = suppliers.filter(s => s.category === 'WHOLESALER');

    // Calculate summary stats - quantity only
    const totalMaterials = materials.length;
    const totalStockQuantity = materials.reduce((sum, m) => {
        return sum + (stockLevels[m.id] || 0);
    }, 0);
    const lowStockItems = materials.filter(m => {
        const stock = stockLevels[m.id] || 0;
        const reorderLevel = m.reorderLevel || 50;
        return stock > 0 && stock < reorderLevel;
    }).length;

    if (loading) {
        return <div className="loading">Loading store management...</div>;
    }

    if (materials.length === 0) {
        return (
            <div className="store-management">
                <div className="empty-state">
                    <span>📦</span>
                    <h3>No Materials Found</h3>
                    <p>Please add materials to this project first.</p>
                    <button 
                        className="btn-primary"
                        onClick={() => window.location.href = `/projects/${projectId}`}
                    >
                        Go to Project Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="store-management">
            <div className="store-header">
                <h2>📦 Store Management</h2>
                <p>Track material inventory - quantities only (financials tracked in project budget)</p>
                <div className="summary-cards">
                    <div className="summary-card">
                        <span className="summary-icon">📊</span>
                        <div>
                            <div className="summary-value">{totalMaterials}</div>
                            <div className="summary-label">Total Materials</div>
                        </div>
                    </div>
                    <div className="summary-card">
                        <span className="summary-icon">📦</span>
                        <div>
                            <div className="summary-value">{totalStockQuantity.toLocaleString()}</div>
                            <div className="summary-label">Total Units in Stock</div>
                        </div>
                    </div>
                    <div className="summary-card">
                        <span className="summary-icon">⚠️</span>
                        <div>
                            <div className="summary-value">{lowStockItems}</div>
                            <div className="summary-label">Low Stock Items</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="store-tabs">
                <button 
                    type="button"
                    className={`tab ${activeTab === 'receive' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('receive')}
                >
                    📥 Receive Stock
                </button>
                <button 
                    type="button"
                    className={`tab ${activeTab === 'issue' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('issue')}
                >
                    📤 Issue Stock
                </button>
                <button 
                    type="button"
                    className={`tab ${activeTab === 'wastage' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('wastage')}
                >
                    🗑️ Record Wastage
                </button>
                <button 
                    type="button"
                    className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('inventory')}
                >
                    📋 Current Inventory
                </button>
            </div>

            <div className="store-content">
                {activeTab === 'receive' && (
                    <div className="store-form">
                        <h3>Receive Materials from Supplier</h3>
                        
                        <select 
                            value={selectedMaterial || ''} 
                            onChange={(e) => handleMaterialSelect(Number(e.target.value))}
                        >
                            <option value="">-- Select Material --</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} - Current Stock: {stockLevels[m.id] || 0} {m.unitOfMeasurement || 'units'}
                                </option>
                            ))}
                        </select>
                        
                        <select 
                            value={selectedSupplier} 
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">-- Select Supplier --</option>
                            {hardwareStores.length > 0 && (
                                <optgroup label="🏪 Hardware Stores">
                                    {hardwareStores.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.physicalLocation ? `- ${s.physicalLocation}` : ''}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {manufacturers.length > 0 && (
                                <optgroup label="🏭 Manufacturers">
                                    {manufacturers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </optgroup>
                            )}
                            {wholesalers.length > 0 && (
                                <optgroup label="📦 Wholesalers">
                                    {wholesalers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        
                        {selectedMaterialDetails && (
                            <div className="material-info">
                                <span>📦 Unit: {selectedMaterialDetails.unitOfMeasurement || 'units'}</span>
                                <span>📊 Current Stock: {currentStock} {selectedMaterialDetails.unitOfMeasurement || 'units'}</span>
                            </div>
                        )}
                        
                        <input 
                            type="number" 
                            placeholder="Quantity to Receive" 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value)} 
                        />
                        <input 
                            type="number" 
                            placeholder="Unit Price (KES) - Optional" 
                            value={unitPrice} 
                            onChange={(e) => setUnitPrice(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            placeholder="Reference Number (PO/Invoice #)" 
                            value={referenceNumber} 
                            onChange={(e) => setReferenceNumber(e.target.value)} 
                        />
                        <textarea 
                            placeholder="Notes (e.g., delivery date, quality remarks)" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            rows="3"
                        />
                        <button type="button" onClick={handleReceiveStock} disabled={loading}>
                            {loading ? 'Processing...' : '📥 Receive Stock'}
                        </button>
                    </div>
                )}

                {activeTab === 'issue' && (
                    <div className="store-form">
                        <h3>Issue Materials to Workers</h3>
                        
                        <select 
                            value={selectedMaterial || ''} 
                            onChange={(e) => setSelectedMaterial(Number(e.target.value))}
                        >
                            <option value="">-- Select Material --</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} - Available: {stockLevels[m.id] || 0} {m.unitOfMeasurement || 'units'}
                                </option>
                            ))}
                        </select>
                        
                        {selectedMaterialDetails && (
                            <div className="material-info warning">
                                <span>📊 Available Stock: {currentStock} {selectedMaterialDetails.unitOfMeasurement || 'units'}</span>
                            </div>
                        )}
                        
                        <input 
                            type="number" 
                            placeholder="Quantity to Issue" 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            placeholder="Issued To (Worker Name)" 
                            value={issuedTo} 
                            onChange={(e) => setIssuedTo(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            placeholder="Location (e.g., Foundation, Roofing, Flooring)" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                        />
                        <textarea 
                            placeholder="Notes" 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            rows="3"
                        />
                        <button type="button" onClick={handleIssueStock} disabled={loading}>
                            {loading ? 'Processing...' : '📤 Issue Stock'}
                        </button>
                    </div>
                )}

                {activeTab === 'wastage' && (
                    <div className="store-form">
                        <h3>Record Material Wastage</h3>
                        
                        <select 
                            value={selectedMaterial || ''} 
                            onChange={(e) => setSelectedMaterial(Number(e.target.value))}
                        >
                            <option value="">-- Select Material --</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} - Available: {stockLevels[m.id] || 0} {m.unitOfMeasurement || 'units'}
                                </option>
                            ))}
                        </select>
                        
                        {selectedMaterialDetails && (
                            <div className="material-info warning">
                                <span>📊 Available Stock: {currentStock} {selectedMaterialDetails.unitOfMeasurement || 'units'}</span>
                            </div>
                        )}
                        
                        <input 
                            type="number" 
                            placeholder="Quantity Wasted" 
                            value={quantity} 
                            onChange={(e) => setQuantity(e.target.value)} 
                        />
                        <textarea 
                            placeholder="Reason for wastage (e.g., damaged, broken, spoilage)" 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            rows="3"
                        />
                        <button type="button" onClick={handleRecordWastage} disabled={loading}>
                            {loading ? 'Processing...' : '🗑️ Record Wastage'}
                        </button>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="inventory-list">
                        <h3>Current Inventory</h3>
                        <div className="inventory-stats">
                            <div className="stat-card">
                                <span>📊 Total Items</span>
                                <strong>{materials.length}</strong>
                            </div>
                            <div className="stat-card">
                                <span>✅ In Stock</span>
                                <strong>{Object.values(stockLevels).filter(stock => stock > 0).length}</strong>
                            </div>
                            <div className="stat-card">
                                <span>⚠️ Low Stock</span>
                                <strong>{lowStockItems}</strong>
                            </div>
                        </div>
                        
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Unit</th>
                                    <th>Current Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map(material => {
                                    const stock = stockLevels[material.id] || 0;
                                    const reorderLevel = material.reorderLevel || 50;
                                    let status = 'Out of Stock';
                                    let statusClass = 'out';
                                    
                                    if (stock > reorderLevel * 2) {
                                        status = 'Good Stock';
                                        statusClass = 'good';
                                    } else if (stock > reorderLevel) {
                                        status = 'Medium Stock';
                                        statusClass = 'medium';
                                    } else if (stock > 0) {
                                        status = 'Low Stock';
                                        statusClass = 'low';
                                    }
                                    
                                    return (
                                        <tr key={material.id}>
                                            <td>{material.name}</td>
                                            <td>{material.unitOfMeasurement || 'units'}</td>
                                            <td className={stock === 0 ? 'zero-stock' : ''}>{stock}</td>
                                            <td>
                                                <span className={`status-badge ${statusClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreManagement;