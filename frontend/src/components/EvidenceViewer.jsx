import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import './EvidenceViewer.css';

function EvidenceViewer({ incidentId, taskId }) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [severity, setSeverity] = useState('informational');
  const [evidenceType, setEvidenceType] = useState('file');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');

  // Fetch evidence whenever incidentId or taskId changes
  useEffect(() => {
    if (!incidentId) return;

    const fetchData = async () => {
      try {
        let data;
        if (taskId) {
          data = await apiService.evidence.fetchByTask(taskId);
        } else {
          data = await apiService.evidence.fetchByIncident(incidentId);
        }
        setEvidenceList(data);
      } catch (err) {
        console.error('Error fetching evidence:', err);
      }
    };

    fetchData();
  }, [incidentId, taskId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!incidentId) {
      alert('Incident must be selected to upload evidence.');
      return;
    }

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
        formData.append('evidence_type', 'file');
      } else {
        formData.append('evidence_type', evidenceType);
        formData.append('url', url);
        formData.append('content', content);
      }
      formData.append('title', title || (file ? file.name : 'New Evidence'));
      formData.append('description', description);
      formData.append('collected_by', collectedBy || 'Unknown');
      formData.append('severity', severity);
      formData.append('incident_id', incidentId);
      if (taskId) formData.append('task_execution_id', taskId);

      const res = await apiService.evidence.uploadEvidence(formData);
      setEvidenceList((prev) => [res.evidence, ...prev]);

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setCollectedBy('');
      setSeverity('informational');
      setUrl('');
      setContent('');
    } catch (err) {
      console.error('Error uploading evidence:', err);
      alert('Failed to upload evidence.');
    }
  };

  return (
    <div className="evidence-viewer">
      <h2>Evidence</h2>
      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-group">
          <label>Incident ID:</label>
          <input type="text" value={incidentId} readOnly />
        </div>
        <div className="form-group">
          <label>Task ID:</label>
          <input type="text" value={taskId || 'None'} readOnly />
        </div>

        <div className="form-group">
          <label>Evidence Type:</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
            <option value="file">File</option>
            <option value="url">URL</option>
            <option value="note">Note/Log</option>
          </select>
        </div>

        {evidenceType === 'file' && (
          <div className="form-group">
            <label>Upload File:</label>
            <input type="file" onChange={handleFileChange} />
          </div>
        )}

        {evidenceType === 'url' && (
          <div className="form-group">
            <label>URL:</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        )}

        {evidenceType === 'note' && (
          <div className="form-group">
            <label>Content:</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        )}

        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Collected By:</label>
          <input type="text" value={collectedBy} onChange={(e) => setCollectedBy(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Severity:</label>
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
              <a href={`http://localhost:5000/${e.file_path}`} className="download-link" target="_blank" rel="noreferrer">
                Download File
              </a>
            )}
            {e.url && (
              <a href={e.url} className="download-link" target="_blank" rel="noreferrer">
                Open URL
              </a>
            )}
            {e.content && <pre>{e.content}</pre>}
            <div className="evidence-footer">
              <span>Collected by: {e.collected_by || 'Unknown'}</span>
              <span>{new Date(e.collected_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvidenceViewer;
