# User Guide

## Introduction

This guide walks you through using the BPMN-ATT&CK platform to create, manage, and execute incident response playbooks.

## Getting Started

### Accessing the Platform

1. Ensure backend is running: `http://localhost:5000`
2. Ensure frontend is running: `http://localhost:3000`
3. Open browser to `http://localhost:3000`
4. Verify "Connected" status in top-right corner

### Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│ BPMN Attack Playbooks           [Editor] [Incidents]  ● Connected │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Library] │      BPMN Canvas (Editor)      │ [Properties] │
│            │                                 │ [ATT&CK]     │
│            │                                 │              │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Creating Playbooks

### Step 1: Start a New Playbook

1. Click **"New"** button in toolbar
2. A fresh canvas appears with a start event
3. Enter a playbook name (e.g., "Phishing Investigation")

### Step 2: Design the Workflow

#### Adding Tasks
1. Click the **palette** on the left side of canvas
2. Drag **Task** element onto canvas
3. Double-click task to name it (e.g., "Analyze Reported Email")

#### Connecting Elements
1. Click a task
2. Click the small arrow icon that appears
3. Drag to next task to create sequence flow

#### Adding Gateways (Decisions)
1. Drag **Exclusive Gateway** (diamond) from palette
2. Use for yes/no decisions
3. Label outgoing flows (e.g., "Malicious" vs "Benign")

#### Common Elements
| Symbol | Type | Use Case |
|--------|------|----------|
| ⭕ | Start Event | Beginning of playbook |
| ⬜ | Task | Action to perform |
| ◇ | Gateway | Decision point |
| 🔘 | End Event | Completion of playbook |
| → | Sequence Flow | Order of execution |

#### Example Structure
```
(Start) → [Triage Alert] → <Malicious?> 
                              ├─ Yes → [Contain System] → [Investigate] → (End)
                              └─ No → [Document False Positive] → (End)
```

### Step 3: Configure Task Properties

1. Click on a task in the diagram
2. Switch to **"Properties"** tab in right panel
3. Fill in metadata:

**IR Phase**
- Preparation
- Detection
- Analysis
- Containment
- Eradication
- Recovery
- Post-Incident

**Role** (Who executes this task)
- SOC Analyst L1
- SOC Analyst L2
- Incident Responder
- Threat Hunter
- Forensics Specialist
- Security Engineer

**Priority**
- Low (informational)
- Medium (investigate when available)
- High (investigate today)
- Critical (drop everything)

**Other Fields**
- **Tool**: EDR, SIEM, Firewall, Wireshark, etc.
- **Estimated Time**: "15 minutes", "1 hour", etc.
- **Evidence Required**: What data is needed
- **Notes**: Instructions for analyst

4. Click **"Apply Changes"** to save

### Step 4: Map ATT&CK Techniques

1. With task still selected, switch to **"ATT&CK"** tab
2. Browse by tactic or search for techniques
3. Click techniques to select (they turn blue)
4. Switch back to **"Properties"** tab to see selected techniques
5. Click **"Apply Changes"** to save mapping

**Example Mapping:**
- Task: "Analyze Email"
- Techniques: T1566.001, T1566.002 (Phishing variants)
- Tactic: Initial Access

### Step 5: Save Playbook

1. Ensure playbook name is filled in toolbar
2. Click **"Save to Library"**
3. Confirmation appears
4. Playbook now visible in library

### Step 6: Validate & Export

**Validate:**
- Click **"Validate"** button
- Check for errors or warnings
- Fix issues (e.g., unconnected tasks, missing end events)

**Export:**
- Click **"Export"** button
- Downloads `.bpmn` XML file
- Can be shared, version controlled, or imported into SOAR platforms

---

## Part 2: Managing Playbooks

### Opening the Library

1. Click **"Open Library"** in header
2. Sidebar appears showing all saved playbooks
3. Each card shows:
   - Playbook name
   - Task count
   - ATT&CK technique count
   - Last modified date
   - File size

### Loading a Playbook

1. Click on a playbook card
2. Diagram loads in editor
3. Green indicator shows "✓ Loaded: [name]"
4. Can now edit and re-save

### Deleting a Playbook

1. Click **×** button on playbook card
2. Confirm deletion
3. Playbook removed from library

### Exporting from Library

1. Click **⬇** button on playbook card
2. Downloads `.bpmn` file
3. Same as export from editor

---

## Part 3: Executing Incidents

