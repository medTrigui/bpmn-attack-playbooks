#!/bin/bash

echo "===================================="
echo "Starting BPMN Attack Playbooks Backend"
echo "===================================="
echo ""

cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

if [ ! -f "data/attack_data/enterprise-attack.json" ]; then
    echo ""
    echo "Downloading MITRE ATT&CK data..."
    python scripts/download_attack_data.py
fi

echo ""
echo "===================================="
echo "Starting Flask server on port 5000..."
echo "===================================="
echo ""
python main.py

