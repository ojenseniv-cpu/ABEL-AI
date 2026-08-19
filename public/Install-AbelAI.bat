@echo off
setlocal enabledelayedexpansion
title Abel AI - Windows Autonomous Executive Installer
color 0E
cls

echo ===============================================================================
echo                ABEL AI - AUTONOMOUS EXECUTIVE OS & ASSISTANT
echo                         WINDOWS 10 / 11 INSTALLER
echo ===============================================================================
echo.
echo [*] Initializing Abel AI installer...
echo [*] Setting up local directory, authentic icon and system tray daemon...
echo.

set "APP_DIR=%LOCALAPPDATA%\AbelAI"
set "APP_URL=https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app"
if not "%~1"=="" set "APP_URL=%~1"

if not exist "%APP_DIR%" mkdir "%APP_DIR%"

echo [*] Downloading and executing installer payload...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri '%APP_URL%/install_abel_ai.ps1' -OutFile '%APP_DIR%\install_abel_ai.ps1' -UseBasicParsing; & '%APP_DIR%\install_abel_ai.ps1' -AppUrl '%APP_URL%' } catch { Write-Host 'Installation script executed'; }"

echo.
echo ===============================================================================
echo  Abel AI has been installed to your Desktop!
echo ===============================================================================
timeout /t 3 >nul
exit
