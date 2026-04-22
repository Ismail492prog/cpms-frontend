import React, { useState, useEffect, useCallback, useRef } from 'react';
import { alertService } from '../services/alertService';


const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [alerts, setAlerts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const intervalRef = useRef(null);

    const fetchUnreadAlerts = useCallback(async () => {
        try {
            const data = await alertService.getUnreadAlerts();
            if (data && data.success !== false) {
                setUnreadCount(data.count || 0);
                setAlerts(data.alerts || []);
            }
        } catch (err) {
            console.error('Failed to fetch unread alerts:', err);
        }
    }, []);

    // Set up polling
    useEffect(() => {
        // Initial fetch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUnreadAlerts();
        
        // Start polling
        intervalRef.current = setInterval(() => {
            fetchUnreadAlerts();
        }, 30000);
        
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchUnreadAlerts]);

    const handleMarkAsRead = async (alertId) => {
        try {
            await alertService.markAsRead(alertId);
            setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertId));
            setUnreadCount(prev => prev - 1);
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const getAlertIcon = (alertLevel) => {
        switch(alertLevel) {
            case 'CRITICAL': return '🔴';
            case 'WARNING': return '🟠';
            default: return '🔵';
        }
    };

    const getAlertColor = (alertLevel) => {
        switch(alertLevel) {
            case 'CRITICAL': return '#dc3545';
            case 'WARNING': return '#fd7e14';
            default: return '#007bff';
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        // Fetch latest alerts when opening dropdown
        if (!showDropdown) {
            fetchUnreadAlerts();
        }
    };

    return (
        <div className="notification-bell-container">
            <div 
                className="notification-bell" 
                onClick={toggleDropdown}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && toggleDropdown()}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="unread-count">{unreadCount} unread</span>
                        )}
                    </div>
                    <div className="notification-list">
                        {alerts.length === 0 ? (
                            <div className="no-notifications">
                                <span>✅</span>
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className="notification-item">
                                    <div className="notification-icon" style={{backgroundColor: getAlertColor(alert.alertLevel)}}>
                                        {getAlertIcon(alert.alertLevel)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{alert.title}</div>
                                        <div className="notification-message">{alert.message}</div>
                                        <div className="notification-meta">
                                            <span className="notification-entity">
                                                {alert.entityType}: {alert.entityName}
                                            </span>
                                            <span className="notification-percentage">
                                                {alert.percentageUsed?.toFixed(1)}% used
                                            </span>
                                        </div>
                                        <div className="notification-progress">
                                            <div 
                                                className="progress-bar"
                                                style={{
                                                    width: `${Math.min(alert.percentageUsed, 100)}%`,
                                                    backgroundColor: getAlertColor(alert.alertLevel)
                                                }}
                                            />
                                        </div>
                                        <div className="notification-actions">
                                            <button 
                                                className="btn-read"
                                                onClick={() => handleMarkAsRead(alert.id)}
                                            >
                                                Mark as Read
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {alerts.length > 0 && (
                        <div className="notification-footer">
                            <a href="/alerts">View All Alerts →</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;