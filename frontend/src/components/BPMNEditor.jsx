import React, { useEffect, useRef, useState } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import './BPMNEditor.css';
import { playbooksAPI, validationAPI } from '../services/apiService';

const BPMNEditor = ({ onTaskSelect, currentPlaybook }) => {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const [playbookName, setPlaybookName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  // Initialize BPMN Modeler
  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: document
      }
    });

    modelerRef.current = modeler;

    // Load initial diagram or create new
    const initialDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:attack="http://attack.mitre.org/bpmn/extension"
                  xmlns:irp="http://incident-response/bpmn/extension"
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    modeler.importXML(initialDiagram).catch(err => {
      console.error('Error loading BPMN diagram:', err);
    });

    // Handle element selection
    const eventBus = modeler.get('eventBus');
    eventBus.on('element.click', (e) => {
      const element = e.element;
      if (element.type === 'bpmn:Task') {
        onTaskSelect({
          id: element.id,
          name: element.businessObject.name || 'Unnamed Task',
          type: element.type
        });
      }
    });

    // Cleanup
    return () => {
      modeler.destroy();
    };
  }, [onTaskSelect]);

  // Load playbook when selected
  useEffect(() => {
    if (currentPlaybook && modelerRef.current) {
      setPlaybookName(currentPlaybook.id);
      modelerRef.current.importXML(currentPlaybook.bpmn_xml).catch(err => {
        console.error('Error loading playbook:', err);
      });
    }
  }, [currentPlaybook]);

  const handleSave = async () => {
    if (!playbookName.trim()) {
      alert('Please enter a playbook name');
      return;
    }

    setIsSaving(true);
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      await playbooksAPI.save(playbookName, xml);
      alert('Playbook saved successfully!');
    } catch (error) {
      console.error('Error saving playbook:', error);
      alert('Failed to save playbook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const results = await validationAPI.validate(xml);
      setValidationResults(results);
      setShowValidation(true);
    } catch (error) {
      console.error('Error validating playbook:', error);
      alert('Failed to validate playbook');
    }
  };

  const handleExport = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playbookName || 'playbook'}.bpmn`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting playbook:', error);
    }
  };

  return (
    <div className="bpmn-editor-wrapper">
      <div className="editor-toolbar">
        <input
          type="text"
          placeholder="Playbook name..."
          value={playbookName}
          onChange={(e) => setPlaybookName(e.target.value)}
          className="playbook-name-input"
        />
        <div className="toolbar-actions">
          <button onClick={handleValidate} className="btn btn-outline">
            Validate
          </button>
          <button onClick={handleExport} className="btn btn-outline">
            Export
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="bpmn-canvas" />

      {showValidation && validationResults && (
        <div className="validation-panel">
          <div className="validation-header">
            <h3>Validation Results</h3>
            <button onClick={() => setShowValidation(false)} className="close-btn">×</button>
          </div>
          <div className="validation-content">
            <div className={`validation-status ${validationResults.valid ? 'valid' : 'invalid'}`}>
              {validationResults.valid ? '✓ Valid' : '✗ Invalid'}
            </div>
            
            {validationResults.errors.length > 0 && (
              <div className="validation-section errors">
                <h4>Errors ({validationResults.errors.length})</h4>
                <ul>
                  {validationResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResults.warnings.length > 0 && (
              <div className="validation-section warnings">
                <h4>Warnings ({validationResults.warnings.length})</h4>
                <ul>
                  {validationResults.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BPMNEditor;

