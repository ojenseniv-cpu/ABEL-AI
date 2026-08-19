# =========================================================================
# ABEL AI - OFFICIAL WINDOWS AUTONOMOUS EXECUTIVE INSTALLER (PowerShell)
# Architecture: Windows 10 / Windows 11 (x64 / ARM64)
# Features: Real Binary Icon, Standalone Window, System Tray Daemon, Start Menu
# =========================================================================

param (
    [string]$AppUrl = "https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "=================================================================" -ForegroundColor DarkYellow
Write-Host "   ___   ___  ___ _       _   ___ " -ForegroundColor Yellow
Write-Host "  / _ \ / _ \/ _ \ |     / \ |_ _|" -ForegroundColor Yellow
Write-Host " / /_\ / _ </  __/ |__  / _ \ | | " -ForegroundColor Yellow
Write-Host "/_/ \_\___/ \___/|____/_/ \_\___| " -ForegroundColor Yellow
Write-Host "   AUTONOMOUS EXECUTIVE OPERATING SYSTEM - WINDOWS INSTALLER" -ForegroundColor DarkYellow
Write-Host "=================================================================" -ForegroundColor DarkYellow
Write-Host ""

$InstallDir = "$env:LOCALAPPDATA\AbelAI"
$DesktopShortcut = "$env:USERPROFILE\Desktop\Abel AI.lnk"
$StartMenuDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Abel AI"
$StartMenuShortcut = "$StartMenuDir\Abel AI.lnk"
$IconPath = "$InstallDir\abel_icon.ico"
$TrayScriptPath = "$InstallDir\AbelTrayDaemon.ps1"
$TrayLauncherVbs = "$InstallDir\LaunchTray.vbs"

Write-Host "[1/6] Setting up installation directories..." -ForegroundColor Cyan
if (!(Test-Path -Path $InstallDir)) { New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null }
if (!(Test-Path -Path $StartMenuDir)) { New-Item -ItemType Directory -Path $StartMenuDir -Force | Out-Null }

Write-Host "[2/6] Acquiring official binary Abel AI Desktop Icon..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$iconDownloaded = $false

try {
    Invoke-WebRequest -Uri "$AppUrl/abel_icon.ico" -OutFile $IconPath -UseBasicParsing -TimeoutSec 10
    if ((Test-Path $IconPath) -and ((Get-Item $IconPath).Length -gt 100)) {
        $iconDownloaded = $true
    }
} catch {}

if (-not $iconDownloaded) {
    # Generate native high-resolution binary icon on Windows via .NET System.Drawing
    try {
        Add-Type -AssemblyName System.Drawing
        $bmp = New-Object System.Drawing.Bitmap 256, 256
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

        # Draw dark hexagon
        $hexBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 10, 12, 18))
        $goldPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 251, 191, 36)), 10

        $points = @(
            (New-Object System.Drawing.PointF 128, 16),
            (New-Object System.Drawing.PointF 232, 76),
            (New-Object System.Drawing.PointF 232, 180),
            (New-Object System.Drawing.PointF 128, 240),
            (New-Object System.Drawing.PointF 24, 180),
            (New-Object System.Drawing.PointF 24, 76)
        )
        $g.FillPolygon($hexBrush, $points)
        $g.DrawPolygon($goldPen, $points)

        # Draw "A" glyph
        $goldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 254, 240, 138))
        $font = New-Object System.Drawing.Font "Arial", 110, ([System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString("A", $font, $goldBrush, (New-Object System.Drawing.RectangleF 0, 15, 256, 230), $sf)

        $hIcon = $bmp.GetHicon()
        $icon = [System.Drawing.Icon]::FromHandle($hIcon)
        $fs = New-Object System.IO.FileStream $IconPath, ([System.IO.FileMode]::Create)
        $icon.Save($fs)
        $fs.Close()
        $bmp.Dispose()
        $g.Dispose()
    } catch {}
}

Write-Host "[3/6] Detecting browser runtime for standalone app execution..." -ForegroundColor Cyan
$edge64 = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$edge32 = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
$chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
$chromeUser = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"

$targetExe = "msedge.exe"
$appArgs = "--app=$AppUrl --window-size=1440,900 --disable-features=Translate --app-id=AbelAI"

