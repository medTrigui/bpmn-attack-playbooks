import React, { useState, useEffect } from 'react';
import './App.css';
import BPMNEditor from './components/BPMNEditor';
import ATTACKPanel from './components/ATTACKPanel';
import PlaybookLibrary from './components/PlaybookLibrary';
import TaskPropertiesPanel from './components/TaskPropertiesPanel';
import IncidentDashboard from './components/IncidentDashboard';
import ExecutionView from './components/ExecutionView';
import EvidenceViewer from './components/EvidenceViewer';
import { checkBackendHealth } from './services/apiService';

function App() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPlaybook, setCurrentPlaybook] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showLibrary, setShowLibrary] = useState(false);
  const [viewMode, setViewMode] = useState('editor'); // editor, incidents, execution
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modelerInstance, setModelerInstance] = useState(null);
  const [selectedTechniques, setSelectedTechniques] = useState([]);
  const [activeTab, setActiveTab] = useState('properties'); // properties, attack

  useEffect(() => {
    // Check backend connection on mount
    checkBackendHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
  }, []);

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const handlePlaybookLoad = (playbook) => {
    setCurrentPlaybook(playbook);
    setShowLibrary(false);
  };

  const handleNewPlaybook = () => {
    setCurrentPlaybook(null);
    setSelectedTask(null);
    setViewMode('editor');
  };

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    setViewMode('execution');
  };

  const handleBackToDashboard = () => {
    setSelectedIncident(null);
    setViewMode('incidents');
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
    if (mode === 'editor') {
      setSelectedIncident(null);
    }
  };

  const handleModelerReady = (modeler) => {
    setModelerInstance(modeler);
  };

  const handleTechniquesChange = (techniques) => {
    setSelectedTechniques(techniques);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>BPMN Attack Playbooks</h1>
          <span className="subtitle">Incident Response + MITRE ATT&CK</span>
        </div>
        <div className="header-center">
          <nav className="view-navigation">
            <button
              className={`nav-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => handleViewChange('editor')}
            >
              Playbook Editor
            </button>
            <button
              className={`nav-btn ${viewMode === 'incidents' || viewMode === 'execution' ? 'active' : ''}`}
              onClick={() => handleViewChange('incidents')}
            >
              Incidents
            </button>
            <button
              className={`nav-btn ${viewMode === 'evidence' ? 'active' : ''}`}
              onClick={() => handleViewChange('evidence')}
            >
              Evidence
            </button>
          </nav>
        </div>
        <div className="header-right">
          {viewMode === 'editor' && (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowLibrary(!showLibrary)}
              >
                {showLibrary ? 'Close Library' : 'Open Library'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleNewPlaybook}
              >
                New Playbook
              </button>
            </>
          )}
          <div className={`status-indicator ${backendStatus}`}>
            <span className="status-dot"></span>
            {backendStatus === 'connected' ? 'Connected' : 
             backendStatus === 'checking' ? 'Checking...' : 'Disconnected'}
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Playbook Editor View */}
        {viewMode === 'editor' && (
          <>
            {showLibrary && (
              <aside className="library-sidebar">
                <PlaybookLibrary onPlaybookLoad={handlePlaybookLoad} />
              </aside>
            )}

            <main className="editor-container">
              <BPMNEditor 
                onTaskSelect={handleTaskSelect}
                currentPlaybook={currentPlaybook}
                onModelerReady={handleModelerReady}
              />
            </main>

            <aside className="side-panel">
              <div className="panel-tabs">
                <div 
                  className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
                  onClick={() => setActiveTab('properties')}
                >
                  Properties
                </div>
                <div 
                  className={`tab ${activeTab === 'attack' ? 'active' : ''}`}
                  onClick={() => setActiveTab('attack')}
                >
                  ATT&CK
                </div>
              </div>
              
              {activeTab === 'properties' && (
                <TaskPropertiesPanel 
                  task={selectedTask} 
                  modeler={modelerInstance}
                  selectedTechniques={selectedTechniques}
                />
              )}
              
              {activeTab === 'attack' && (
                <ATTACKPanel 
                  selectedTask={selectedTask}
                  onTechniquesChange={handleTechniquesChange}
                />
              )}
            </aside>
          </>
        )}

        {/* Incidents Dashboard View */}
        {viewMode === 'incidents' && (
          <main className="main-content">
            <IncidentDashboard onIncidentSelect={handleIncidentSelect} />
          </main>
        )}

        {/* Incident Execution View */}
        {viewMode === 'execution' && selectedIncident && (
          <main className="main-content">
            <ExecutionView 
              incident={selectedIncident} 
              onBack={handleBackToDashboard}
            />
          </main>
        )}
        {/* Evidence View */}
        {viewMode === 'evidence' && (
          <main className="main-content">
            <EvidenceViewer 
              incidentId={selectedIncident?.id} 
              taskId={selectedTask?.id} 
            />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;

