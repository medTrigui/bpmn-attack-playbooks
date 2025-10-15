# 🚀 Quick Start Guide

## For Week 1-2 MVP Testing

### Step 1: Start Backend (2 minutes)

**Windows:**
```bash
start-backend.bat
```

**Linux/Mac:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**What it does:**
- Creates Python virtual environment
- Installs dependencies
- Downloads MITRE ATT&CK data (~50MB)
- Starts Flask server on port 5000

**Success**: You'll see `Running on http://0.0.0.0:5000`

---

### Step 2: Start Frontend (2 minutes)

Open **NEW terminal** (keep backend running):

**Windows:**
```bash
start-frontend.bat
```

**Linux/Mac:**
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

**What it does:**
- Installs Node dependencies (~200MB, first time only)
- Starts React dev server
- Opens browser automatically

**Success**: Browser opens to `http://localhost:3000` with green "Connected" status

---

### Step 3: Explore (5 minutes)

#### Load Example Playbook
1. Click **"Open Library"** (top right)
2. Click **"ransomware-response"**
3. See complete ransomware response workflow

#### Examine ATT&CK Mappings
1. Click any task in the diagram
2. Right panel shows task properties
3. Scroll down to see ATT&CK techniques

#### Browse ATT&CK Framework
1. Click **"ATT&CK"** tab (right panel)
2. Click a tactic (e.g., "Initial Access")
3. Browse techniques
4. Try searching: "ransomware" or "phishing"

#### Create Your Own Task
1. Click **"New Playbook"** (top right)
2. Enter name: "test-playbook"
3. Drag task from left palette
4. Double-click to name it
5. Select task → Add ATT&CK mapping
6. Click **"Save"**

---

## Quick Troubleshooting

### Backend won't start
```bash
cd backend
python --version  # Must be 3.8+
pip install -r requirements.txt
python main.py
```

### Frontend won't start
```bash
cd frontend
node --version  # Must be 16+
npm install
npm start
```

### "ATT&CK data not found"
```bash
cd backend
python scripts/download_attack_data.py
```

### Port already in use
**Backend (5000)**: Change port in `backend/main.py` line 29
**Frontend (3000)**: React will prompt to use different port - press Y

---

## What You Can Do Now

✅ Create IR playbooks visually  
✅ Map tasks to ATT&CK techniques  
✅ Browse 600+ ATT&CK techniques  
✅ Validate playbook structure  
✅ Export as BPMN XML  
✅ Save and load playbooks  

---

## Key Files to Review

📄 **README.md** - Project overview  
📄 **SETUP.md** - Detailed setup guide  
📄 **docs/user-guide.md** - Complete user manual  
📄 **docs/metamodel.md** - Technical specification  
📄 **WEEK1-2-COMPLETE.md** - What we built  

---

## API Testing

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Get ATT&CK Techniques:**
```bash
curl http://localhost:5000/api/attack/techniques?parent_only=true
```

**Search Techniques:**
```bash
curl http://localhost:5000/api/attack/search?q=ransomware
```

**List Playbooks:**
```bash
curl http://localhost:5000/api/playbooks/
```

---

## Project Structure at a Glance

```
bpmn-attack-playbooks/
├── backend/              ← Flask API (Python)
│   ├── api/             ← Endpoints (attack, playbooks, validation)
│   ├── scripts/         ← Setup scripts
│   └── main.py          ← Start here
│
├── frontend/             ← React App
│   └── src/
│       ├── components/  ← UI components
│       └── services/    ← API calls
│
├── playbook-examples/    ← Sample BPMN files
├── docs/                 ← Documentation
└── start-*.sh/.bat      ← Quick startup scripts
```

---

## Next Phase Preview

**Week 3-4 Goals:**
- Execution engine (run playbooks during incidents)
- Evidence collection tracking
- Timeline visualization
- Incident dashboard

---

## Support

🐛 **Issues**: Check SETUP.md troubleshooting section  
📚 **Documentation**: See docs/ folder  
🔍 **API Reference**: docs/user-guide.md → API Reference section  

---

**Estimated Time to Full Setup**: 5-10 minutes  
**Estimated Time to Create First Playbook**: 15 minutes  

🎉 **You're ready to go!**

