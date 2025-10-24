import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Health check
export const checkBackendHealth = async () => {
  const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`);
  return response.data;
};

// ATT&CK API calls
export const attackAPI = {
  getTechniques: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/attack/techniques`, { params });
    return response.data;
  },

  getTechnique: async (techniqueId) => {
    const response = await axios.get(`${API_BASE_URL}/attack/techniques/${techniqueId}`);
    return response.data;
  },

  getTactics: async () => {
    const response = await axios.get(`${API_BASE_URL}/attack/tactics`);
    return response.data;
  },

  searchTechniques: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/attack/search`, {
      params: { q: query }
    });
    return response.data;
  },

  getMatrix: async () => {
    const response = await axios.get(`${API_BASE_URL}/attack/matrix`);
    return response.data;
  },

  calculateCoverage: async (techniques) => {
    const response = await axios.post(`${API_BASE_URL}/attack/coverage`, {
      techniques
    });
    return response.data;
  }
};

// Playbooks API calls
export const playbooksAPI = {
  list: async () => {
    const response = await axios.get(`${API_BASE_URL}/playbooks/`);
    return response.data;
  },

  get: async (playbookId) => {
    const response = await axios.get(`${API_BASE_URL}/playbooks/${playbookId}`);
    return response.data;
  },

  save: async (playbookId, bpmnXml) => {
    const response = await axios.post(`${API_BASE_URL}/playbooks/`, {
      id: playbookId,
      bpmn_xml: bpmnXml
    });
    return response.data;
  },

  delete: async (playbookId) => {
    const response = await axios.delete(`${API_BASE_URL}/playbooks/${playbookId}`);
    return response.data;
  },

  export: async (playbookId) => {
    const response = await axios.get(`${API_BASE_URL}/playbooks/export/${playbookId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Validation API calls
export const validationAPI = {
  validate: async (bpmnXml) => {
    const response = await axios.post(`${API_BASE_URL}/validation/validate`, {
      bpmn_xml: bpmnXml
    });
    return response.data;
  },

  checkCoverage: async (bpmnXml) => {
    const response = await axios.post(`${API_BASE_URL}/validation/check-coverage`, {
      bpmn_xml: bpmnXml
    });
    return response.data;
  }
};

// Incidents API calls
export const incidentsAPI = {
  list: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/incidents/`, { params });
    return response.data;
  },

  get: async (incidentId) => {
    const response = await axios.get(`${API_BASE_URL}/incidents/${incidentId}`);
    return response.data;
  },

  create: async (incidentData) => {
    const response = await axios.post(`${API_BASE_URL}/incidents/`, incidentData);
    return response.data;
  },

  update: async (incidentId, updates) => {
    const response = await axios.put(`${API_BASE_URL}/incidents/${incidentId}`, updates);
    return response.data;
  },

  delete: async (incidentId) => {
    const response = await axios.delete(`${API_BASE_URL}/incidents/${incidentId}`);
    return response.data;
  },

  updateTask: async (incidentId, taskId, updates) => {
    const response = await axios.put(
      `${API_BASE_URL}/incidents/${incidentId}/tasks/${taskId}`,
      updates
    );
    return response.data;
  },

  getTimeline: async (incidentId) => {
    const response = await axios.get(`${API_BASE_URL}/incidents/${incidentId}/timeline`);
    return response.data;
  },

  addEvidence: async (incidentId, evidenceData) => {
    const response = await axios.post(
      `${API_BASE_URL}/incidents/${incidentId}/evidence`,
      evidenceData
    );
    return response.data;
  },

  getStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/incidents/statistics`);
    return response.data;
  }
};

export const evidenceAPI = {
  fetchByIncident: async (incidentId) => {
    const response = await axios.get(`${API_BASE_URL}/evidence/incident/${incidentId}`);
    return response.data;
  },
  fetchByTask: async (taskId) => {
    const response = await axios.get(`${API_BASE_URL}/evidence/task/${taskId}`);
    return response.data;
  },
  uploadEvidence: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/evidence/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteEvidence: async (evidenceId) => {
    const response = await axios.delete(`${API_BASE_URL}/evidence/${evidenceId}`);
    return response.data;
  }
};

const apiService = {
  checkBackendHealth,
  attack: attackAPI,
  playbooks: playbooksAPI,
  validation: validationAPI,
  incidents: incidentsAPI,
  evidence: evidenceAPI
};

export default apiService;

