import React, { useState, useEffect } from 'react';
import './ExecutionView.css';
import { incidentsAPI } from '../services/apiService';

const ExecutionView = ({ incident, onBack }) => {
  const [incidentData, setIncidentData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, timeline, evidence
  const [loading, setLoading] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    evidence_type: 'note',
    content: '',
    url: ''
  });
  
  // Task editing state
  const [taskEdits, setTaskEdits] = useState({
    notes: '',
    findings: '',
    actions_taken: ''
  });

  useEffect(() => {
    if (incident) {
      loadIncidentData();
    }
  }, [incident]);

  const loadIncidentData = async () => {
    setLoading(true);
    try {
      const data = await incidentsAPI.get(incident.id);
      setIncidentData(data.incident);
      setTasks(data.tasks || []);
      const orderedTimeline = (data.timeline || []).slice().sort((a, b) => {
        const left = new Date(a.timestamp).getTime();
        const right = new Date(b.timestamp).getTime();
        return left - right;
      });
      setTimeline(orderedTimeline);
      setEvidence(data.evidence || []);
    } catch (error) {
      console.error('Error loading incident data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await incidentsAPI.updateTask(incident.id, taskId, {
        status: newStatus,
        updated_by: 'user' // TODO: Replace with actual user
      });
      loadIncidentData();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await incidentsAPI.updateTask(incident.id, taskId, {
        ...updates,
        updated_by: 'user'
      });
      loadIncidentData();
      // Don't close the task - keep it open
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleTaskSelect = (task) => {
    if (selectedTask?.id === task.id) {
      // Collapse if clicking same task
      setSelectedTask(null);
    } else {
      // Expand new task
      setSelectedTask(task);
      // Initialize edit fields with current values
      setTaskEdits({
        notes: task.notes || '',
        findings: task.findings || '',
        actions_taken: task.actions_taken || ''
      });
    }
  };

  const handleSaveTaskDetails = async () => {
    if (!selectedTask) return;
    
    try {
      await incidentsAPI.updateTask(incident.id, selectedTask.id, {
        notes: taskEdits.notes,
        findings: taskEdits.findings,
        actions_taken: taskEdits.actions_taken,
        updated_by: 'user'
      });
      alert('✓ Task details saved successfully');
      loadIncidentData();
    } catch (error) {
      console.error('Error saving task details:', error);
      alert('Failed to save task details');
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    try {
      await incidentsAPI.addEvidence(incident.id, {
        ...newEvidence,
        task_execution_id: selectedTask?.id,
        collected_by: 'user'
      });
      setShowEvidenceModal(false);
      setNewEvidence({
        title: '',
        description: '',
        evidence_type: 'note',
        content: '',
        url: ''
      });
      loadIncidentData();
    } catch (error) {
      console.error('Error adding evidence:', error);
      alert('Failed to add evidence');
    }
  };

  const handleIncidentStatusChange = async (newStatus) => {
    try {
      await incidentsAPI.update(incident.id, {
        status: newStatus,
        updated_by: 'user'
      });
      loadIncidentData();
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident status');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '○',
      in_progress: '◐',
      completed: '●',
      skipped: '⊘',
      blocked: '✖',
      failed: '✖'
    };
    return icons[status] || '○';
  };

  const getTasksByPhase = () => {
    const phases = {};
    tasks.forEach(task => {
      const phase = task.phase || 'unassigned';
      if (!phases[phase]) {
        phases[phase] = [];
      }
      phases[phase].push(task);
    });
    return phases;
  };

  const parseEstimatedMinutes = (value) => {
    if (!value) return null;
    const lower = value.toLowerCase();
    let minutes = 0;

    const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(hour|hr)/);
    if (hourMatch) {
      minutes += parseFloat(hourMatch[1]) * 60;
    }

    const minuteMatch = lower.match(/(\d+(?:\.\d+)?)\s*(minute|min)/);
    if (minuteMatch) {
      minutes += parseFloat(minuteMatch[1]);
    }

    if (minutes === 0) {
      const fallback = lower.match(/(\d+(?:\.\d+)?)/);
      if (fallback) {
        minutes = parseFloat(fallback[1]);
      }
    }

    return Number.isNaN(minutes) ? null : Math.round(minutes);
  };

  const formatMinutesValue = (value) => {
    if (value === null || value === undefined) return '—';
    return `${value}m`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !incidentData) {
    return <div className="loading">Loading incident data...</div>;
  }

  if (!incidentData) {
    return <div className="error">Incident not found</div>;
  }

  const tasksByPhase = getTasksByPhase();
  const comparisonRows = tasks.map(task => {
    const estimatedMinutes = parseEstimatedMinutes(task.estimated_time);
    const actualMinutes = typeof task.actual_duration_minutes === 'number'
      ? task.actual_duration_minutes
      : null;
    const delta = estimatedMinutes !== null && actualMinutes !== null
      ? actualMinutes - estimatedMinutes
      : null;
    let statusLabel = 'Not Measured';

    if (delta !== null) {
      if (Math.abs(delta) <= 5) {
        statusLabel = 'On Track';
      } else if (delta > 0) {
        statusLabel = `Behind by ${delta}m`;
      } else {
        statusLabel = `Ahead by ${Math.abs(delta)}m`;
      }
    }

    return {
      id: task.id,
      name: task.task_name,
      estimatedMinutes,
      actualMinutes,
      delta,
      statusLabel,
      startedAt: task.started_at,
      completedAt: task.completed_at
    };
  });

  const analysisStats = {
    behind: comparisonRows.filter(row => row.delta !== null && row.delta > 5).length,
    ahead: comparisonRows.filter(row => row.delta !== null && row.delta < -5).length,
    onTrack: comparisonRows.filter(row => row.delta !== null && Math.abs(row.delta) <= 5).length,
    measured: comparisonRows.filter(row => row.delta !== null).length
  };

  const filteredTimeline = timeline.filter(event => {
    if (timelineFilter === 'tasks') {
      return event.event_type && event.event_type.startsWith('task');
    }
    if (timelineFilter === 'evidence') {
      return event.event_type === 'evidence_added';
    }
    return true;
  });

  const evidenceTimeline = evidence
    .slice()
    .sort((a, b) => new Date(a.collected_at) - new Date(b.collected_at));

  return (
    <div className="execution-view">
      <div className="execution-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div className="incident-info">
          <h2>{incidentData.title}</h2>
          <div className="incident-meta-row">
            <span className={`status-badge status-${incidentData.status}`}>
              {incidentData.status}
            </span>
            <span className={`severity-badge severity-${incidentData.severity}`}>
              {incidentData.severity}
            </span>
            <span className="info-playbook">{incidentData.playbook_name}</span>
            {incidentData.assigned_to && <span className="info-assignee">{incidentData.assigned_to}</span>}
          </div>
        </div>
        <div className="incident-actions">
          {incidentData.status === 'active' && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => handleIncidentStatusChange('on-hold')}
              >
                Pause
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleIncidentStatusChange('completed')}
              >
                Complete
              </button>
            </>
          )}
          {incidentData.status === 'on-hold' && (
            <button
              className="btn btn-primary"
              onClick={() => handleIncidentStatusChange('active')}
            >
              Resume
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="execution-progress">
        <div className="progress-bar-large">
          <div
            className="progress-fill"
            style={{ width: `${incidentData.progress_percentage}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>{incidentData.completed_tasks} / {incidentData.total_tasks} tasks completed</span>
          <span>{incidentData.progress_percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="execution-tabs">
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks ({tasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline ({timeline.length})
        </button>
        <button
          className={`tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          Evidence ({evidence.length})
        </button>
        <button
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="tasks-panel">
            {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => (
              <div key={phase} className="phase-group">
                <h3 className="phase-header">
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </h3>
                <div className="tasks-list">
                  {phaseTasks.map(task => (
                    <div
                      key={task.id}
                      className={`task-item ${task.status} ${selectedTask?.id === task.id ? 'expanded' : ''}`}
                      onClick={() => handleTaskSelect(task)}
                    >
                      <div className="task-header">
                        <div className="task-status-icon">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="task-info">
                          <h4>
                            {task.task_name}
                            <span className="expand-indicator">
                              {selectedTask?.id === task.id ? '▼' : '▶'}
                            </span>
                          </h4>
                          <div className="task-meta">
                            {task.role && <span className="meta-role">{task.role}</span>}
                            {task.tool && <span className="meta-tool">{task.tool}</span>}
                            {task.priority && (
                              <span className={`priority-${task.priority}`}>
                                {task.priority}
                              </span>
                            )}
                            {task.estimated_time && <span className="meta-time">{task.estimated_time}</span>}
                          </div>
                        </div>
                        <div className="task-actions">
                          {task.status === 'pending' && (
                            <button
                              className="btn-small btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusChange(task.id, 'in_progress');
                              }}
                            >
                              Start
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              className="btn-small btn-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusChange(task.id, 'completed');
                              }}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Task Details */}
                      {selectedTask?.id === task.id && (
                        <div className="task-details" onClick={(e) => e.stopPropagation()}>
                          <div className="task-details-section">
                            <h5>ATT&CK Mappings</h5>
                            {task.attack_techniques && task.attack_techniques.length > 0 ? (
                              <div className="attack-mappings">
                                {task.attack_techniques.map((tech, idx) => {
                                  const tactic = task.attack_tactics && task.attack_tactics[idx];
                                  return (
                                    <div key={`${tech}-${idx}`} className="attack-mapping-item">
                                      <span className="attack-technique-badge">{tech}</span>
                                      {tactic && (
                                        <span className="attack-tactic-badge">
                                          {tactic}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="no-data">No ATT&CK mappings</p>
                            )}
                          </div>

                          <div className="task-details-section">
                            <h5>Notes</h5>
                            <textarea
                              placeholder="Add execution notes..."
                              value={taskEdits.notes}
                              onChange={(e) => setTaskEdits({ ...taskEdits, notes: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              rows="4"
                            />
                          </div>

                          <div className="task-details-section">
                            <h5>Findings</h5>
                            <textarea
                              placeholder="Document findings..."
                              value={taskEdits.findings}
                              onChange={(e) => setTaskEdits({ ...taskEdits, findings: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              rows="4"
                            />
                          </div>

                          <div className="task-details-section">
                            <h5>Actions Taken</h5>
                            <textarea
                              placeholder="What actions were performed..."
                              value={taskEdits.actions_taken}
                              onChange={(e) => setTaskEdits({ ...taskEdits, actions_taken: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              rows="4"
                            />
                          </div>

                          {/* Save Button */}
                          <div className="task-details-section save-section">
                            <button
                              className="btn btn-primary btn-save"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveTaskDetails();
                              }}
                            >
                              Save Changes
                            </button>
                          </div>

                          <div className="task-details-actions">
                            <button
                              className="btn btn-secondary"
                              onClick={() => setShowEvidenceModal(true)}
                            >
                              + Add Evidence
                            </button>
                            {task.status !== 'blocked' && (
                              <button
                                className="btn btn-warning"
                                onClick={() => {
                                  const reason = prompt('Why is this task blocked?');
                                  if (reason) {
                                    handleTaskUpdate(task.id, {
                                      status: 'blocked',
                                      blocked_reason: reason
                                    });
                                  }
                                }}
                              >
                                Block Task
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="timeline-panel">
            <div className="timeline-filters">
              <button
                className={`filter-chip ${timelineFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTimelineFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-chip ${timelineFilter === 'tasks' ? 'active' : ''}`}
                onClick={() => setTimelineFilter('tasks')}
              >
                Tasks
              </button>
              <button
                className={`filter-chip ${timelineFilter === 'evidence' ? 'active' : ''}`}
                onClick={() => setTimelineFilter('evidence')}
              >
                Evidence
              </button>
            </div>
            {filteredTimeline.length === 0 ? (
              <div className="empty-state">No timeline events yet</div>
            ) : (
              <div className="timeline-list">
                {filteredTimeline.map(event => (
                  <div key={event.id} className="timeline-event">
                    <div className="timeline-icon">•</div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{event.title}</h4>
                        <span className="timeline-time">{formatTimestamp(event.timestamp)}</span>
                      </div>
                      {event.description && <p>{event.description}</p>}
                      <div className="timeline-meta">
                        {event.performed_by && <span>by {event.performed_by}</span>}
                        {event.category && <span>• {event.category}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="evidence-panel">
            <div className="evidence-header">
              <h3>Collected Evidence</h3>
              <button
                className="btn btn-primary"
                onClick={() => setShowEvidenceModal(true)}
              >
                + Add Evidence
              </button>
            </div>
            {evidence.length === 0 ? (
              <div className="empty-state">No evidence collected yet</div>
            ) : (
              <div className="evidence-list">
                {evidence.map(item => (
                  <div key={item.id} className="evidence-item">
                    <div className="evidence-icon">
                      <span className={`evidence-type-${item.evidence_type}`}>
                        {item.evidence_type.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="evidence-content">
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                      {item.content && (
                        <div className="evidence-content-text">{item.content}</div>
                      )}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.url}
                        </a>
                      )}
                      <div className="evidence-meta">
                        <span>{item.evidence_type}</span>
                        {item.collected_by && <span>• by {item.collected_by}</span>}
                        <span>• {formatTimestamp(item.collected_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="evidence-timeline-section">
              <h4>Evidence Timeline</h4>
              {evidenceTimeline.length === 0 ? (
                <div className="empty-state">No evidence collected yet</div>
              ) : (
                <div className="evidence-timeline">
                  {evidenceTimeline.map(item => (
                    <div key={item.id} className="evidence-timeline-event">
                      <div className="timeline-dot"></div>
                      <div className="timeline-body">
                        <div className="timeline-row">
                          <strong>{item.title}</strong>
                          <span>{formatTimestamp(item.collected_at)}</span>
                        </div>
                        <div className="timeline-meta">
                          <span>{item.evidence_type}</span>
                          {item.collected_by && <span>• {item.collected_by}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-panel">
            <div className="analysis-summary">
              <div className="summary-card">
                <span className="summary-label">Measured Tasks</span>
                <span className="summary-value">
                  {analysisStats.measured}/{comparisonRows.length}
                </span>
              </div>
              <div className="summary-card">
                <span className="summary-label">On Track</span>
                <span className="summary-value">{analysisStats.onTrack}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Ahead</span>
                <span className="summary-value">{analysisStats.ahead}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Behind</span>
                <span className="summary-value">{analysisStats.behind}</span>
              </div>
            </div>
            <div className="analysis-table-wrapper">
              {comparisonRows.length === 0 ? (
                <div className="empty-state">No tasks available for analysis</div>
              ) : (
                <table className="analysis-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Estimated</th>
                      <th>Actual</th>
                      <th>Delta</th>
                      <th>Status</th>
                      <th>Started</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map(row => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{formatMinutesValue(row.estimatedMinutes)}</td>
                        <td>{formatMinutesValue(row.actualMinutes)}</td>
                        <td>
                          {row.delta === null ? '—' : `${row.delta > 0 ? '+' : ''}${row.delta}m`}
                        </td>
                        <td>{row.statusLabel}</td>
                        <td>{formatTimestamp(row.startedAt)}</td>
                        <td>{formatTimestamp(row.completedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div className="modal-overlay" onClick={() => setShowEvidenceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Evidence</h3>
              <button className="modal-close" onClick={() => setShowEvidenceModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddEvidence}>
              <div className="form-group">
                <label>Evidence Type *</label>
                <select
                  value={newEvidence.evidence_type}
                  onChange={(e) => setNewEvidence({ ...newEvidence, evidence_type: e.target.value })}
                  required
                >
                  <option value="note">Note</option>
                  <option value="file">File</option>
                  <option value="screenshot">Screenshot</option>
                  <option value="url">URL/Link</option>
                  <option value="log">Log Entry</option>
                  <option value="ioc">Indicator of Compromise</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  rows="3"
                />
              </div>

              {newEvidence.evidence_type === 'url' && (
                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="url"
                    value={newEvidence.url}
                    onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })}
                  />
                </div>
              )}

              {['note', 'log', 'ioc'].includes(newEvidence.evidence_type) && (
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={newEvidence.content}
                    onChange={(e) => setNewEvidence({ ...newEvidence, content: e.target.value })}
                    rows="5"
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEvidenceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionView;

