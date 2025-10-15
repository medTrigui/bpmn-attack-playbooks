@echo off
echo ====================================
echo Starting BPMN Attack Playbooks Frontend
echo ====================================
echo.

cd frontend

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo.
echo ====================================
echo Starting React dev server...
echo ====================================
echo.
call npm start

