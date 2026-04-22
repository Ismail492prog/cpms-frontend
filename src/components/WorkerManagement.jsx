import React, { useState, useEffect, useCallback } from 'react';
import { workerService } from '../services/workerService';
import toast from 'react-hot-toast';
import './WorkerManagement.css';

const WorkerManagement = ({ projectId, projectName }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyAttendance, setDailyAttendance] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        idNumber: '',
        phone: '',
        address: '',
        role: 'WORKER',
        jobTitle: '',
        dailyWage: '',
        employmentType: 'DAILY',
        hireDate: new Date().toISOString().split('T')[0],
        mpesaNumber: '',
        emergencyContact: ''
    });

    const fetchWorkers = useCallback(async () => {
        try {
            const response = await workerService.getWorkers(projectId);
            if (response.success) {
                setWorkers(response.workers || []);
            }
        } catch (err) {
            console.error('Failed to fetch workers:', err);
            toast.error('Failed to fetch workers');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const fetchDailyAttendance = useCallback(async () => {
        try {
            const response = await workerService.getDailyAttendance(projectId, attendanceDate);
            if (response.success) {
                setDailyAttendance(response.attendance || []);
            }
        } catch (err) {
            console.error('Failed to fetch daily attendance:', err);
        }
    }, [projectId, attendanceDate]);

    const fetchAttendanceSummary = useCallback(async () => {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const endDate = new Date().toISOString().split('T')[0];
            
            const response = await workerService.getAttendanceSummary(
                projectId, 
                startDate.toISOString().split('T')[0], 
                endDate
            );
            if (response.success) {
                setAttendanceSummary(response.summary);
            }
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    }, [projectId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchWorkers();
            await fetchDailyAttendance();
            await fetchAttendanceSummary();
            setLoading(false);
        };
        init();
    }, [fetchWorkers, fetchDailyAttendance, fetchAttendanceSummary]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddWorker = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.jobTitle || !formData.dailyWage) {
            toast.error('Please fill required fields: Name, Job Title, and Daily Wage');
            return;
        }
        
        try {
            const response = await workerService.addWorker(projectId, formData);
            if (response.success) {
                toast.success('Worker added successfully!');
                setShowAddModal(false);
                fetchWorkers();
                resetForm();
            }
        } catch (err) {
            console.error('Failed to add worker:', err);
            toast.error(err.response?.data?.message || 'Failed to add worker');
        }
    };

    const handleCheckIn = async (workerId) => {
        try {
            const response = await workerService.checkIn(projectId, workerId);
            if (response.success) {
                toast.success('Check-in recorded successfully!');
                await fetchDailyAttendance();
                await fetchAttendanceSummary();
            }
        } catch (err) {
            console.error('Failed to check in:', err);
            toast.error(err.response?.data?.message || 'Failed to check in');
        }
    };

    const handleCheckOut = async (attendanceId) => {
        try {
            const response = await workerService.checkOut(attendanceId);
            if (response.success) {
                toast.success('Check-out recorded successfully!');
                await fetchDailyAttendance();
                await fetchAttendanceSummary();
            }
        } catch (err) {
            console.error('Failed to check out:', err);
            toast.error(err.response?.data?.message || 'Failed to check out');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            idNumber: '',
            phone: '',
            address: '',
            role: 'WORKER',
            jobTitle: '',
            dailyWage: '',
            employmentType: 'DAILY',
            hireDate: new Date().toISOString().split('T')[0],
            mpesaNumber: '',
            emergencyContact: ''
        });
    };

    const getAttendanceForWorker = (workerId) => {
        return dailyAttendance.find(a => a.workerId === workerId);
    };

    if (loading) {
        return <div className="loading">Loading workers...</div>;
    }

    return (
        <div className="worker-management">
            <div className="worker-header">
                <div>
                    <h2>👷 Worker Management</h2>
                    <p>Project: {projectName}</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    + Add Worker
                </button>
            </div>

            <div className="worker-tabs">
                <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                    📋 Workers List
                </button>
                <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
                    📅 Daily Attendance
                </button>
                <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
                    📊 Attendance Summary
                </button>
            </div>

            {activeTab === 'list' && (
                <div className="workers-list">
                    {workers.length === 0 ? (
                        <div className="empty-state">
                            <span>👷</span>
                            <h3>No Workers Yet</h3>
                            <p>Add workers to start tracking attendance</p>
                        </div>
                    ) : (
                        <table className="workers-table">
                            <thead>
                                <tr>
                                    <th>ID No.</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Job Title</th>
                                    <th>Phone</th>
                                    <th>Daily Wage</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map(worker => (
                                    <tr key={worker.id}>
                                        <td>{worker.idNumber || '-'}</td>
                                        <td><strong>{worker.name}</strong></td>
                                        <td>{worker.role || 'WORKER'}</td>
                                        <td>{worker.jobTitle || '-'}</td>
                                        <td>{worker.phone || '-'}</td>
                                        <td>KES {worker.dailyWage?.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${worker.isActive ? 'active' : 'inactive'}`}>
                                                {worker.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-small"
                                                onClick={() => {
                                                    toast.info(`${worker.name}\nRole: ${worker.role}\nJob: ${worker.jobTitle}\nWage: KES ${worker.dailyWage}\nPhone: ${worker.phone || 'N/A'}`);
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="attendance-section">
                    <div className="attendance-controls">
                        <input 
                            type="date" 
                            value={attendanceDate} 
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="date-input"
                        />
                        <button className="btn-secondary" onClick={fetchDailyAttendance}>
                            Refresh
                        </button>
                    </div>

                    <div className="attendance-stats">
                        <div className="stat-card">
                            <span>✅ Present</span>
                            <strong>{dailyAttendance.filter(a => a.status === 'PRESENT').length}</strong>
                        </div>
                        <div className="stat-card">
                            <span>⏰ Late</span>
                            <strong>{dailyAttendance.filter(a => a.status === 'LATE').length}</strong>
                        </div>
                        <div className="stat-card">
                            <span>❌ Absent</span>
                            <strong>{workers.length - dailyAttendance.length}</strong>
                        </div>
                    </div>

                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>ID No.</th>
                                <th>Worker</th>
                                <th>Role</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map(worker => {
                                const attendance = getAttendanceForWorker(worker.id);
                                const isCheckedIn = attendance && !attendance.checkOutTime;
                                const isCheckedOut = attendance && attendance.checkOutTime;
                                
                                return (
                                    <tr key={worker.id}>
                                        <td>{worker.idNumber || '-'}</td>
                                        <td><strong>{worker.name}</strong></td>
                                        <td>{worker.role || 'WORKER'}</td>
                                        <td>{attendance?.checkInTime || '-'}</td>
                                        <td>{attendance?.checkOutTime || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${attendance?.status?.toLowerCase() || 'absent'}`}>
                                                {attendance?.status || 'ABSENT'}
                                            </span>
                                        </td>
                                        <td>
                                            {!attendance && (
                                                <button 
                                                    className="btn-checkin"
                                                    onClick={() => handleCheckIn(worker.id)}
                                                >
                                                    Check In
                                                </button>
                                            )}
                                            {isCheckedIn && (
                                                <button 
                                                    className="btn-checkout"
                                                    onClick={() => handleCheckOut(attendance.id)}
                                                >
                                                    Check Out
                                                </button>
                                            )}
                                            {isCheckedOut && (
                                                <span className="completed-badge">✅ Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'summary' && attendanceSummary && (
                <div className="summary-section">
                    <div className="summary-cards">
                        <div className="summary-card">
                            <span>📊 Total Workers</span>
                            <strong>{attendanceSummary.totalWorkers}</strong>
                        </div>
                        <div className="summary-card">
                            <span>✅ Total Present</span>
                            <strong>{attendanceSummary.totalPresent}</strong>
                        </div>
                        <div className="summary-card">
                            <span>❌ Total Absent</span>
                            <strong>{attendanceSummary.totalAbsent}</strong>
                        </div>
                        <div className="summary-card">
                            <span>⏰ Attendance Rate</span>
                            <strong>{attendanceSummary.attendanceRate?.toFixed(1)}%</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Worker Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content worker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Worker</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddWorker}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>ID Number</label>
                                    <input type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="WORKER">Worker</option>
                                        <option value="SUPERVISOR">Supervisor</option>
                                        <option value="FOREMAN">Foreman</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Job Title *</label>
                                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Daily Wage (KES) *</label>
                                    <input type="number" name="dailyWage" value={formData.dailyWage} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Employment Type</label>
                                    <select name="employmentType" value={formData.employmentType} onChange={handleInputChange}>
                                        <option value="DAILY">Daily</option>
                                        <option value="HOURLY">Hourly</option>
                                        <option value="CONTRACT">Contract</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hire Date</label>
                                    <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>M-Pesa Number</label>
                                    <input type="tel" name="mpesaNumber" value={formData.mpesaNumber} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Emergency Contact</label>
                                    <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Worker
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerManagement;