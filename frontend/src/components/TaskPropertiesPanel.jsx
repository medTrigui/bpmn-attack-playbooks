import React, { useState, useEffect } from 'react';
import './TaskPropertiesPanel.css';

const TaskPropertiesPanel = ({ task, modeler, selectedTechniques }) => {
  const [properties, setProperties] = useState({
    name: '',
    role: '',
    tool: '',
    evidence: '',
    phase: 'detection',
    priority: 'medium',
    estimatedTime: '',
    notes: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Load task properties when task changes
  useEffect(() => {
    if (task && modeler) {
      const elementRegistry = modeler.get('elementRegistry');
      const element = elementRegistry.get(task.id);
      
      if (element) {
        const businessObject = element.businessObject;
        
        setProperties({
          name: businessObject.name || '',
          role: businessObject.$attrs['irp:role'] || '',
          tool: businessObject.$attrs['irp:tool'] || '',
          evidence: businessObject.$attrs['irp:evidence'] || '',
          phase: businessObject.$attrs['irp:phase'] || 'detection',
          priority: businessObject.$attrs['irp:priority'] || 'medium',
          estimatedTime: businessObject.$attrs['irp:estimatedTime'] || '',
          notes: businessObject.$attrs['irp:notes'] || ''
        });
        setHasChanges(false);
      }
    }
  }, [task, modeler]);

  const handleChange = (field, value) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleApply = () => {
    if (!task || !modeler) return;

    const modeling = modeler.get('modeling');
    const elementRegistry = modeler.get('elementRegistry');
    const element = elementRegistry.get(task.id);

    if (element) {
      // Update name
      modeling.updateLabel(element, properties.name);

      // Update custom properties
      modeling.updateProperties(element, {
        'irp:role': properties.role,
        'irp:tool': properties.tool,
        'irp:evidence': properties.evidence,
        'irp:phase': properties.phase,
        'irp:priority': properties.priority,
        'irp:estimatedTime': properties.estimatedTime,
        'irp:notes': properties.notes
      });

      // Update ATT&CK techniques if selected
      if (selectedTechniques && selectedTechniques.length > 0) {
        const techniqueIds = selectedTechniques.map(t => t.id).join(',');
        const tacticNames = [...new Set(selectedTechniques.flatMap(t => t.tactics.map(tactic => tactic.name)))].join(',');
        
        modeling.updateProperties(element, {
          'attack:techniques': techniqueIds,
          'attack:tactics': tacticNames
        });
      }

      setHasChanges(false);
      alert('Task properties updated successfully!');
    }
  };

  const handleCancel = () => {
    // Reload properties from element
    if (task && modeler) {
      const elementRegistry = modeler.get('elementRegistry');
      const element = elementRegistry.get(task.id);
      
      if (element) {
        const businessObject = element.businessObject;
        
        setProperties({
          name: businessObject.name || '',
          role: businessObject.$attrs['irp:role'] || '',
          tool: businessObject.$attrs['irp:tool'] || '',
          evidence: businessObject.$attrs['irp:evidence'] || '',
          phase: businessObject.$attrs['irp:phase'] || 'detection',
          priority: businessObject.$attrs['irp:priority'] || 'medium',
          estimatedTime: businessObject.$attrs['irp:estimatedTime'] || '',
          notes: businessObject.$attrs['irp:notes'] || ''
        });
        setHasChanges(false);
      }
    }
  };

  if (!task) {
    return (
      <div className="task-properties-panel empty">
        <p>Select a task to edit properties</p>
        <small>Click on any task in the diagram</small>
      </div>
    );
  }

  return (
    <div className="task-properties-panel">
      <div className="panel-header">
        <h3>Task Properties</h3>
        <span className="task-type-badge">{task.type}</span>
      </div>

      <div className="property-group">
        <label>Task Name</label>
        <input
          type="text"
          value={properties.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter task name..."
        />
      </div>

      <div className="property-group">
        <label>IR Phase</label>
        <select
          value={properties.phase}
          onChange={(e) => handleChange('phase', e.target.value)}
        >
          <option value="preparation">Preparation</option>
          <option value="detection">Detection</option>
          <option value="analysis">Analysis</option>
          <option value="containment">Containment</option>
          <option value="eradication">Eradication</option>
          <option value="recovery">Recovery</option>
          <option value="post-incident">Post-Incident</option>
        </select>
      </div>

      <div className="property-group">
        <label>Assigned Role</label>
        <select
          value={properties.role}
          onChange={(e) => handleChange('role', e.target.value)}
        >
          <option value="">Select role...</option>
          <option value="soc-analyst-l1">SOC Analyst L1</option>
          <option value="soc-analyst-l2">SOC Analyst L2</option>
          <option value="incident-responder">Incident Responder</option>
          <option value="threat-hunter">Threat Hunter</option>
          <option value="forensics-specialist">Forensics Specialist</option>
          <option value="security-engineer">Security Engineer</option>
          <option value="ciso">CISO</option>
        </select>
      </div>

      <div className="property-group">
        <label>Tool/Platform</label>
        <input
          type="text"
          value={properties.tool}
          onChange={(e) => handleChange('tool', e.target.value)}
          placeholder="e.g., EDR, SIEM, Firewall..."
        />
      </div>

      <div className="property-group">
        <label>Priority</label>
        <div className="priority-selector">
          {['low', 'medium', 'high', 'critical'].map(priority => (
            <button
              key={priority}
              className={`priority-btn ${properties.priority === priority ? 'active' : ''} ${priority}`}
              onClick={() => handleChange('priority', priority)}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="property-group">
        <label>Estimated Time</label>
        <input
          type="text"
          value={properties.estimatedTime}
          onChange={(e) => handleChange('estimatedTime', e.target.value)}
          placeholder="e.g., 30 minutes"
        />
      </div>

      <div className="property-group">
        <label>Evidence/Data Required</label>
        <textarea
          value={properties.evidence}
          onChange={(e) => handleChange('evidence', e.target.value)}
          placeholder="What evidence or data is needed for this task?"
          rows="3"
        />
      </div>

      <div className="property-group">
        <label>Notes</label>
        <textarea
          value={properties.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes or instructions..."
          rows="4"
        />
      </div>

      {/* ATT&CK Techniques Display */}
      {selectedTechniques && selectedTechniques.length > 0 && (
        <div className="property-group">
          <label>Mapped ATT&CK Techniques</label>
          <div className="selected-techniques">
            {selectedTechniques.map(technique => (
              <div key={technique.id} className="technique-tag">
                <span className="technique-id">{technique.id}</span>
                <span className="technique-name">{technique.name}</span>
              </div>
            ))}
          </div>
          <small className="help-text">
            Select techniques from the ATT&CK panel on the right
          </small>
        </div>
      )}

      <div className="panel-actions">
        <button 
          className="btn btn-outline" 
          onClick={handleCancel}
          disabled={!hasChanges}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleApply}
          disabled={!hasChanges}
        >
          {hasChanges ? 'Apply Changes' : 'No Changes'}
        </button>
      </div>
    </div>
  );
};

export default TaskPropertiesPanel;

