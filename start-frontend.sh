#!/bin/bash

echo "===================================="
echo "Starting BPMN Attack Playbooks Frontend"
echo "===================================="
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "===================================="
echo "Starting React dev server..."
echo "===================================="
echo ""
npm start

