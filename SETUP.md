# Setup Guide

## Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git** (already initialized)

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Download MITRE ATT&CK data
python scripts/download_attack_data.py

# Start backend server
python main.py
```

**Verify**: Open http://localhost:5000/api/health in your browser. You should see:
```json
{
  "status": "healthy",
  "endpoints": {...}
}
```

### 2. Frontend Setup (5 minutes)

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start development server
npm start
```

**Verify**: Browser should automatically open to http://localhost:3000

You should see the BPMN Attack Playbooks interface with:
- ✓ Green "Connected" status indicator
- BPMN editor canvas
- Side panels for properties and ATT&CK

### 3. Test the Application

1. Click **"Open Library"** - you should see example playbooks:
   - `ransomware-response`
   - `phishing-investigation`

2. Click on `ransomware-response` to load it

3. Click on any task in the diagram - the right panel should show:
   - Task properties (role, tool, phase)
   - ATT&CK mappings

4. Try the **ATT&CK** tab:
   - Browse tactics
   - Click a tactic to see techniques
   - Search for techniques (e.g., "ransomware")

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'flask'`
```bash
# Make sure venv is activated
pip install -r requirements.txt
```

**Issue**: ATT&CK data not found
```bash
python scripts/download_attack_data.py
```

**Issue**: Port 5000 already in use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/main.py:
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Frontend Issues

**Issue**: `npm ERR! code ENOENT`
```bash
npm install
```

**Issue**: Port 3000 already in use
```bash
# React will ask if you want to use a different port
# Press 'Y' to accept
```

**Issue**: Backend connection failed
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `http://localhost:5000/api/health` is accessible

## Development Workflow

### Daily Startup

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### Making Changes

**Backend (Python):**
- Edit files in `backend/api/`
- Flask auto-reloads on save
- Check terminal for errors

**Frontend (React):**
- Edit files in `frontend/src/`
- Browser auto-reloads on save
- Check browser console for errors

## Project Structure

```
bpmn-attack-playbooks/
├── backend/                    # Flask API
│   ├── api/                   # API endpoints
│   │   ├── attack.py         # ATT&CK endpoints
│   │   ├── playbooks.py      # Playbook CRUD
│   │   └── validation.py     # Validation logic
│   ├── data/                  
│   │   └── attack_data/      # MITRE ATT&CK JSON files
│   ├── scripts/
│   │   └── download_attack_data.py
│   ├── requirements.txt
│   └── main.py               # Flask app entry point
│
├── frontend/                   # React app
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── BPMNEditor.jsx
│   │   │   ├── ATTACKPanel.jsx
│   │   │   ├── TaskPropertiesPanel.jsx
│   │   │   └── PlaybookLibrary.jsx
│   │   ├── services/
│   │   │   └── apiService.js  # API calls
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── playbook-examples/          # Sample BPMN playbooks
├── docs/                       # Documentation
└── README.md
```

## Next Steps

1. **Explore Example Playbooks**: Load and examine the sample playbooks
2. **Create Your First Playbook**: Use "New Playbook" to create a simple IR workflow
3. **Map ATT&CK Techniques**: Practice associating tasks with techniques
4. **Read Documentation**: Check `docs/user-guide.md` for detailed instructions
5. **Review Metamodel**: See `docs/metamodel.md` for technical details

## Production Deployment

For production deployment:

1. **Backend**: Use gunicorn or uwsgi instead of Flask dev server
2. **Frontend**: Build production bundle: `npm run build`
3. **Database**: Replace file storage with PostgreSQL
4. **Security**: Add authentication, HTTPS, rate limiting
5. **Hosting**: Deploy to cloud platform (AWS, Azure, GCP)

See deployment guides in `docs/` for detailed instructions.

## Support

- **Issues**: Create GitHub issue
- **Questions**: Check `docs/user-guide.md`
- **Research Context**: See paper summary in README

