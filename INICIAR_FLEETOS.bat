@echo off
title FleetOS - Iniciando sistema...
color 0A

echo.
echo  ========================================
echo    FLEETOS - Sistema de Transporte
echo  ========================================
echo.

echo  [1/3] Iniciando MongoDB...
start "MongoDB" cmd /k ""C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db""
timeout /t 3 /nobreak > nul

echo  [2/3] Iniciando Backend...
start "FleetOS Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 4 /nobreak > nul

echo  [3/3] Iniciando Frontend...
start "FleetOS Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo  ========================================
echo    Usuario: admin@fleetos.com
echo    Contrasena: admin123
echo  ========================================
echo.
echo  NO CIERRES ESTA VENTANA
pause