import fs from 'fs';
import path from 'path';

const icoPath = path.join(process.cwd(), 'public', 'abel_icon.ico');
const icoBase64 = fs.readFileSync(icoPath).toString('base64');

// Generate 100% self-contained Windows batch installer (Install-AbelAI.bat)
const batContent = `@echo off
setlocal enabledelayedexpansion
title Abel AI - Windows Autonomous Executive Setup
color 0E
cls

echo ===============================================================================
echo                ABEL AI - AUTONOMOUS EXECUTIVE OS & ASSISTANT
echo                     OFFLINE SELF-CONTAINED WINDOWS INSTALLER
echo ===============================================================================
echo.
echo [*] Initializing Abel AI standalone workspace...

set "APP_DIR=%LOCALAPPDATA%\\AbelAI"
set "START_DIR=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Abel AI"
set "DESKTOP_DIR=%USERPROFILE%\\Desktop"
set "ICON_FILE=%APP_DIR%\\abel_icon.ico"
set "APP_URL=https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app"
if not "%~1"=="" set "APP_URL=%~1"

if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%START_DIR%" mkdir "%START_DIR%"

echo [*] Extracting embedded Gold Abel AI Desktop Icon (Native Base64)...
(
echo -----BEGIN CERTIFICATE-----
${splitBase64Lines(icoBase64)}
echo -----END CERTIFICATE-----
) > "%APP_DIR%\\icon.b64"

certutil -decode -f "%APP_DIR%\\icon.b64" "%ICON_FILE%" >nul 2>&1
del "%APP_DIR%\\icon.b64" >nul 2>&1

echo [*] Registering native Windows desktop and start menu shortcuts...
(
echo Set ws = CreateObject("WScript.Shell"^)
echo strDesktop = ws.SpecialFolders("Desktop"^)
echo strStartMenu = ws.SpecialFolders("Programs"^) ^& "\\Abel AI"
echo.
echo edge64 = ws.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"^)
echo edge32 = ws.ExpandEnvironmentStrings("%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"^)
echo chrome = ws.ExpandEnvironmentStrings("%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"^)
echo chromeUser = ws.ExpandEnvironmentStrings("%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"^)
echo.
echo Set fso = CreateObject("Scripting.FileSystemObject"^)
echo targetExe = "msedge.exe"
echo If fso.FileExists(edge64) Then
echo     targetExe = edge64
echo ElseIf fso.FileExists(edge32) Then
echo     targetExe = edge32
echo ElseIf fso.FileExists(chrome) Then
echo     targetExe = chrome
echo ElseIf fso.FileExists(chromeUser) Then
echo     targetExe = chromeUser
echo End If
echo.
echo ' 1. Create Desktop Shortcut
echo Set scDesktop = ws.CreateShortcut(strDesktop ^& "\\Abel AI.lnk"^)
echo scDesktop.TargetPath = targetExe
echo scDesktop.Arguments = "--app=%APP_URL% --window-size=1440,900 --disable-features=Translate --app-id=AbelAI"
echo scDesktop.Description = "Abel AI - Autonomous Executive Operating System"
echo scDesktop.WorkingDirectory = "%APP_DIR%"
echo If fso.FileExists("%ICON_FILE%"^) Then
echo     scDesktop.IconLocation = "%ICON_FILE%, 0"
echo End If
echo scDesktop.Save
echo.
echo ' 2. Create Start Menu Shortcut
echo Set scStart = ws.CreateShortcut(strStartMenu ^& "\\Abel AI.lnk"^)
echo scStart.TargetPath = targetExe
echo scStart.Arguments = "--app=%APP_URL% --window-size=1440,900 --disable-features=Translate --app-id=AbelAI"
echo scStart.Description = "Abel AI - Autonomous Executive Operating System"
echo scStart.WorkingDirectory = "%APP_DIR%"
echo If fso.FileExists("%ICON_FILE%"^) Then
echo     scStart.IconLocation = "%ICON_FILE%, 0"
echo End If
echo scStart.Save
) > "%APP_DIR%\\create_shortcuts.vbs"

cscript //nologo "%APP_DIR%\\create_shortcuts.vbs"
del "%APP_DIR%\\create_shortcuts.vbs" >nul 2>&1

echo [*] Refreshing Windows Desktop icon cache...
ie4uinit.exe -show >nul 2>&1

echo [*] Creating System Tray Background Launcher...
(
echo Add-Type -AssemblyName System.Windows.Forms
echo Add-Type -AssemblyName System.Drawing
echo.
echo \$notify = New-Object System.Windows.Forms.NotifyIcon
echo \$iconPath = "%ICON_FILE%"
echo if (Test-Path \$iconPath) {
echo     \$notify.Icon = New-Object System.Drawing.Icon \$iconPath
echo } else {
echo     \$notify.Icon = [System.Drawing.SystemIcons]::Application
echo }
echo \$notify.Text = "Abel AI Executive OS"
echo \$notify.Visible = \$true
echo.
echo \$menu = New-Object System.Windows.Forms.ContextMenuStrip
echo \$itemOpen = \$menu.Items.Add("⚡ Open Abel AI"^)
echo \$itemOpen.add_Click({ Start-Process "msedge.exe" "--app=%APP_URL% --window-size=1440,900" }^)
echo \$itemExit = \$menu.Items.Add("❌ Exit Abel AI"^)
echo \$itemExit.add_Click({ \$notify.Visible = \$false; \$notify.Dispose(^); [System.Windows.Forms.Application]::Exit(^) }^)
echo.
echo \$notify.ContextMenuStrip = \$menu
echo \$notify.add_DoubleClick({ Start-Process "msedge.exe" "--app=%APP_URL% --window-size=1440,900" }^)
echo \$notify.ShowBalloonTip(3000, "Abel AI Active", "Abel AI is active in your system tray.", [System.Windows.Forms.ToolTipIcon]::Info)
echo [System.Windows.Forms.Application]::Run(^)
) > "%APP_DIR%\\AbelTrayDaemon.ps1"

(
echo Set ws = CreateObject("WScript.Shell"^)
echo ws.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""%APP_DIR%\\AbelTrayDaemon.ps1""", 0, False
) > "%APP_DIR%\\LaunchTray.vbs"

echo [*] Starting background tray daemon...
start "" wscript.exe "%APP_DIR%\\LaunchTray.vbs"

echo [*] Launching Abel AI standalone application...
start "" msedge.exe --app=%APP_URL% --window-size=1440,900 --disable-features=Translate --app-id=AbelAI

echo.
echo ===============================================================================
echo  SUCCESS: Abel AI is now installed on your Windows Desktop!
echo.
echo  - Desktop Icon: %USERPROFILE%\\Desktop\\Abel AI.lnk
echo  - Start Menu:   Start -^> Abel AI
echo  - System Tray:  Running in taskbar next to clock
echo ===============================================================================
timeout /t 3 >nul
exit
`;

function splitBase64Lines(str) {
  const chunks = [];
  for (let i = 0; i < str.length; i += 64) {
    chunks.push(str.substring(i, i + 64));
  }
  return chunks.join('\r\n');
}

fs.writeFileSync(path.join(process.cwd(), 'public', 'Install-AbelAI.bat'), batContent);
console.log('Successfully generated self-contained Install-AbelAI.bat with embedded base64 icon!');
