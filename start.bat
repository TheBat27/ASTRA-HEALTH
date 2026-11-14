@echo off
title ASTRA HEALTH - Iniciando...
echo.
echo  ============================================
echo   ASTRA HEALTH - NASA Space Apps 2026
echo   Sistema de Monitorización de Salud
echo  ============================================
echo.
cd /d "%~dp0frontend"
echo  Iniciando servidor de desarrollo...
echo  La aplicación abrirá en: http://localhost:5173
echo.
npm run dev
pause
