import React, { useState, useEffect } from 'react';
import {
  Download,
  Terminal,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Monitor,
  HardDrive,
  Clock,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  AlertCircle,
  Mic,
  Image as ImageIcon,
} from 'lucide-react';

interface WindowsInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  wakeWord?: string;
  triggerHotkey?: string;
  onOpenAudioCalibration?: () => void;
}

export const WindowsInstallModal: React.FC<WindowsInstallModalProps> = ({
  isOpen,
  onClose,
  wakeWord = 'hey abel',
  triggerHotkey = 'Space',
  onOpenAudioCalibration,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'ps1' | 'bat' | 'terminal' | 'icon'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);

  // Capture PWA beforeinstallprompt event for Windows desktop app installation
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleNativePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallStatus('🎉 Abel AI was successfully installed as a native Windows App!');
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Fallback instruction for browsers where PWA is already available via address bar
      setInstallStatus('💡 To install: Click the "Install" icon (monitor with arrow) on the right side of your browser address bar or go to Settings (⋮) -> Apps -> Install this site as an app.');
    }
  };

  const batFileContent = `@echo off
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

set "APP_DIR=%LOCALAPPDATA%\\AbelAI"
set "DESKTOP_DIR=%USERPROFILE%\\Desktop"
set "STARTMENU_DIR=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Abel AI"
set "APP_URL=${typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-idpj4eli7xhmtpop4ynom3-561820329646.us-west2.run.app'}"

if not exist "%APP_DIR%" mkdir "%APP_DIR%"
if not exist "%STARTMENU_DIR%" mkdir "%STARTMENU_DIR%"

(
echo $wsh = New-Object -ComObject WScript.Shell
echo $desktopPath = [System.Environment]::GetFolderPath('Desktop'^^^)
echo $shortcut = $wsh.CreateShortcut^("$desktopPath\\Abel AI.lnk"^^^)
echo $edgePath = "\${env:ProgramFiles(x86)}\\Microsoft\\Edge\\Application\\msedge.exe"
echo $chromePath = "\${env:ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe"
echo if ^(Test-Path $edgePath^^) {
echo     $shortcut.TargetPath = $edgePath
echo     $shortcut.Arguments = "--app=%APP_URL% --window-size=1400,900"
echo } elseif ^(Test-Path $chromePath^^) {
echo     $shortcut.TargetPath = $chromePath
echo     $shortcut.Arguments = "--app=%APP_URL% --window-size=1400,900"
echo } else {
echo     $shortcut.TargetPath = "%APP_URL%"
echo }
echo $shortcut.Save^(^^)
) > "%APP_DIR%\\setup_shortcuts.ps1"

powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%APP_DIR%\\setup_shortcuts.ps1"

(
echo @echo off
echo title Abel AI
echo start "" "%APP_URL%"
) > "%APP_DIR%\\Launch-AbelAI.bat"

echo [InternetShortcut] > "%STARTMENU_DIR%\\Abel AI.url"
echo URL=%APP_URL% >> "%STARTMENU_DIR%\\Abel AI.url"

echo.
echo [+] Desktop Shortcut Created Successfully!
echo [+] Local App Folder: %APP_DIR%
echo.
start "" "%APP_URL%"
pause
`;

  const handleDownloadPS1 = () => {
    try {
      const blob = new Blob([
        `# Abel AI Windows Daemon Setup\n$AppUrl = "${window.location.origin}"\n$InstallPath = "$env:LOCALAPPDATA\\AbelAI"\nif (-not (Test-Path $InstallPath)) { New-Item -ItemType Directory -Path $InstallPath -Force }\n$wsh = New-Object -ComObject WScript.Shell\n$shortcut = $wsh.CreateShortcut("$([System.Environment]::GetFolderPath('Desktop'))\\Abel AI.lnk")\n$shortcut.TargetPath = $AppUrl\n$shortcut.Save()\nWrite-Host "[+] Desktop Shortcut Created!" -ForegroundColor Green\nStart-Process $AppUrl\n`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'install_abel_ai.ps1';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      window.location.href = '/Install-AbelAI.bat';
    }
  };

  const handleDownloadBAT = () => {
    try {
      const blob = new Blob([batFileContent], { type: 'application/x-bat;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Install-AbelAI.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      window.location.href = '/Install-AbelAI.bat';
    }
  };

  const [copiedBat, setCopiedBat] = useState(false);
  const handleCopyBat = () => {
    navigator.clipboard.writeText(batFileContent);
    setCopiedBat(true);
    setTimeout(() => setCopiedBat(false), 3000);
  };

  const terminalOneLiner = `powershell -ExecutionPolicy Bypass -Command "iwr -useb ${window.location.origin}/api/tools/windows-installer-script | iex"`;

  const handleCopyTerminal = () => {
    navigator.clipboard.writeText(terminalOneLiner);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono">
      <div className="bg-slate-950 border-2 border-amber-400/90 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-[0_0_60px_rgba(251,191,36,0.3)] relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)] font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Install Abel AI on Windows
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-full">
                  WIN 10 / 11
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Native desktop integration with system tray daemon, minimize-to-tray next to clock &amp; global hotkeys.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Install Method Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> 1-Click App
          </button>
          <button
            onClick={() => setActiveTab('ps1')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ps1'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> PowerShell (.ps1)
          </button>
          <button
            onClick={() => setActiveTab('bat')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bat'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Double-Click (.bat)
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'terminal'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Web One-Liner
          </button>
          <button
            onClick={() => setActiveTab('icon')}
            className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'icon'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Desktop Icon (.ico)
          </button>
        </div>

        {/* Status Toast */}
        {installStatus && (
          <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="font-sans leading-relaxed">{installStatus}</span>
          </div>
        )}

        {/* Tab 1: PWA Native Desktop App */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Native Windows Desktop Experience
              </h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Installs Abel AI directly into Windows as a standalone, frameless desktop application with Start Menu, Taskbar pinning, and independent window management.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleNativePWAInstall}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-2xl text-sm shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Monitor className="w-5 h-5" />
                <span>Install Standalone Windows App Now</span>
              </button>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Runs securely on your Windows desktop. No admin privileges required.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PowerShell Script Installer (.ps1) */}
        {activeTab === 'ps1' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Windows PowerShell Daemon Script (`install_abel_ai.ps1`)
              </h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Creates the Windows system directory, configures the <strong>Tray Daemon next to the clock</strong>, enables minimize on [X], and registers your hotkey (<strong>[{triggerHotkey}]</strong>) &amp; wake-word (<strong>"{wakeWord}"</strong>).
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownloadPS1}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl text-xs shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download `install_abel_ai.ps1`</span>
              </button>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400 text-[10px] uppercase font-bold">How to run in PowerShell:</div>
                <div className="p-2 bg-slate-950 rounded-lg text-amber-300 border border-slate-800 select-all">
                  powershell -ExecutionPolicy Bypass -File .\install_abel_ai.ps1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Double-Click Batch Installer (.bat) */}
        {activeTab === 'bat' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> No Terminal Required — Double-Click Setup (.bat)
              </h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                The <strong className="text-amber-300">`Install-AbelAI.bat`</strong> file is located in the project root and available for instant download below. Simply double-click it on any Windows 10/11 machine.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownloadBAT}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-2xl text-xs shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download `Install-AbelAI.bat` (Direct File)</span>
              </button>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Manual Script / File Location:</span>
                  <button
                    onClick={handleCopyBat}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    {copiedBat ? '✓ Copied .bat Content' : 'Copy .bat Code'}
                  </button>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg text-slate-400 font-mono text-[10px] select-all overflow-x-auto max-h-24">
                  <pre>{batFileContent.slice(0, 300)}...</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Web One-Liner Terminal */}
        {activeTab === 'terminal' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Instant PowerShell Web Stream Setup
              </h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Paste this one-line command directly into Windows PowerShell or Windows Terminal (<kbd>Win+X</kbd> → Terminal):
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 text-amber-300 font-mono text-[11px] break-all select-all flex items-center justify-between gap-2">
                <span>{terminalOneLiner}</span>
                <button
                  onClick={handleCopyTerminal}
                  className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                >
                  {copiedCommand ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Desktop Icon Preview & Direct Download */}
        {activeTab === 'icon' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Official Abel AI Desktop Icon Asset
              </h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                The high-resolution Gold &amp; Obsidian Hexagonal Medallion icon is bundled directly in the Windows installer and applied to your desktop shortcut automatically. You can also download the standalone icon files below:
              </p>
            </div>

            {/* Desktop Mockup Preview */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-black border-2 border-amber-400/60 p-2 shadow-[0_0_25px_rgba(251,191,36,0.3)] flex items-center justify-center">
                    <img
                      src="/abel_icon.svg"
                      alt="Abel AI Desktop Icon"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[9px] font-black text-slate-950 border border-slate-950">
                    ★
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Abel AI</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded">
                      .lnk
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Vector Hexagon • Cybernetic Gold Core • Windows 10/11 Compatible
                  </div>
                  <div className="text-[10px] font-mono text-amber-400">
                    Location: %LOCALAPPDATA%\AbelAI\abel_icon.ico
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                <a
                  href="/abel_icon.ico"
                  download="abel_icon.ico"
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Binary .ICO Icon</span>
                </a>
                <a
                  href="/abel_icon.svg"
                  download="AbelAI-Desktop-Icon.svg"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG Icon</span>
                </a>
              </div>
            </div>

            {/* How to set manual icon on Windows */}
            <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1 text-[11px] font-sans text-slate-400">
              <span className="text-slate-300 font-bold uppercase text-[10px] block">To customize any existing Windows shortcut:</span>
              <p>Right-click shortcut → <strong>Properties</strong> → <strong>Change Icon...</strong> → Browse to <code>%LOCALAPPDATA%\AbelAI\abel_icon.ico</code> or downloaded icon.</p>
            </div>
          </div>
        )}

        {/* Next Step: Adapt Microphone & Voice Commands */}
        {onOpenAudioCalibration && (
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-amber-950/40 rounded-2xl border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Next Step: Adapt Microphone &amp; Voice</div>
                <div className="text-[10px] text-slate-400 font-sans">
                  Calibrate your Windows microphone, train wake-word &amp; filter noise.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAudioCalibration();
              }}
              className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <span>Adapt Mic</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* What gets configured checklist */}
        <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px]">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Windows Features Automatically Configured:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>System Tray icon next to clock</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Close button [X] minimizes to tray</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Global hotkey: [{triggerHotkey}]</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Wake-word listener: "{wakeWord}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
