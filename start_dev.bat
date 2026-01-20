@echo off
echo Starting Soil Productivity Prediction Application...
echo.

REM Start backend in a new window
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && start_backend.bat"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
cd /d %~dp0
call npm run dev

pause
