@echo off
title BK Multiplayer Launcher

echo Starting server...

cd /d C:\Users\pawel\Desktop\VScode\BKServer
start cmd /k "node server.js"

timeout /t 2 >nul

echo Starting ngrok...

start cmd /k "ngrok http 8080"

echo Done.
pause
