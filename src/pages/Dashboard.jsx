import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StoreManagement from '../components/StoreManagement';
import WorkerManagement from '../components/WorkerManagement';
import SupplierManagement from '../components/SupplierManagement';
import { projectAPI } from '../api/projectApi';
import { reportAPI } from '../api/reportApi';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSpent: 0,
    activeMaterials: 0
  });
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectAPI.getAllProjects();
      const projectsData = response.data.projects || [];
      setProjects(projectsData);
      
      const totalProjectsCount = projectsData.length;
      const totalSpentAmount = projectsData.reduce((sum, p) => sum + (p.totalSpent || 0), 0);
      
      setStats({
        totalProjects: totalProjectsCount,
        totalSpent: totalSpentAmount,
        activeMaterials: 0
      });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await projectAPI.createProject(formData);
      toast.success('Project created successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        clientName: '',
        location: '',
        startDate: '',
        endDate: ''
      });
      await fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await projectAPI.deleteProject(id);
        toast.success('Project deleted successfully');
        await fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleViewReport = async (project) => {
    setSelectedProject(project);
    try {
      const response = await reportAPI.getProjectReport(project.id);
      setReportData(response.data.report);
      setShowReportModal(true);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Failed to load report');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await reportAPI.downloadPDFReport(selectedProject.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-report-${selectedProject.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress) {
      toast.error('Please enter an email address');
      return;
    }
    
    setSendingEmail(true);
    try {
      await reportAPI.sendEmailReport(selectedProject.id, emailAddress);
      toast.success(`Report sent to ${emailAddress}`);
      setEmailAddress('');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const chartData = projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 12) + '...' : project.name,
    spent: project.totalSpent || 0,
    fullName: project.name
  }));

  const pieData = projects.filter(p => (p.totalSpent || 0) > 0).map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 12) + '...' : project.name,
    value: project.totalSpent || 0
  }));

  const COLORS = ['#667eea', '#48bb78', '#ed8936', '#e53e3e', '#4299e1', '#9f7aea', '#f6ad55', '#68d391'];

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedProject(null);
  };

  const renderProjectsTab = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>My Projects</h2>
          <p>Manage all your construction projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Projects</h3>
            <p className="stat-number">{stats.totalProjects}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Spent</h3>
            <p className="stat-number">KES {stats.totalSpent.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Active Projects</h3>
            <p className="stat-number">{stats.totalProjects}</p>
          </div>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="charts-section">
          <h3>Project Analytics</h3>
          <div className="charts-grid">
            <div className="chart-card">
              <h4>Spending by Project (Bar Chart)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="spent" fill="#667eea" name="Total Spent (KES)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {pieData.length > 0 && (
              <div className="chart-card">
                <h4>Spending Distribution (Pie Chart)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <h3>No Projects Yet</h3>
          <p>Click the "New Project" button to create your first construction project.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => handleProjectClick(project.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-actions">
                  <button 
                    className="report-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewReport(project);
                    }}
                    title="View Report"
                  >
                    📊 Report
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id, project.name);
                    }}
                    title="Delete Project"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="client-name">👤 {project.clientName}</p>
              {project.location && <p className="location">📍 {project.location}</p>}
              <div className="project-dates">
                {project.startDate && <span>📅 Start: {project.startDate}</span>}
                {project.endDate && <span>🎯 End: {project.endDate}</span>}
              </div>
              <div className="project-stats">
                <div className="stat">
                  <span className="stat-label">Total Spent</span>
                  <span className="stat-value">KES {project.totalSpent?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderStoreTab = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>🏪 Store Management</h2>
          <p>Track inventory, issue materials, and record wastage</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <h3>No Projects Available</h3>
          <p>Please create a project first before accessing store management.</p>
          <button className="btn-primary" onClick={() => handleTabChange('projects')}>
            Go to Projects
          </button>
        </div>
      ) : (
        <div className="store-selector">
          <div className="selector-header">
            <h3>Select Project</h3>
            <p>Choose a project to manage its store inventory</p>
          </div>
          <div className="project-selector-grid">
            {projects.map(project => (
              <div 
                key={project.id}
                className={`project-selector-card ${selectedProject?.id === project.id ? 'active' : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-icon">🏪</div>
                <h4>{project.name}</h4>
                <p className="project-client">{project.clientName}</p>
                {selectedProject?.id === project.id && (
                  <span className="selected-badge">✓ Selected</span>
                )}
              </div>
            ))}
          </div>
          
          {selectedProject && (
            <div className="store-management-container">
              <div className="selected-project-banner">
                <span>📦 Managing inventory for: </span>
                <strong>{selectedProject.name}</strong>
                <button 
                  className="change-project-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  Change Project
                </button>
              </div>
              <StoreManagement projectId={selectedProject.id} />
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderWorkersTab = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>👷 Worker Management</h2>
          <p>Manage workers, track attendance, and calculate wages</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <h3>No Projects Available</h3>
          <p>Please create a project first before managing workers.</p>
          <button className="btn-primary" onClick={() => handleTabChange('projects')}>
            Go to Projects
          </button>
        </div>
      ) : (
        <div className="worker-selector">
          <div className="selector-header">
            <h3>Select Project</h3>
            <p>Choose a project to manage its workers and attendance</p>
          </div>
          <div className="project-selector-grid">
            {projects.map(project => (
              <div 
                key={project.id}
                className={`project-selector-card ${selectedProject?.id === project.id ? 'active' : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="project-icon">👷</div>
                <h4>{project.name}</h4>
                <p className="project-client">{project.clientName}</p>
                {selectedProject?.id === project.id && (
                  <span className="selected-badge">✓ Selected</span>
                )}
              </div>
            ))}
          </div>
          
          {selectedProject && (
            <div className="worker-management-container">
              <div className="selected-project-banner">
                <span>👷 Managing workers for: </span>
                <strong>{selectedProject.name}</strong>
                <button 
                  className="change-project-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  Change Project
                </button>
              </div>
              <WorkerManagement 
                projectId={selectedProject.id}
                projectName={selectedProject.name}
              />
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderSuppliersTab = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>🏭 Supplier Management</h2>
          <p>Manage material suppliers including hardware stores, manufacturers, and wholesalers</p>
        </div>
      </div>
      <SupplierManagement />
    </>
  );

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-layout">
        <div className="dashboard-sidebar">
          <div className="sidebar-nav">
            <button 
              className={`sidebar-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => handleTabChange('projects')}
            >
              <span className="nav-icon">📁</span>
              <span className="nav-text">Projects</span>
            </button>
            <button 
              className={`sidebar-nav-item ${activeTab === 'store' ? 'active' : ''}`}
              onClick={() => handleTabChange('store')}
            >
              <span className="nav-icon">🏪</span>
              <span className="nav-text">Store Management</span>
            </button>
            <button 
              className={`sidebar-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
              onClick={() => handleTabChange('workers')}
            >
              <span className="nav-icon">👷</span>
              <span className="nav-text">Workers</span>
            </button>
            <button 
              className={`sidebar-nav-item ${activeTab === 'suppliers' ? 'active' : ''}`}
              onClick={() => handleTabChange('suppliers')}
            >
              <span className="nav-icon">🏭</span>
              <span className="nav-text">Suppliers</span>
            </button>
          </div>
        </div>

        <main className="dashboard-content">
          {activeTab === 'projects' && renderProjectsTab()}
          {activeTab === 'store' && renderStoreTab()}
          {activeTab === 'workers' && renderWorkersTab()}
          {activeTab === 'suppliers' && renderSuppliersTab()}
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Sunset Villas"
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
                  placeholder="e.g., Prime Properties Ltd"
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Kiambu Road, Nairobi"
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
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && reportData && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Report - {selectedProject.name}</h3>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            
            <div className="report-summary">
              <div className="summary-item">
                <span>Total Budget:</span>
                <strong>KES {reportData.totalBudget?.toLocaleString() || 0}</strong>
              </div>
              <div className="summary-item">
                <span>Total Spent:</span>
                <strong>KES {reportData.totalSpent?.toLocaleString() || 0}</strong>
              </div>
              <div className="summary-item">
                <span>Remaining:</span>
                <strong>KES {reportData.remainingBudget?.toLocaleString() || 0}</strong>
              </div>
            </div>
            
            <div className="report-actions">
              <button className="btn-primary" onClick={handleDownloadPDF}>
                📄 Download PDF Report
              </button>
              <div className="email-section">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
                <button 
                  className="btn-secondary" 
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Sending...' : '✉️ Send to Email'}
                </button>
              </div>
            </div>
            
            <div className="report-materials">
              <h4>Materials Breakdown</h4>
              {reportData.materials && reportData.materials.length > 0 ? (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Budget (KES)</th>
                      <th>Paid (KES)</th>
                      <th>Remaining (KES)</th>
                      <th>Status</th>
                      <th>% Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.materials.map((material, idx) => (
                      <tr key={idx}>
                        <td>{material.name}</td>
                        <td>{material.budget?.toLocaleString()}</td>
                        <td>{material.paid?.toLocaleString()}</td>
                        <td>{material.remaining?.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${material.paymentStatus?.toLowerCase().replace(' ', '-')}`}>
                            {material.paymentStatus}
                          </span>
                        </td>
                        <td>{material.percentagePaid?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">No materials added to this project yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;