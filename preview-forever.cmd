@echo off
cd /d "c:\Users\alous\CRADES VS\CRADES"
:loop
echo [%date% %time%] starting preview...>> preview-forever.log
npm run preview >> preview-forever.log 2>&1
echo [%date% %time%] preview exited, restarting in 2s...>> preview-forever.log
timeout /t 2 /nobreak >nul
goto loop
