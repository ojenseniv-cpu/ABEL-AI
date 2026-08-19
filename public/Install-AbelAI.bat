@echo off
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

set "APP_DIR=%LOCALAPPDATA%\AbelAI"
set "START_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Abel AI"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "ICON_FILE=%APP_DIR%\abel_icon.ico"
set "APP_URL=https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app"
if not "%~1"=="" set "APP_URL=%~1"

if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%START_DIR%" mkdir "%START_DIR%"

echo [*] Extracting embedded Gold Abel AI Desktop Icon (Native Base64)...
(
echo -----BEGIN CERTIFICATE-----
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
echo -----END CERTIFICATE-----
) > "%APP_DIR%\icon.b64"

certutil -decode -f "%APP_DIR%\icon.b64" "%ICON_FILE%" >nul 2>&1
del "%APP_DIR%\icon.b64" >nul 2>&1

echo [*] Registering native Windows desktop and start menu shortcuts...
(
echo Set ws = CreateObject("WScript.Shell"^)
echo strDesktop = ws.SpecialFolders("Desktop"^)
echo strStartMenu = ws.SpecialFolders("Programs"^) ^& "\Abel AI"
echo.
echo edge64 = ws.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"^)
echo edge32 = ws.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"^)
echo chrome = ws.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe"^)
echo chromeUser = ws.ExpandEnvironmentStrings("%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"^)
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
echo Set scDesktop = ws.CreateShortcut(strDesktop ^& "\Abel AI.lnk"^)
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
echo Set scStart = ws.CreateShortcut(strStartMenu ^& "\Abel AI.lnk"^)
echo scStart.TargetPath = targetExe
echo scStart.Arguments = "--app=%APP_URL% --window-size=1440,900 --disable-features=Translate --app-id=AbelAI"
echo scStart.Description = "Abel AI - Autonomous Executive Operating System"
echo scStart.WorkingDirectory = "%APP_DIR%"
echo If fso.FileExists("%ICON_FILE%"^) Then
echo     scStart.IconLocation = "%ICON_FILE%, 0"
echo End If
echo scStart.Save
) > "%APP_DIR%\create_shortcuts.vbs"

cscript //nologo "%APP_DIR%\create_shortcuts.vbs"
del "%APP_DIR%\create_shortcuts.vbs" >nul 2>&1

echo [*] Refreshing Windows Desktop icon cache...
ie4uinit.exe -show >nul 2>&1

echo [*] Creating System Tray Background Launcher...
(
echo Add-Type -AssemblyName System.Windows.Forms
echo Add-Type -AssemblyName System.Drawing
echo.
echo $notify = New-Object System.Windows.Forms.NotifyIcon
echo $iconPath = "%ICON_FILE%"
echo if (Test-Path $iconPath) {
echo     $notify.Icon = New-Object System.Drawing.Icon $iconPath
echo } else {
echo     $notify.Icon = [System.Drawing.SystemIcons]::Application
echo }
echo $notify.Text = "Abel AI Executive OS"
echo $notify.Visible = $true
echo.
echo $menu = New-Object System.Windows.Forms.ContextMenuStrip
echo $itemOpen = $menu.Items.Add("⚡ Open Abel AI"^)
echo $itemOpen.add_Click({ Start-Process "msedge.exe" "--app=%APP_URL% --window-size=1440,900" }^)
echo $itemExit = $menu.Items.Add("❌ Exit Abel AI"^)
echo $itemExit.add_Click({ $notify.Visible = $false; $notify.Dispose(^); [System.Windows.Forms.Application]::Exit(^) }^)
echo.
echo $notify.ContextMenuStrip = $menu
echo $notify.add_DoubleClick({ Start-Process "msedge.exe" "--app=%APP_URL% --window-size=1440,900" }^)
echo $notify.ShowBalloonTip(3000, "Abel AI Active", "Abel AI is active in your system tray.", [System.Windows.Forms.ToolTipIcon]::Info)
echo [System.Windows.Forms.Application]::Run(^)
) > "%APP_DIR%\AbelTrayDaemon.ps1"

(
echo Set ws = CreateObject("WScript.Shell"^)
echo ws.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""%APP_DIR%\AbelTrayDaemon.ps1""", 0, False
) > "%APP_DIR%\LaunchTray.vbs"

echo [*] Starting background tray daemon...
start "" wscript.exe "%APP_DIR%\LaunchTray.vbs"

echo [*] Launching Abel AI standalone application...
start "" msedge.exe --app=%APP_URL% --window-size=1440,900 --disable-features=Translate --app-id=AbelAI

echo.
echo ===============================================================================
echo  SUCCESS: Abel AI is now installed on your Windows Desktop!
echo.
echo  - Desktop Icon: %USERPROFILE%\Desktop\Abel AI.lnk
echo  - Start Menu:   Start -^> Abel AI
echo  - System Tray:  Running in taskbar next to clock
echo ===============================================================================
timeout /t 3 >nul
exit