### Creating an Incident

1. Click **"Incidents"** in top navigation
2. Click **"Create New Incident"** button
3. Fill in incident details:
   - **Select Playbook**: Choose from dropdown
   - **Incident Title**: Brief description
   - **Description**: Detailed context
   - **Severity**: Low, Medium, High, Critical
   - **Assigned To**: Analyst name
   - **Incident Type**: Phishing, Malware, DDoS, etc.
   - **Affected Systems**: Hostnames, IPs, etc.

4. Click **"Create Incident"**
5. Incident appears in dashboard

### Incident Dashboard

**View Modes:**
- **All Incidents**: Complete list
- **Active**: In-progress incidents
- **Completed**: Closed incidents

**Card Information:**
```
┌────────────────────────────────┐
│ Suspicious Email - CEO         │
│ High Severity | Active         │
│ Phishing Investigation         │
│ Assigned: John Doe             │
│ Progress: [████░░░░░░] 40%     │
│ Created: 10/24/2025            │
└────────────────────────────────┘
```

### Executing Tasks

1. Click incident card to open execution view
2. Tasks are grouped by phase (Detection, Analysis, etc.)
3. Each task shows:
   - Status icon (○ Pending, ◐ In Progress, ● Completed)
   - Task name
   - Role, tool, priority
   - Estimated time
   - ATT&CK mappings

**Task Workflow:**
1. Click task to expand details
2. **Start Task:**
   - Click "Start Task" button
   - Status changes to "In Progress"
   - Timer starts

3. **Document Work:**
   - **Notes**: Observations and thoughts
   - **Findings**: Key discoveries
   - **Actions Taken**: What you did

4. **Save Progress:**
   - Click **"Save Changes"** button
   - Data persisted to database

5. **Complete Task:**
   - Click "Mark Complete"
   - Status changes to "Completed"
   - Progress bar updates
   - Next task auto-highlights

### Collecting Evidence

1. While in execution view, scroll to **"Evidence"** section
2. Click **"Add Evidence"** button
3. Fill in form:
   - **Title**: Brief name
   - **Type**: Note, Log, Screenshot, URL, File, IOC
   - **Description**: Context
   - **Content**: Paste log data, IOC, etc.
   - **Associated Task**: (optional) Link to specific task

4. Click **"Save Evidence"**
5. Evidence appears in timeline

### Timeline View

Shows chronological log of all actions:
```
● 10:15 AM - Incident Created
  John Doe created incident "Suspicious Email - CEO"

● 10:17 AM - Task Started
  John Doe started "Analyze Email"

● 10:25 AM - Evidence Added
  John Doe added evidence "Email Headers"

● 10:30 AM - Task Completed
  John Doe completed "Analyze Email"
```

### Completing an Incident

1. Complete all required tasks
2. Click **"Mark Incident Complete"** button
3. Incident status changes to "Completed"
4. Progress bar shows 100%
5. Incident moves to completed incidents list

---

## Part 4: Best Practices

### Playbook Design

**DO:**
- ✅ Use clear, action-oriented task names ("Analyze Email", not "Email Analysis")
- ✅ Include decision points with labeled flows
- ✅ Map ATT&CK techniques to relevant tasks
- ✅ Set realistic time estimates
- ✅ Specify required tools and evidence

**DON'T:**
- ❌ Create overly complex playbooks (keep under 20 tasks)
- ❌ Skip validation before saving
- ❌ Forget to add end events
- ❌ Leave tasks without role assignments

### Task Configuration

**Essential Fields:**
- Task Name (required)
- Role (who executes)
- Phase (when in IR lifecycle)
- Priority (urgency)

**Optional but Recommended:**
- Tool (what to use)
- Estimated Time (for planning)
- Notes (guidance for analyst)
- ATT&CK Mapping (threat context)

### ATT&CK Mapping

**Guidelines:**
- Map techniques that task is designed to detect/respond to
- Include both parent and sub-techniques when applicable
- Use search function for fast lookup
- Review descriptions to ensure correct mapping

**Example Mappings:**

| Task | Techniques |
|------|------------|
| Analyze Email | T1566.001, T1566.002 (Phishing) |
| Check for Persistence | T1547 (Boot/Logon Autostart) |
| Review Network Logs | T1071 (Application Layer Protocol) |
| Isolate System | (No ATT&CK mapping - defensive action) |

### Incident Execution

**Before Starting:**
- Read playbook completely
- Gather required tools
- Ensure access to systems
- Communicate with team

