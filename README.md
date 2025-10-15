# BPMN Attack Playbooks

**Operationalizing Incident Response Playbooks with BPMN and MITRE ATT&CK Integration**

## Overview

This project extends model-based incident response playbooks by integrating BPMN (Business Process Model and Notation) with MITRE ATT&CK framework. Unlike the baseline FRIPP approach which uses a custom metamodel, this implementation uses industry-standard BPMN to make playbooks executable and operationalizable.

## Innovation

- **BPMN Standard**: Uses globally-recognized BPMN 2.0 instead of custom metamodels
- **ATT&CK Integration**: Each task maps to specific MITRE ATT&CK techniques
- **Executable Workflows**: Not just visual - playbooks can guide real incident response
- **Coverage Analysis**: Automatic ATT&CK coverage matrix and gap identification
- **SOAR Compatible**: Exports BPMN XML compatible with security orchestration platforms

## Architecture

```
Frontend (React + bpmn-js) ←→ Backend (Flask) ←→ MITRE ATT&CK Data
         ↓                           ↓
    BPMN Editor              Playbook Execution Engine
    ATT&CK Panel             Validation & Analytics
```

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python scripts/download_attack_data.py
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
bpmn-attack-playbooks/
├── frontend/              # React + bpmn-js editor
├── backend/              # Flask API + ATT&CK integration
├── playbook-examples/    # Sample BPMN playbooks
├── docs/                 # Documentation
└── tests/               # Test suites
```

## Research Context

This work builds on:
- **Baseline**: Shaked et al. (2022) "Model-based incident response playbooks"
- **Extension**: Integrates MITRE ATT&CK, uses BPMN standard, adds execution capability

## License

MIT License

