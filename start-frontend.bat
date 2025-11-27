@echo off
echo ====================================
echo Starting BPMN Attack Playbooks Frontend
echo ====================================
echo.

setlocal
set "PATH=C:\Program Files\nodejs;%PATH%"

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

endlocal