if (Test-Path $edge64) { $targetExe = $edge64 }
elseif (Test-Path $edge32) { $targetExe = $edge32 }
elseif (Test-Path $chrome) { $targetExe = $chrome }
elseif (Test-Path $chromeUser) { $targetExe = $chromeUser }

Write-Host "[4/6] Creating Desktop and Start Menu Shortcuts with custom Gold Icon..." -ForegroundColor Cyan
$WshShell = New-Object -ComObject WScript.Shell

# Desktop Shortcut
$Shortcut = $WshShell.CreateShortcut($DesktopShortcut)
$Shortcut.TargetPath = $targetExe
$Shortcut.Arguments = $appArgs
$Shortcut.Description = "Abel AI - Autonomous Executive Operating System"
$Shortcut.WorkingDirectory = $InstallDir
if (Test-Path $IconPath) { $Shortcut.IconLocation = "$IconPath, 0" }
$Shortcut.Save()

# Start Menu Shortcut
$SmShortcut = $WshShell.CreateShortcut($StartMenuShortcut)
$SmShortcut.TargetPath = $targetExe
$SmShortcut.Arguments = $appArgs
$SmShortcut.Description = "Abel AI - Autonomous Executive Operating System"
$SmShortcut.WorkingDirectory = $InstallDir
if (Test-Path $IconPath) { $SmShortcut.IconLocation = "$IconPath, 0" }
$SmShortcut.Save()

Write-Host "[5/6] Generating Abel AI Windows System Tray Daemon..." -ForegroundColor Cyan
$trayDaemonCode = @"
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

`$notify = New-Object System.Windows.Forms.NotifyIcon
`$iconPath = "$IconPath"
if (Test-Path `$iconPath) {
    `$notify.Icon = New-Object System.Drawing.Icon `$iconPath
} else {
    `$notify.Icon = [System.Drawing.SystemIcons]::Application
}
`$notify.Text = "Abel AI - Autonomous Executive OS"
`$notify.Visible = `$true

`$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

`$itemOpen = `$contextMenu.Items.Add("⚡ Open Abel AI Desktop")
`$itemOpen.add_Click({
    Start-Process "$targetExe" "$appArgs"
})

`$itemVoice = `$contextMenu.Items.Add("🎙️ Microphone & Voice Studio")
`$itemVoice.add_Click({
    Start-Process "$targetExe" "$appArgs"
})

`$itemSep = `$contextMenu.Items.Add("-")

`$itemExit = `$contextMenu.Items.Add("❌ Exit Abel AI")
`$itemExit.add_Click({
    `$notify.Visible = `$false
    `$notify.Dispose()
    [System.Windows.Forms.Application]::Exit()
})

`$notify.ContextMenuStrip = `$contextMenu
`$notify.add_DoubleClick({
    Start-Process "$targetExe" "$appArgs"
})

`$notify.ShowBalloonTip(3000, "Abel AI Active", "Abel AI is running in the background next to your Windows clock.", [System.Windows.Forms.ToolTipIcon]::Info)

[System.Windows.Forms.Application]::Run()
"@

Set-Content -Path $TrayScriptPath -Value $trayDaemonCode -Encoding UTF8

# Silent VBS launcher for tray daemon
$vbsContent = "Set WshShell = CreateObject(`"WScript.Shell`")`r`nWshShell.Run `"powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File `"`" & `"$TrayScriptPath`" & `"`"`", 0, False"
Set-Content -Path $TrayLauncherVbs -Value $vbsContent -Encoding ASCII

# Refresh Windows Icon Cache so desktop icon renders instantly
try {
    & ie4uinit.exe -show
} catch {}

Write-Host "[6/6] Launching Abel AI Desktop App & System Tray Daemon..." -ForegroundColor Green
Start-Process "wscript.exe" "`"$TrayLauncherVbs`""
Start-Process $targetExe $appArgs

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host " SUCCESS: Abel AI is now installed on your Windows machine!" -ForegroundColor Green
Write-Host " [✓] Desktop Shortcut: $DesktopShortcut (With Gold Hexagon Icon)" -ForegroundColor Cyan
Write-Host " [✓] Start Menu: $StartMenuShortcut" -ForegroundColor Cyan
Write-Host " [✓] System Tray: Running silently in Notification Area next to clock" -ForegroundColor Cyan
Write-Host " [✓] Native Window: Running standalone frameless executive experience" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Yellow
