@echo off
echo ====================================
echo Starting BPMN Attack Playbooks Backend
echo ====================================
echo.

cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -q -r requirements.txt

if not exist data\attack_data\enterprise-attack.json (
    echo.
    echo Downloading MITRE ATT^&CK data...
    python scripts\download_attack_data.py
)

echo.
echo ====================================
echo Starting Flask server on port 5000...
echo ====================================
echo.
python main.py

