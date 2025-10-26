# Installation & Setup Guide

## Prerequisites

### Required Software

- **Python**: 3.8+ (3.11 or 3.12 recommended, avoid 3.13 due to SQLAlchemy compatibility)
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher (comes with Node.js)
- **Git**: For cloning the repository

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 500 MB for application, 50 MB for ATT&CK data
- **Browser**: Chrome 90+, Firefox 88+, or Edge 90+

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bpmn-attack-playbooks.git
cd bpmn-attack-playbooks
```

### 2. Backend Setup

#### Create Virtual Environment

**Windows:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed Flask-3.1.0 Flask-CORS-5.0.0 ...
```

#### Download MITRE ATT&CK Data

```bash
python scripts/download_attack_data.py
```

**Expected output:**
```
Downloading MITRE ATT&CK data...
✓ Downloaded enterprise-attack.json (17.8 MB)
✓ Downloaded mobile-attack.json (2.8 MB)
✓ Downloaded ics-attack.json (1.5 MB)
ATT&CK data ready!
```

#### Initialize Database

```bash
python main.py
```

**Expected output:**
```
Detected Python 3.11.5
✓ Database initialized successfully
✓ Execution Engine: ENABLED

 * Running on http://127.0.0.1:5000
```

**Keep this terminal running.**

### 3. Frontend Setup

Open a **new terminal** window:

**Windows:**
```powershell
cd frontend
npm install
npm start
```

**macOS/Linux:**
```bash
cd frontend
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
Local:            http://localhost:3000
```

Browser should automatically open to `http://localhost:3000`.

---

## Verification

### 1. Check Backend Health

Open browser to: `http://localhost:5000/api/health`

**Expected response:**
```json
{
  "status": "healthy",
  "database_available": true,
  "execution_engine": "enabled",
  "endpoints": {
    "attack": "/api/attack",
    "playbooks": "/api/playbooks",
    "incidents": "/api/incidents",
    "validation": "/api/validation"
  }
}
```

### 2. Check Frontend

Navigate to: `http://localhost:3000`

**Expected:**
- App loads with "BPMN Attack Playbooks" header
- Status indicator shows "Connected" (green)
- Can click "Playbook Editor" and see BPMN canvas

### 3. Test ATT&CK Integration

1. Click "Playbook Editor"
2. Create a new task (drag from palette)
3. Click task, switch to "ATT&CK" tab
4. Should see list of tactics

**If tactics don't appear**, ATT&CK data may not be loaded correctly.

---

## Troubleshooting

### Backend Won't Start

**Error: "No module named 'flask'"**
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
```

**Error: "Port 5000 is already in use"**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

**Error: "Execution Engine: DISABLED"**
- You're using Python 3.13
- Solution: Use Python 3.11 or 3.12, or continue without incident tracking

### Frontend Won't Start

**Error: "npm: command not found"**
```bash
# Install Node.js from https://nodejs.org/
# Verify installation:
node --version
npm --version
```

**Error: "Port 3000 is already in use"**
```bash
# Option 1: Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
# Edit package.json:
"start": "PORT=3001 react-scripts start"
```

**Error: "Module not found: Can't resolve 'bpmn-js'"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### ATT&CK Data Not Loading

```bash
cd backend
python scripts/download_attack_data.py

# Verify files exist:
# Windows: dir data\attack_data
# macOS/Linux: ls -lh data/attack_data/
```

### Database Errors

**Reset database (development only):**
```bash
cd backend
python reset_database.py
# Type "yes" to confirm
```

---

## Development Setup

### Recommended IDE

**Visual Studio Code** with extensions:
- Python (Microsoft)
- ESLint
- Prettier
- BPMN Editor (for .bpmn files)

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=sqlite:///data/bpmn_playbooks.db
FLASK_ENV=development
FLASK_DEBUG=True
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running Tests

**Backend:**
```bash
cd backend
pytest  # (when tests are available)
```

**Frontend:**
```bash
cd frontend
npm test
```

---

## Production Deployment

### Backend (Docker)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "main:app"]
```

```bash
docker build -t bpmn-backend .
docker run -p 5000:5000 bpmn-backend
```

### Frontend (Static Build)

```bash
cd frontend
npm run build
# Serve 'build/' directory with Nginx or similar
```

### PostgreSQL Migration

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE bpmn_playbooks;
   ```
3. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/bpmn_playbooks
   ```
4. Run migrations:
   ```bash
   python main.py  # Auto-creates tables
   ```

---

## Updating the Application

### Pull Latest Changes

```bash
git pull origin main
```

### Update Backend Dependencies

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
pip install -r requirements.txt --upgrade
```

### Update Frontend Dependencies

```bash
cd frontend
npm install
```

### Update ATT&CK Data

```bash
cd backend
python scripts/download_attack_data.py
```

---

## Uninstallation

### Remove Application

```bash
cd ..
rm -rf bpmn-attack-playbooks/
```

### Remove Node Modules (to free space)

```bash
cd frontend
rm -rf node_modules/
```

### Remove Python Virtual Environment

```bash
cd backend
rm -rf venv/
```

---

## Next Steps

After installation:

1. **Read the User Guide**: [`docs/user-guide.md`](docs/user-guide.md)
2. **Explore Examples**: Check `playbook-examples/` folder
3. **Create Your First Playbook**: Follow tutorial in user guide
4. **Run an Incident**: Execute a sample playbook

---

## Support

### Documentation

- **User Guide**: [`docs/user-guide.md`](docs/user-guide.md)
- **Architecture**: [`docs/backend-architecture.md`](docs/backend-architecture.md), [`docs/frontend-architecture.md`](docs/frontend-architecture.md)
- **ATT&CK Integration**: [`docs/attack-integration.md`](docs/attack-integration.md)
- **Research Context**: [`docs/research-context.md`](docs/research-context.md)

### Contact

- **Email**: mtrigui@hawk.iit.edu, zansari1@hawk.iit.edu
- **GitHub Issues**: (once repository is public)

### Community

- **Discord**: (to be set up)
- **Mailing List**: (to be set up)

---

**Installation should take approximately 15-20 minutes.**  
**Welcome to BPMN-ATT&CK Incident Response Playbooks!** 🎉

