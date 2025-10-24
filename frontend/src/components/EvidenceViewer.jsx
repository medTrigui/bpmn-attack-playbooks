import React, { useState, useEffect } from 'react';
import { fetchEvidenceByIncident, uploadEvidence } from '../services/apiService';

export default function EvidenceViewer({ incidentId }) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('informational');
  const [collectedBy, setCollectedBy] = useState('');

  useEffect(() => {
    if (incidentId) loadEvidence();
  }, [incidentId]);

  const loadEvidence = async () => {
    const data = await fetchEvidenceByIncident(incidentId);
    setEvidenceList(data);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('incident_id', incidentId);
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('severity', severity);
    formData.append('collected_by', collectedBy);

    await uploadEvidence(formData);
    setFile(null);
    setTitle('');
    setDescription('');
    setSeverity('informational');
    setCollectedBy('');
    loadEvidence();
  };

  return (
    <div className="evidence-viewer">
      <form className="upload-form" onSubmit={handleUpload}>
        <div className="form-group">
          <label>File</label>
          <input type="file" onChange={handleFileChange} required />
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
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="informational">Informational</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="form-group">
          <label>Collected By</label>
          <input type="text" value={collectedBy} onChange={(e) => setCollectedBy(e.target.value)} />
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
            {e.description && <p className="evidence-description">{e.description}</p>}
            {e.file_path && (
              <a href={e.file_path} className="download-link" target="_blank" rel="noopener noreferrer">
                Download
              </a>
            )}
            {e.url && (
              <a href={e.url} className="download-link" target="_blank" rel="noopener noreferrer">
                View Link
              </a>
            )}
            {e.content && <pre className="evidence-description">{e.content}</pre>}
            <div className="evidence-footer">
              <span>Collected by: {e.collected_by}</span>
              <span>{new Date(e.collected_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
