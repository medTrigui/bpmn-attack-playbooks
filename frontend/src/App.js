import React, { useState, useEffect } from 'react';
import './App.css';
import BPMNEditor from './components/BPMNEditor';
import ATTACKPanel from './components/ATTACKPanel';
import PlaybookLibrary from './components/PlaybookLibrary';
import TaskPropertiesPanel from './components/TaskPropertiesPanel';
import { checkBackendHealth } from './services/apiService';

function App() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPlaybook, setCurrentPlaybook] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showLibrary, setShowLibrary] = useState(false);

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
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>BPMN Attack Playbooks</h1>
          <span className="subtitle">Incident Response + MITRE ATT&CK</span>
        </div>
        <div className="header-right">
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
          <div className={`status-indicator ${backendStatus}`}>
            <span className="status-dot"></span>
            {backendStatus === 'connected' ? 'Connected' : 
             backendStatus === 'checking' ? 'Checking...' : 'Disconnected'}
          </div>
        </div>
      </header>

      <div className="app-body">
        {showLibrary && (
          <aside className="library-sidebar">
            <PlaybookLibrary onPlaybookLoad={handlePlaybookLoad} />
          </aside>
        )}

        <main className="editor-container">
          <BPMNEditor 
            onTaskSelect={handleTaskSelect}
            currentPlaybook={currentPlaybook}
          />
        </main>

        <aside className="side-panel">
          <div className="panel-tabs">
            <div className="tab active">Properties</div>
            <div className="tab">ATT&CK</div>
          </div>
          
          {selectedTask ? (
            <TaskPropertiesPanel task={selectedTask} />
          ) : (
            <div className="panel-empty">
              <p>Select a task to view properties</p>
            </div>
          )}
          
          <ATTACKPanel selectedTask={selectedTask} />
        </aside>
      </div>
    </div>
  );
}

export default App;

