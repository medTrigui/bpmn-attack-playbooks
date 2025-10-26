import React, { useState, useEffect } from 'react';
import './PlaybookLibrary.css';
import { playbooksAPI } from '../services/apiService';

const PlaybookLibrary = ({ onPlaybookLoad }) => {
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playbooksAPI.list();
      setPlaybooks(data.playbooks || []);
    } catch (err) {
      console.error('Error loading playbooks:', err);
      setError('Failed to load playbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPlaybook = async (playbookId) => {
    try {
      console.log('Loading playbook:', playbookId);
      const playbook = await playbooksAPI.get(playbookId);
      console.log('Received playbook data:', playbook);
      console.log('Has bpmn_xml?', !!playbook.bpmn_xml);
      
      if (!playbook || !playbook.bpmn_xml) {
        throw new Error('Invalid playbook data received from server');
      }
      
      onPlaybookLoad(playbook);
    } catch (err) {
      console.error('Error loading playbook:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert(`Failed to load playbook: ${err.message}\n\nCheck the browser console for details.`);
    }
  };

  const handleDeletePlaybook = async (playbookId, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${playbookId}"?`)) {
      return;
    }

    try {
      await playbooksAPI.delete(playbookId);
      loadPlaybooks(); // Refresh list
    } catch (err) {
      console.error('Error deleting playbook:', err);
      alert('Failed to delete playbook');
    }
  };

  const handleExportPlaybook = async (playbookId, e) => {
    e.stopPropagation();
    
    try {
      const blob = await playbooksAPI.export(playbookId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playbookId}.bpmn`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting playbook:', err);
      alert('Failed to export playbook');
    }
  };

  if (loading) {
    return (
      <div className="playbook-library loading">
        <div className="loading-spinner">Loading playbooks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playbook-library error">
        <div className="error-message">
          {error}
          <button onClick={loadPlaybooks} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="playbook-library">
      <div className="library-header">
        <h2>Playbook Library</h2>
        <button onClick={loadPlaybooks} className="refresh-btn" title="Refresh">
          ↻
        </button>
      </div>

      {playbooks.length === 0 ? (
        <div className="empty-state">
          <p>No playbooks found</p>
          <small>Create a new playbook to get started</small>
        </div>
      ) : (
        <div className="playbooks-list">
          {playbooks.map(playbook => (
            <div
              key={playbook.id}
              className="playbook-card"
              onClick={() => handleLoadPlaybook(playbook.id)}
            >
              <div className="playbook-header">
                <h3>{playbook.name}</h3>
                <div className="playbook-actions">
                  <button
                    onClick={(e) => handleExportPlaybook(playbook.id, e)}
                    className="action-btn export"
                    title="Export"
                  >
                    ⬇
                  </button>
                  <button
                    onClick={(e) => handleDeletePlaybook(playbook.id, e)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {playbook.metadata && (
                <div className="playbook-stats">
                  <div className="stat">
                    <span className="stat-value">{playbook.metadata.task_count}</span>
                    <span className="stat-label">Tasks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{playbook.metadata.technique_count}</span>
                    <span className="stat-label">ATT&CK</span>
                  </div>
                </div>
              )}
              
              <div className="playbook-meta">
                <span className="meta-item">
                  {new Date(playbook.modified).toLocaleDateString()}
                </span>
                <span className="meta-item">
                  {(playbook.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaybookLibrary;

