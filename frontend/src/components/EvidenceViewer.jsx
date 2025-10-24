import React, { useState, useEffect } from 'react';
import { evidenceAPI } from '../services/apiService';
import './EvidenceViewer.css';

function EvidenceViewer({ incidentId, taskId }) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('informational');
  const [collectedBy, setCollectedBy] = useState('');

  useEffect(() => {
    if (incidentId) fetchEvidence();
  }, [incidentId, taskId]);

  const fetchEvidence = async () => {
    try {
      let data = [];
      if (incidentId) {
        data = await evidenceAPI.fetchByIncident(incidentId);
      } else if (taskId) {
        data = await evidenceAPI.fetchByTask(taskId);
      }
      setEvidenceList(data);
    } catch (err) {
      console.error('Error fetching evidence:', err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file && !title) {
      alert('Please select a file or provide a title for text/URL evidence.');
      return;
    }

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('incident_id', incidentId);
    if (taskId) formData.append('task_execution_id', taskId);
    formData.append('title', title || (file ? file.name : 'New Evidence'));
    formData.append('description', description);
    formData.append('collected_by', collectedBy || 'Unknown');
    formData.append('severity', severity);

    try {
      await evidenceAPI.upload(formData);
      setFile(null);
      setTitle('');
      setDescription('');
      setSeverity('informational');
      setCollectedBy('');
      fetchEvidence();
    } catch (err) {
      console.error('Error uploading evidence:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await evidenceAPI.delete(id);
      fetchEvidence();
    } catch (err) {
      console.error('Error deleting evidence:', err);
    }
  };

  return (
    <div className="evidence-viewer">
      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-group">
          <label>File</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Collected By</label>
          <input type="text" value={collectedBy} onChange={(e) => setCollectedBy(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="informational">Informational</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Upload Evidence</button>
      </form>

      <div className="evidence-list">
        {evidenceList.map((e) => (
          <div key={e.id} className="evidence-card">
            <div className="evidence-header">
              <h4>{e.title}</h4>
              <span className={`badge severity-${e.severity}`}>{e.severity}</span>
            </div>
            <p className="evidence-description">{e.description}</p>
            {e.file_path && (
              <a className="download-link" href={e.file_path} target="_blank" rel="noopener noreferrer">
                Download File
              </a>
            )}
            <div className="evidence-footer">
              <span>Collected by: {e.collected_by}</span>
              <button className="btn-icon" onClick={() => handleDelete(e.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvidenceViewer;
