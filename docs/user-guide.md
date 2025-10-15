# BPMN Attack Playbooks - User Guide

## Getting Started

### Prerequisites
- **Backend**: Python 3.8+
- **Frontend**: Node.js 16+
- **Browser**: Modern browser (Chrome, Firefox, Edge)

### Installation

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download MITRE ATT&CK data
python scripts/download_attack_data.py

# Run backend server
python main.py
```

Backend will start at `http://localhost:5000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will start at `http://localhost:3000`

## Creating Your First Playbook

### Step 1: Create New Playbook

1. Click **"New Playbook"** in the top-right
2. Enter a playbook name (e.g., "ransomware-response")
3. The BPMN canvas will show a start event

### Step 2: Add Tasks

1. Drag elements from the BPMN palette on the left:
   - **Task**: Individual IR action
   - **Gateway**: Decision point
   - **End Event**: Playbook completion

2. Connect elements by dragging from connection points

3. Name your tasks by double-clicking them

**Example Flow:**
```
Start → Detect Ransomware → Isolate Host → Analyze IOCs → End
```

### Step 3: Add ATT&CK Mappings

1. Click on a task to select it
2. The right panel shows **Properties** and **ATT&CK** tabs
3. In the **ATT&CK** tab:
   - Browse tactics (e.g., "Impact")
   - Select relevant techniques (e.g., T1486 - Data Encrypted for Impact)
   - Click technique to associate with task

4. Selected techniques appear at the bottom

### Step 4: Configure Task Properties

In the **Properties** tab:
- **Task Name**: Descriptive name
- **IR Phase**: Select from NIST phases
- **Assigned Role**: Who performs this task
- **Tool/Platform**: Tool needed (e.g., "CrowdStrike EDR")
- **Priority**: low/medium/high/critical
- **Estimated Time**: Expected duration
- **Evidence**: What data is collected
- **Notes**: Additional instructions

### Step 5: Validate Playbook

1. Click **"Validate"** in the toolbar
2. Review validation results:
   - **Errors**: Must fix (e.g., broken flows)
   - **Warnings**: Should address (e.g., missing ATT&CK mappings)

### Step 6: Save Playbook

1. Enter playbook name in the text box
2. Click **"Save"**
3. Playbook is stored as BPMN XML

## Using the Playbook Library

### Opening Existing Playbooks

1. Click **"Open Library"** in the header
2. Browse available playbooks
3. Click a playbook to load it

### Playbook Information

Each playbook card shows:
- **Name**: Playbook identifier
- **Task Count**: Number of tasks
- **ATT&CK Count**: Mapped techniques
- **Modified Date**: Last update
- **File Size**: Storage size

### Library Actions

- **⬇ Export**: Download as BPMN XML file
- **× Delete**: Remove playbook (with confirmation)
- **↻ Refresh**: Reload library

## Example Playbooks

### Ransomware Response

```
Phases: Detection → Containment → Eradication → Recovery

Key Tasks:
1. Detect encryption activity (T1486)
2. Isolate infected systems (T1490)
3. Identify ransomware variant
4. Block C2 communications (T1071)
5. Restore from backups
6. Document lessons learned
```

### Phishing Investigation

```
Phases: Detection → Analysis → Containment

Key Tasks:
1. Identify malicious email (T1566.001)
2. Extract IOCs from email
3. Search for similar emails
4. Quarantine affected users
5. Block sender domain
6. Report to users
```

### APT Detection

```
Phases: Detection → Analysis → Containment → Eradication

Key Tasks:
1. Detect lateral movement (T1021)
2. Identify compromised accounts (T1078)
3. Analyze persistence mechanisms (T1053)
4. Contain affected systems
5. Reset credentials
6. Deploy detection rules
```

## ATT&CK Coverage Analysis

### Viewing Coverage

After creating playbooks, analyze your coverage:

1. Use API endpoint: `POST /api/attack/coverage`
2. Provide list of techniques from all playbooks
3. Get coverage percentage by tactic

### Identifying Gaps

Red/missing areas indicate:
- Tactics without playbooks
- Techniques not covered
- Areas needing playbook development

## Advanced Features

### Exporting Playbooks

**As BPMN XML:**
1. Click "Export" in toolbar
2. Save `.bpmn` file
3. Import into other BPMN tools or SOAR platforms

**For Documentation:**
- BPMN can be rendered as diagrams in documentation
- Use bpmn.io viewer library

### Playbook Versioning

**Best Practices:**
- Use descriptive names with versions (e.g., `ransomware-v2`)
- Export backups before major changes
- Document changes in task notes

### Integration with SOAR

Compatible with SOAR platforms that support BPMN:
- Camunda
- Pega
- IBM Business Automation Workflow
- Custom Python execution engines

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save playbook |
| `Delete` | Remove selected element |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Space` | Hand tool (pan canvas) |

## Troubleshooting

### Backend Connection Failed

**Symptom**: Red "Disconnected" indicator

**Solutions:**
1. Check backend is running: `http://localhost:5000/api/health`
2. Verify Python dependencies installed
3. Check firewall/antivirus not blocking port 5000

### ATT&CK Data Not Loading

**Symptom**: "ATT&CK data not found" error

**Solution:**
```bash
cd backend
python scripts/download_attack_data.py
```

### Playbook Won't Save

**Symptom**: Save button doesn't respond

**Solutions:**
1. Enter a playbook name in the text field
2. Check for validation errors
3. Verify backend is running

### BPMN Canvas Not Rendering

**Solutions:**
1. Clear browser cache
2. Check console for JavaScript errors
3. Ensure all npm dependencies installed: `npm install`

## API Reference

### ATT&CK Endpoints

- `GET /api/attack/techniques` - List all techniques
- `GET /api/attack/techniques/{id}` - Get specific technique
- `GET /api/attack/tactics` - List all tactics
- `GET /api/attack/search?q={query}` - Search techniques
- `POST /api/attack/coverage` - Calculate coverage

### Playbook Endpoints

- `GET /api/playbooks/` - List all playbooks
- `GET /api/playbooks/{id}` - Get playbook
- `POST /api/playbooks/` - Save playbook
- `DELETE /api/playbooks/{id}` - Delete playbook

### Validation Endpoints

- `POST /api/validation/validate` - Validate BPMN XML
- `POST /api/validation/check-coverage` - Check IR phase coverage

## Best Practices

### Playbook Design

1. **Start Simple**: Begin with linear flows, add complexity later
2. **Name Clearly**: Use descriptive task names
3. **Map Techniques**: Every task should have ATT&CK mapping
4. **Assign Roles**: Specify who performs each task
5. **Document Tools**: List required platforms/tools
6. **Add Context**: Use notes for special instructions

### ATT&CK Mapping

1. **Be Specific**: Map to most specific technique/subtechnique
2. **Multiple Mappings**: Tasks can address multiple techniques
3. **Defensive Focus**: Map to techniques you're detecting/responding to
4. **Keep Updated**: Review mappings as ATT&CK evolves

### Validation

1. **Validate Early**: Check for errors as you build
2. **Address Warnings**: They indicate incomplete playbooks
3. **Test Flows**: Ensure all paths lead to end events
4. **Review Coverage**: Aim for broad ATT&CK coverage

## Support & Resources

- **Issues**: GitHub Issues
- **Documentation**: `/docs` directory
- **MITRE ATT&CK**: https://attack.mitre.org/
- **BPMN Reference**: https://www.bpmn.org/

