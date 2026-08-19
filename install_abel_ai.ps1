# ==============================================================================
# Abel AI - Autonomous Executive OS
# Windows Native Setup & Background Daemon Installer (.ps1)
# ==============================================================================

param (
    [string]$AppUrl = "https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app",
    [string]$InstallPath = "$env:LOCALAPPDATA\AbelAI",
    [string]$WakeWord = "hey abel",
    [string]$TriggerHotkey = "Space",
    [switch]$AutoStart = $true
)

Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host "            ABEL AI - AUTONOMOUS EXECUTIVE OS & ASSISTANT" -ForegroundColor Yellow
Write-Host "                    WINDOWS NATIVE DAEMON SETUP" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "[*] Target Directory: $InstallPath" -ForegroundColor Cyan
Write-Host "[*] App Endpoint:     $AppUrl" -ForegroundColor Cyan
Write-Host "[*] Wake Word:        '$WakeWord'" -ForegroundColor Cyan
Write-Host "[*] Trigger Hotkey:   [$TriggerHotkey]" -ForegroundColor Cyan
Write-Host ""

# 1. Create directory structure
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Host "[+] Created local app folder: $InstallPath" -ForegroundColor Green
}

# 2. Create Start Menu directory
$startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Abel AI"
if (-not (Test-Path $startMenuPath)) {
    New-Item -ItemType Directory -Path $startMenuPath -Force | Out-Null
}

# 3. Create Windows Script Host Shortcut on Desktop
$wsh = New-Object -ComObject WScript.Shell
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcut = $wsh.CreateShortcut("$desktopPath\Abel AI.lnk")

$edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$chromePath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"

if (Test-Path $edgePath) {
    $shortcut.TargetPath = $edgePath
    $shortcut.Arguments = "--app=$AppUrl --window-size=1440,900"
    $shortcut.Description = "Abel AI - Autonomous Executive OS"
} elseif (Test-Path $chromePath) {
    $shortcut.TargetPath = $chromePath
    $shortcut.Arguments = "--app=$AppUrl --window-size=1440,900"
    $shortcut.Description = "Abel AI - Autonomous Executive OS"
} else {
    $shortcut.TargetPath = $AppUrl
}
$shortcut.Save()
Write-Host "[+] Desktop shortcut created at: $desktopPath\Abel AI.lnk" -ForegroundColor Green

# 4. Create Standalone Batch Launcher
$batchLauncherContent = @"
@echo off
title Abel AI Executive OS
start "" "$AppUrl"
"@
Set-Content -Path "$InstallPath\Launch-AbelAI.bat" -Value $batchLauncherContent
Write-Host "[+] Local launcher created at: $InstallPath\Launch-AbelAI.bat" -ForegroundColor Green

# 5. Create System Tray Background Daemon Runner
$daemonScript = @"
# Abel AI Background Tray Daemon
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

`$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
`$notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
`$notifyIcon.Text = "Abel AI - Wake: $WakeWord"
`$notifyIcon.Visible = `$true

`$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip
`$itemOpen = `$contextMenu.Items.Add("Open Abel AI")
`$itemOpen.add_Click({ Start-Process "$AppUrl" })

`$itemExit = `$contextMenu.Items.Add("Exit Abel AI")
`$itemExit.add_Click({ `$notifyIcon.Visible = `$false; [System.Windows.Forms.Application]::Exit() })

`$notifyIcon.ContextMenuStrip = `$contextMenu
`$notifyIcon.ShowBalloonTip(3000, "Abel AI Active", "Running in tray next to clock. Wake word: '$WakeWord'", [System.Windows.Forms.ToolTipIcon]::Info)

[System.Windows.Forms.Application]::Run()
"@
Set-Content -Path "$InstallPath\AbelTrayDaemon.ps1" -Value $daemonScript
Write-Host "[+] System tray background daemon saved: $InstallPath\AbelTrayDaemon.ps1" -ForegroundColor Green

# 6. Auto-start with Windows (Optional)
if ($AutoStart) {
    $runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    Set-ItemProperty -Path $runKey -Name "AbelAIDaemon" -Value "powershell.exe -WindowStyle Hidden -File `"$InstallPath\AbelTrayDaemon.ps1`"" -Force
    Write-Host "[+] Registered Auto-Start with Windows (Startup Registry)" -ForegroundColor Green
}

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "                    INSTALLATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now launch Abel AI from your Desktop shortcut or start menu." -ForegroundColor Cyan
Write-Host "Starting Abel AI now..." -ForegroundColor Yellow
Start-Process $AppUrl
