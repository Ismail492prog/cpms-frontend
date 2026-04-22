import React, { useState, useEffect, useCallback, useRef } from 'react';
import { alertService } from '../services/alertService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import './Alerts.css';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const intervalRef = useRef(null);

    const fetchAlerts = useCallback(async () => {
        try {
            const data = await alertService.getAlerts();
            if (data && data.success !== false) {
                setAlerts(data.alerts || []);
            }
        } catch (err) {
            toast.error('Failed to load alerts');
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Set up polling and initial fetch
    useEffect(() => {
        // Initial fetch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAlerts();
        
        // Set up polling
        intervalRef.current = setInterval(() => {
            fetchAlerts();
        }, 30000);
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchAlerts]);

    const handleMarkAsRead = async (alertId) => {
        try {
            await alertService.markAsRead(alertId);
            setAlerts(prevAlerts => 
                prevAlerts.map(alert => 
                    alert.id === alertId ? { ...alert, isRead: true } : alert
                )
            );
            toast.success('Alert marked as read');
        } catch (err) {
            toast.error('Failed to mark as read');
            console.error('Error marking as read:', err);
        }
    };

    const handleResolve = async (alertId) => {
        try {
            await alertService.markAsResolved(alertId);
            setAlerts(prevAlerts => 
                prevAlerts.map(alert => 
                    alert.id === alertId ? { ...alert, isResolved: true } : alert
                )
            );
            toast.success('Alert resolved');
        } catch (err) {
            toast.error('Failed to resolve alert');
            console.error('Error resolving alert:', err);
        }
    };

    const getFilteredAlerts = () => {
        if (filter === 'unread') {
            return alerts.filter(a => !a.isRead && !a.isResolved);
        }
        if (filter === 'resolved') {
            return alerts.filter(a => a.isResolved);
        }
        return alerts;
    };

    const getAlertBadge = (alertLevel, type) => {
        if (type === 'BUDGET_EXCEEDED' || alertLevel === 'CRITICAL') {
            return <span className="badge-critical">⚠️ Critical</span>;
        }
        if (alertLevel === 'WARNING' || type === 'BUDGET_WARNING') {
            return <span className="badge-warning">⚠️ Warning</span>;
        }
        return <span className="badge-info">ℹ️ Info</span>;
    };

    const getProgressColor = (percentage, alertLevel) => {
        if (percentage >= 100 || alertLevel === 'CRITICAL') return '#dc3545';
        if (percentage >= 90) return '#fd7e14';
        if (percentage >= 80) return '#ffc107';
        return '#28a745';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading alerts...</p>
                </div>
            </>
        );
    }

    const filteredAlerts = getFilteredAlerts();

    return (
        <div className="dashboard">
            <Navbar />
            <main className="dashboard-content">
                <div className="alerts-header">
                    <div>
                        <h2>🔔 Budget Alerts & Notifications</h2>
                        <p>Monitor budget thresholds and take action</p>
                    </div>
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All ({alerts.length})
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread ({alerts.filter(a => !a.isRead && !a.isResolved).length})
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                            onClick={() => setFilter('resolved')}
                        >
                            Resolved ({alerts.filter(a => a.isResolved).length})
                        </button>
                    </div>
                </div>

                {filteredAlerts.length === 0 ? (
                    <div className="empty-alerts">
                        <span>✅</span>
                        <h3>No Alerts</h3>
                        <p>All budgets are within limits</p>
                    </div>
                ) : (
                    <div className="alerts-grid">
                        {filteredAlerts.map(alert => (
                            <div key={alert.id} className={`alert-card ${alert.isResolved ? 'resolved' : ''}`}>
                                <div className="alert-header">
                                    <div className="alert-title">
                                        {getAlertBadge(alert.alertLevel, alert.type)}
                                        <h3>{alert.title}</h3>
                                    </div>
                                    <div className="alert-date">
                                        {new Date(alert.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                
                                <div className="alert-message">
                                    {alert.message}
                                </div>

                                <div className="alert-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Entity:</span>
                                        <span className="detail-value">
                                            {alert.entityType}: {alert.entityName}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Budget Used:</span>
                                        <span className="detail-value">
                                            KES {alert.currentAmount?.toLocaleString()} / KES {alert.budgetAmount?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="progress-section">
                                    <div className="progress-label">
                                        <span>Budget Usage</span>
                                        <span className="percentage">
                                            {alert.percentageUsed?.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div 
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${Math.min(alert.percentageUsed, 100)}%`,
                                                backgroundColor: getProgressColor(alert.percentageUsed, alert.alertLevel)
                                            }}
                                        />
                                    </div>
                                </div>

                                {!alert.isResolved && (
                                    <div className="alert-actions">
                                        {!alert.isRead && (
                                            <button 
                                                className="btn-mark-read"
                                                onClick={() => handleMarkAsRead(alert.id)}
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        <button 
                                            className="btn-resolve"
                                            onClick={() => handleResolve(alert.id)}
                                        >
                                            Resolve Alert
                                        </button>
                                    </div>
                                )}

                                {alert.isResolved && (
                                    <div className="resolved-badge">
                                        ✅ Resolved on {new Date(alert.resolvedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Alerts;