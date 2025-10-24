import React, { useState, useEffect } from 'react';
import './ATTACKPanel.css';
import { attackAPI } from '../services/apiService';

const ATTACKPanel = ({ selectedTask, onTechniquesChange }) => {
  const [tactics, setTactics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState([]);

  useEffect(() => {
    // Load tactics on mount
    loadTactics();
  }, []);

  useEffect(() => {
    // Load techniques when tactic changes
    if (selectedTactic) {
      loadTechniques(selectedTactic);
    }
  }, [selectedTactic]);

  // Notify parent when selected techniques change
  useEffect(() => {
    if (onTechniquesChange) {
      onTechniquesChange(selectedTechniques);
    }
  }, [selectedTechniques, onTechniquesChange]);

  const loadTactics = async () => {
    setLoading(true);
    try {
      const data = await attackAPI.getTactics();
      setTactics(data.tactics || []);
    } catch (error) {
      console.error('Error loading tactics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechniques = async (tactic) => {
    setLoading(true);
    try {
      const data = await attackAPI.getTechniques({ 
        tactic: tactic.short_name,
        parent_only: true 
      });
      setTechniques(data.techniques || []);
    } catch (error) {
      console.error('Error loading techniques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const data = await attackAPI.searchTechniques(searchQuery);
      setTechniques(data.results || []);
      setSelectedTactic(null);
    } catch (error) {
      console.error('Error searching techniques:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTechniqueSelection = (technique) => {
    setSelectedTechniques(prev => {
      const exists = prev.find(t => t.id === technique.id);
      if (exists) {
        return prev.filter(t => t.id !== technique.id);
      } else {
        return [...prev, technique];
      }
    });
  };

  return (
    <div className="attack-panel">
      <div className="attack-header">
        <h3>MITRE ATT&CK</h3>
        {selectedTask && (
          <span className="selected-task-indicator">
            Task: {selectedTask.name}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search techniques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="search-btn">
          Search
        </button>
      </div>

      {/* Tactics */}
      <div className="tactics-section">
        <h4>Tactics</h4>
        <div className="tactics-grid">
          {tactics.map(tactic => (
            <div
              key={tactic.id}
              className={`tactic-card ${selectedTactic?.id === tactic.id ? 'active' : ''}`}
              onClick={() => setSelectedTactic(tactic)}
            >
              <div className="tactic-name">{tactic.name}</div>
              <div className="tactic-id">{tactic.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Techniques */}
      <div className="techniques-section">
        <h4>
          Techniques
          {selectedTactic && ` (${selectedTactic.name})`}
          {techniques.length > 0 && ` - ${techniques.length}`}
        </h4>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="techniques-list">
            {techniques.map(technique => {
              const isSelected = selectedTechniques.find(t => t.id === technique.id);
              return (
                <div
                  key={technique.id}
                  className={`technique-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleTechniqueSelection(technique)}
                >
                  <div className="technique-header">
                    <span className="technique-id">{technique.id}</span>
                    <span className="technique-name">{technique.name}</span>
                  </div>
                  <div className="technique-description">
                    {technique.description.substring(0, 150)}...
                  </div>
                  {technique.platforms && technique.platforms.length > 0 && (
                    <div className="technique-platforms">
                      {technique.platforms.map(platform => (
                        <span key={platform} className="platform-badge">
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Techniques Summary */}
      {selectedTechniques.length > 0 && (
        <div className="selected-techniques-summary">
          <h4>Selected for Task ({selectedTechniques.length})</h4>
          <div className="selected-badges">
            {selectedTechniques.map(tech => (
              <span key={tech.id} className="selected-badge">
                {tech.id}
                <button
                  onClick={() => toggleTechniqueSelection(tech)}
                  className="remove-badge"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATTACKPanel;

