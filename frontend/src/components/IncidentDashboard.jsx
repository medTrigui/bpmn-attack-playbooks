import React, { useState, useEffect } from 'react';
import './IncidentDashboard.css';
import { incidentsAPI, playbooksAPI } from '../services/apiService';

const IncidentDashboard = ({ onIncidentSelect }) => {
  const [incidents, setIncidents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playbooks, setPlaybooks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newIncident, setNewIncident] = useState({
    playbook_id: '',
    title: '',
    description: '',
    severity: 'medium',
    assigned_to: '',
    incident_type: ''
  });

  useEffect(() => {
    loadIncidents();
    loadStatistics();
    loadPlaybooks();
  }, [filterStatus]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await incidentsAPI.list(params);
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await incidentsAPI.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadPlaybooks = async () => {
    try {
      const data = await playbooksAPI.list();
      setPlaybooks(data.playbooks || []);
    } catch (error) {
      console.error('Error loading playbooks:', error);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      await incidentsAPI.create(newIncident);
      setShowCreateModal(false);
      setNewIncident({
        playbook_id: '',
        title: '',
        description: '',
        severity: 'medium',
        assigned_to: '',
        incident_type: ''
      });
      loadIncidents();
      loadStatistics();
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Failed to create incident: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!window.confirm('Are you sure you want to cancel this incident?')) {
      return;
    }
    try {
      await incidentsAPI.delete(incidentId);
      loadIncidents();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      'on-hold': 'status-hold'
    };
    return classes[status] || '';
  };

  const getSeverityClass = (severity) => {
    const classes = {
      critical: 'severity-critical',
      high: 'severity-high',
      medium: 'severity-medium',
      low: 'severity-low'
    };
    return classes[severity] || '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateDuration = (startedAt, completedAt) => {
    if (!startedAt) return 'Not started';
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const hours = Math.floor((end - start) / (1000 * 60 * 60));
    const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="incident-dashboard">
      <div className="dashboard-header">
        <h2>Incident Response Dashboard</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + New Incident
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-value">{statistics.total_incidents}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
          <div className="stat-card stat-active">
            <div className="stat-value">{statistics.active_incidents}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-value">{statistics.completed_incidents}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{statistics.average_completion_hours.toFixed(1)}h</div>
            <div className="stat-label">Avg. Duration</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="incident-filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
          onClick={() => setFilterStatus('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filterStatus === 'on-hold' ? 'active' : ''}`}
          onClick={() => setFilterStatus('on-hold')}
        >
          On Hold
        </button>
      </div>

      {/* Incidents List */}
      <div className="incidents-list">
        {loading ? (
          <div className="loading">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <p>No incidents found</p>
            <small>Create a new incident to start tracking response activities</small>
          </div>
        ) : (
          incidents.map(incident => (
            <div
              key={incident.id}
              className="incident-card"
              onClick={() => onIncidentSelect(incident)}
            >
              <div className="incident-header">
                <div className="incident-title-row">
                  <h3>{incident.title}</h3>
                  <div className="incident-badges">
                    <span className={`status-badge ${getStatusClass(incident.status)}`}>
                      {incident.status}
                    </span>
                    <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                </div>
                <div className="incident-meta">
                  <span className="meta-item meta-playbook">
                    {incident.playbook_name || incident.playbook_id}
                  </span>
                  {incident.assigned_to && (
                    <span className="meta-item meta-assignee">
                      {incident.assigned_to}
                    </span>
                  )}
                  <span className="meta-item meta-date">
                    {formatDate(incident.created_at)}
                  </span>
                </div>
              </div>

              <div className="incident-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${incident.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {incident.completed_tasks} / {incident.total_tasks} tasks completed
                  ({incident.progress_percentage.toFixed(0)}%)
                </div>
              </div>

              {incident.description && (
                <div className="incident-description">
                  {incident.description}
                </div>
              )}

              <div className="incident-footer">
                <div className="incident-duration">
                  Duration: {calculateDuration(incident.started_at, incident.completed_at)}
                </div>
                <button
                  className="btn-icon delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteIncident(incident.id);
                  }}
                  title="Cancel Incident"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Incident</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="form-group">
                <label>Playbook *</label>
                <select
                  value={newIncident.playbook_id}
                  onChange={(e) => setNewIncident({
                    ...newIncident,
                    playbook_id: e.target.value,
                    playbook_name: playbooks.find(p => p.id === e.target.value)?.name
                  })}
                  required
                >
                  <option value="">Select a playbook...</option>
                  {playbooks.map(playbook => (
                    <option key={playbook.id} value={playbook.id}>
                      {playbook.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Incident Title *</label>
                <input
                  type="text"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="e.g., Ransomware Attack on Workstation 123"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Describe the incident..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Incident Type</label>
                  <input
                    type="text"
                    value={newIncident.incident_type}
                    onChange={(e) => setNewIncident({ ...newIncident, incident_type: e.target.value })}
                    placeholder="e.g., ransomware, phishing"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assigned To</label>
                <input
                  type="text"
                  value={newIncident.assigned_to}
                  onChange={(e) => setNewIncident({ ...newIncident, assigned_to: e.target.value })}
                  placeholder="Analyst name"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDashboard;

