@echo off
echo Starting Astra Gov AI...

:: Start Python RAG backend in a new terminal window
start "Astra Backend (Port 8000)" cmd /k "cd /d P:\Astra-Gov-AI\backend && %LOCALAPPDATA%\Programs\Python\Python313\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"

:: Start Next.js frontend in a new terminal window
start "Astra Frontend (Port 3000)" cmd /k "cd /d P:\Astra-Gov-AI && npm run dev"

echo Both servers are starting in separate windows!
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:3000