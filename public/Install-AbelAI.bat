@echo off
setlocal enabledelayedexpansion
title Abel AI - Windows Autonomous Executive OS Installer
color 0E

echo ===============================================================================
echo                ABEL AI - AUTONOMOUS EXECUTIVE OS & ASSISTANT
echo                         WINDOWS 10 / 11 INSTALLER
echo ===============================================================================
echo.
echo [*] Initializing Abel AI installer...
echo [*] Setting up local daemon & desktop integration...
echo.

:: Define Installation Paths (No Admin Rights Needed)
set "APP_DIR=%LOCALAPPDATA%\AbelAI"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "STARTMENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Abel AI"
set "APP_URL=https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app"

:: If running locally or custom URL provided via parameter
if not "%~1"=="" set "APP_URL=%~1"

echo [*] Target Directory: %APP_DIR%
echo [*] Application Endpoint: %APP_URL%
echo.

:: 1. Create Target Directories
if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%STARTMENU_DIR%" mkdir "%STARTMENU_DIR%"

:: 2. Download and set Abel AI Desktop Icon
echo [*] Downloading high-resolution Gold & Black Abel AI Desktop Icon...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri '%APP_URL%/abel_icon.svg' -OutFile '%APP_DIR%\abel_icon.svg' -UseBasicParsing; Copy-Item '%APP_DIR%\abel_icon.svg' '%APP_DIR%\abel_icon.ico' -Force } catch { Write-Host 'Using default app icon' }"

:: 3. Create Launcher PowerShell Daemon Script
echo [*] Generating Abel AI background daemon and desktop shortcut with custom icon...
(
echo # Abel AI Windows Daemon Script
echo $appUrl = "%APP_URL%"
echo $shortcutName = "Abel AI"
echo.
echo # Create Desktop Shortcut with Windows Script Host
echo $wsh = New-Object -ComObject WScript.Shell
echo $desktopPath = [System.Environment]::GetFolderPath('Desktop'^^^)
echo $shortcut = $wsh.CreateShortcut^("$desktopPath\$shortcutName.lnk"^^^)
echo.
echo # Find Chrome or Edge for standalone app mode
echo $edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
echo $chromePath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
echo $iconPath = "%APP_DIR%\abel_icon.ico"
echo.
echo if ^(Test-Path $iconPath^^) {
echo     $shortcut.IconLocation = "$iconPath, 0"
echo }
echo.
echo if ^(Test-Path $edgePath^^) {
echo     $shortcut.TargetPath = $edgePath
echo     $shortcut.Arguments = "--app=$appUrl --window-size=1400,900"
echo     $shortcut.Description = "Abel AI - Autonomous Executive OS"
echo } elseif ^(Test-Path $chromePath^^) {
echo     $shortcut.TargetPath = $chromePath
echo     $shortcut.Arguments = "--app=$appUrl --window-size=1400,900"
echo     $shortcut.Description = "Abel AI - Autonomous Executive OS"
echo } else {
echo     $shortcut.TargetPath = $appUrl
echo }
echo $shortcut.Save^(^^)
echo Write-Host "[+] Desktop Shortcut Created with Custom Gold Abel Icon!" -ForegroundColor Green
) > "%APP_DIR%\setup_shortcuts.ps1"

:: 4. Execute Shortcut Creation via PowerShell
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%APP_DIR%\setup_shortcuts.ps1"

:: 4. Create Standalone Windows Executable Batch Launcher
echo [*] Creating Abel AI standalone runner: %APP_DIR%\Launch-AbelAI.bat
(
echo @echo off
echo title Abel AI
echo start "" "%APP_URL%"
) > "%APP_DIR%\Launch-AbelAI.bat"

:: 5. Create Start Menu Shortcut
(
echo [InternetShortcut]
echo URL=%APP_URL%
echo IconIndex=0
) > "%STARTMENU_DIR%\Abel AI.url"

echo.
echo ===============================================================================
echo                INSTALLATION COMPLETED SUCCESSFULLY!
echo ===============================================================================
echo.
echo  [+] Desktop Shortcut: "%DESKTOP_DIR%\Abel AI.lnk"
echo  [+] Start Menu: "%STARTMENU_DIR%\Abel AI.url"
echo  [+] Application Folder: "%APP_DIR%"
echo.
echo  Wake Word: "hey abel"
echo  Voice HUD Hotkey: [Space] or [Ctrl+Space]
echo.
set /p LAUNCH="Would you like to launch Abel AI now? (Y/N): "
if /i "%LAUNCH%"=="Y" (
    echo [*] Launching Abel AI...
    start "" "%APP_URL%"
)

echo.
echo Press any key to exit this installer...
pause >nul