**During Execution:**
- Update task status promptly
- Document findings as you go
- Collect evidence immediately
- Don't skip steps

**After Completion:**
- Review timeline for accuracy
- Ensure all evidence is attached
- Mark incident as complete
- Conduct team debrief

---

## Part 5: Troubleshooting

### Backend Not Connected

**Symptom:** Red "Disconnected" indicator

**Solution:**
1. Check backend is running: `http://localhost:5000/api/health`
2. Restart backend: `python backend/main.py`
3. Check firewall isn't blocking port 5000

### Playbook Won't Load

**Symptom:** Error message when clicking playbook in library

**Solution:**
1. Check browser console (F12) for errors
2. Verify BPMN file is valid XML
3. Try exporting and re-importing playbook
4. Check backend logs for parsing errors

### ATT&CK Techniques Not Loading

**Symptom:** Empty ATT&CK panel

**Solution:**
1. Verify ATT&CK data is downloaded:
   ```bash
   python backend/scripts/download_attack_data.py
   ```
2. Check `backend/data/attack_data/` folder exists
3. Restart backend

### Can't Save Task Properties

**Symptom:** "Apply Changes" button doesn't work

**Solution:**
1. Ensure a task is selected (click task in diagram)
2. Check that modeler initialized (green loaded indicator)
3. Try clicking "Cancel" then re-entering data
4. Refresh browser and try again

### Python 3.13 Compatibility

**Symptom:** "Execution Engine: DISABLED" message

**Solution:**
- Use Python 3.11 or 3.12 (recommended)
- Or continue with editor/ATT&CK features only
- Incident tracking requires downgrading Python

---

## Part 6: Example Walkthrough

### Scenario: Phishing Incident Response

#### Step 1: Create the Playbook

1. Click **"New"**
2. Name: "Phishing Investigation"
3. Add tasks:
   - ⭕ Start
   - ⬜ Triage Report
   - ⬜ Analyze Email
   - ◇ Malicious?
   - ⬜ Contain (if malicious)
   - ⬜ Investigate Scope
   - ⬜ Notify Users
   - ⬜ Document Lessons Learned
   - 🔘 End

4. Connect with sequence flows

#### Step 2: Configure "Analyze Email" Task

**Properties:**
- Phase: Analysis
- Role: SOC Analyst L1
- Tool: Email Gateway, VirusTotal
- Priority: High
- Estimated Time: 30 minutes
- Notes: "Check headers, links, attachments. Use sandboxing if needed."

**ATT&CK:**
- T1566.001 (Spearphishing Attachment)
- T1566.002 (Spearphishing Link)

#### Step 3: Save and Validate

- Click **"Save to Library"**
- Click **"Validate"** → No errors

#### Step 4: Create Incident

1. Switch to **"Incidents"** view
2. Click **"Create New Incident"**
3. Fill in:
   - Playbook: Phishing Investigation
   - Title: "CEO Received Suspicious Email"
   - Severity: High
   - Assigned: Sarah Johnson

4. Click **"Create"**

#### Step 5: Execute

1. Click incident card
2. Expand "Analyze Email" task
3. Click **"Start Task"**
4. Document work:
   ```
   Notes: Email claims to be from IT requesting password reset.
   
   Findings: 
   - Sender: fake-it@company.co (not company.com)
   - Link redirects to credential harvesting site
   - Link visited by 3 other employees
   
   Actions Taken:
   - Blocked sender domain in email gateway
   - Quarantined email from all mailboxes
   - Reset passwords for 3 affected employees
   ```

5. Click **"Save Changes"**
6. Add evidence: Screenshot of email, email headers
7. Click **"Mark Complete"**
8. Continue with next tasks...

#### Step 6: Close Incident

- Complete all tasks
- Review timeline
- Mark incident complete
- Done! Total time: 2 hours 15 minutes

---

## Part 7: Keyboard Shortcuts

### BPMN Editor
- `Ctrl+S` - Save playbook
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Space+Drag` - Pan canvas
- `Mouse Wheel` - Zoom

### General
- `F12` - Open browser developer tools (for debugging)
- `Ctrl+R` - Refresh page

---

## Support

For issues not covered in this guide:
1. Check browser console for errors (F12)
2. Review backend logs
3. Consult architecture documentation in `docs/`
4. Contact: mtrigui@hawk.iit.edu or zansari1@hawk.iit.edu
