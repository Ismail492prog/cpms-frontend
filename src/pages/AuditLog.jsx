/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [authorized, setAuthorized] = useState(true);
  const navigate = useNavigate();

  // Fetch current user role
  const fetchUserRole = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('const API_BASE_URL = https://cpms-backend-production.up.railway.app/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const role = response.data.role || 'USER';
      setUserRole(role);
      
      if (role !== 'ADMIN' && role !== 'MANAGER') {
        setAuthorized(false);
        toast.error('Access denied. Only administrators and managers can view audit logs.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setAuthorized(false);
      navigate('/login');
    }
  }, [navigate]);

  const fetchLogs = useCallback(async () => {
    if (!authorized) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`const API_BASE_URL = 'https://cpms-backend-production.up.railway.app/api/audit-logs?page=${page}&size=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLogs(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view audit logs.');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load audit logs');
      }
    } finally {
      setLoading(false);
    }
  }, [page, authorized, navigate]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  useEffect(() => {
    if (authorized) {
      fetchLogs();
    }
  }, [fetchLogs, authorized]);

  const exportLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('const API_BASE_URL = https://cpms-backend-production.up.railway.app/api/audit-logs/export', {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      toast.success('Audit log exported successfully');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. You cannot export audit logs.');
      } else {
        toast.error('Failed to export logs');
      }
    }
  }, []);

  const getActionBadge = (action) => {
    switch(action) {
      case 'CREATE': return <span className="badge-create">➕ CREATE</span>;
      case 'UPDATE': return <span className="badge-update">✏️ UPDATE</span>;
      case 'DELETE': return <span className="badge-delete">🗑️ DELETE</span>;
      case 'LOGIN': return <span className="badge-login">🔐 LOGIN</span>;
      case 'LOGOUT': return <span className="badge-logout">🚪 LOGOUT</span>;
      default: return <span className="badge-other">{action}</span>;
    }
  };

  const applyFilters = () => {
    // Apply date filters
    let url = `const API_BASE_URL = 'https://cpms-backend-production.up.railway.app/api/audit-logs?page=0&size=20`;
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    
    const token = localStorage.getItem('token');
    axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setLogs(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setPage(0);
      toast.success('Filters applied');
    })
    .catch(() => {
      toast.error('Failed to apply filters');
    });
  };

  if (!authorized) {
    return null;
  }

  if (loading && logs.length === 0) {
    return (
      <>
        <Navbar />
        <div className="loading-spinner">Loading audit logs...</div>
      </>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      
      <main className="dashboard-content">
        <div className="audit-header">
          <div>
            <h2>📋 Audit Log</h2>
            {userRole && <span className="user-role-badge">Role: {userRole}</span>}
          </div>
          <button className="btn-primary" onClick={exportLogs}>
            📄 Export CSV
          </button>
        </div>

        <div className="audit-filters">
          <input
            type="text"
            placeholder="Search by user, action, entity..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input"
          />
          <div className="date-filters">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              placeholder="Start Date"
            />
            <span>to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              placeholder="End Date"
            />
            <button className="btn-secondary" onClick={applyFilters}>Apply Filters</button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setFilter('');
                setStartDate('');
                setEndDate('');
                fetchLogs();
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="audit-table-container">
          {logs.length === 0 ? (
            <div className="empty-state">
              <p>No audit logs found.</p>
            </div>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="date-cell">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="user-cell">
                      <strong>{log.userName || 'System'}</strong>
                      <br />
                      <small>{log.userEmail || '-'}</small>
                    </td>
                    <td className="action-cell">{getActionBadge(log.action)}</td>
                    <td className="entity-cell">{log.entityType}</td>
                    <td className="entity-id-cell">{log.entityId || '-'}</td>
                    <td className="details-cell" title={log.details}>
                      {log.details?.length > 50 ? log.details.substring(0, 50) + '...' : log.details || '-'}
                    </td>
                    <td className="ip-cell"><code>{log.ipAddress || '-'}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(page - 1)}
              className="pagination-btn"
            >
              ← Previous
            </button>
            <span className="page-info">Page {page + 1} of {totalPages}</span>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(page + 1)}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuditLog;