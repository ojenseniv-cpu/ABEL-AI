import React, { useState, useEffect } from 'react';
import {
  Minus,
  Square,
  X,
  Mic,
  Sparkles,
  Volume2,
  Bell,
  Radio,
  ChevronUp,
  Settings,
  Power,
  RotateCcw,
  ShieldCheck,
  Zap,
  Monitor,
  Download,
} from 'lucide-react';
import { VoiceConfig, VoicePersona } from '../types';

interface WindowsTitlebarAndTrayProps {
  isMinimizedToTray: boolean;
  onToggleMinimizeToTray: (minimized: boolean) => void;
  voiceConfig: VoiceConfig;
  onOpenVoiceHUD: () => void;
  onOpenSettings: () => void;
  activePersona: VoicePersona;
  onOpenInstallModal?: () => void;
}

export const WindowsTitlebarAndTray: React.FC<WindowsTitlebarAndTrayProps> = ({
  isMinimizedToTray,
  onToggleMinimizeToTray,
  voiceConfig,
  onOpenVoiceHUD,
  onOpenSettings,
  activePersona,
  onOpenInstallModal,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [showTrayMenu, setShowTrayMenu] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Real-time clock for system tray
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setCurrentDate(now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseButtonClick = () => {
    if (voiceConfig.minimizeToTrayOnClose !== false) {
      onToggleMinimizeToTray(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } else {
      if (confirm('Close Abel AI completely?')) {
        window.close();
      }
    }
  };

  const personaLabel =
    activePersona === 't1800_arnold'
      ? '🤖 T-1800 Cybernetic'
      : activePersona === 'the_joker'
      ? '🃏 The Joker'
      : '👑 Witty Female';

  return (
    <>
      {/* 1. Windows Native Titlebar at Top of App */}
      <div
        id="windows-titlebar"
        className="bg-black border-b border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-xs font-mono text-slate-400 select-none sticky top-0 z-50 shadow-md"
      >
        {/* Left: Window Title & Icon */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-bold text-[9px] shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            A
          </div>
          <span className="text-white font-bold text-[11px] tracking-tight">
            Abel AI • Autonomous Executive OS
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-[10px] text-amber-400/80 hidden sm:inline">
            Wake: &quot;{voiceConfig.wakeWord}&quot; • Hotkey: [{voiceConfig.triggerKeyDisplay || 'Space'}]
          </span>
        </div>

        {/* Center: System Status Badge & Windows Install Trigger */}
        <div className="hidden md:flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Daemon Active</span>
          </span>
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-2 py-0.5 bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 rounded border border-amber-400/40 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Download className="w-2.5 h-2.5" /> Install App
            </button>
          )}
        </div>

        {/* Right: Windows Minimize, Maximize, Close Buttons */}
        <div className="flex items-center">
          <button
            onClick={() => {
              onToggleMinimizeToTray(true);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4500);
            }}
            className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimize to System Tray"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleCloseButtonClick}
            className="px-3.5 py-1 text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
            title="Close (Minimizes to System Tray next to clock)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Windows Toast Notification when Minimized */}
      {showToast && (
        <div className="fixed bottom-14 right-4 z-50 max-w-sm w-full bg-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-in fade-in slide-in-from-bottom-5 font-mono text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase text-[11px]">Abel AI in System Tray</span>
                <span className="text-[9px] text-amber-400 font-bold">BACKGROUND DAEMON</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                Abel AI is minimized to your system tray next to the clock. Say{' '}
                <strong className="text-amber-300">&quot;{voiceConfig.wakeWord}&quot;</strong> or press{' '}
                <strong className="text-amber-300">[{voiceConfig.triggerKeyDisplay || 'Space'}]</strong> to activate anytime.
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. Windows System Tray Simulation Dock (Bottom Right next to Clock) */}
      <div
        id="windows-system-tray-dock"
        className="fixed bottom-0 right-0 z-50 flex items-center gap-2 bg-black/95 backdrop-blur-md border-t border-l border-amber-500/40 px-4 py-1.5 rounded-tl-2xl shadow-[0_-5px_25px_rgba(0,0,0,0.8)] font-mono text-xs select-none"
      >
        {/* Tray Toggle Chevron */}
        <button
          onClick={() => setShowTrayMenu(!showTrayMenu)}
          className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          title="Show Hidden Tray Icons"
        >
          <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showTrayMenu ? 'rotate-180 text-amber-400' : ''}`} />
        </button>

        {/* Abel AI Golden Tray Icon */}
        <div
          onClick={() => {
            if (isMinimizedToTray) {
              onToggleMinimizeToTray(false);
            } else {
              onOpenVoiceHUD();
            }
          }}
          className="relative group p-1.5 rounded-xl bg-slate-900 border border-amber-400/40 hover:border-amber-400 hover:bg-amber-400/10 transition-all cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.3)]"
          title={`Abel AI Sentinel • Wake: "${voiceConfig.wakeWord}" • Hotkey: [${voiceConfig.triggerKeyDisplay || 'Space'}] (Click to Restore/Activate)`}
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-[10px]">
            A
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
        </div>

        {/* Microphone / Wake Status Pill */}
        <div
          onClick={onOpenVoiceHUD}
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-all cursor-pointer text-[11px]"
          title="Mic listening for hotkey/wake word"
        >
          <Mic className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">[{voiceConfig.triggerKeyDisplay || 'Space'}]</span>
        </div>

        {/* Windows Clock & Date */}
        <div className="border-l border-slate-800 pl-3 pr-1 text-right flex flex-col justify-center">
          <div className="text-white font-bold text-[11px] tracking-tight">{currentTime || '08:40 AM'}</div>
          <div className="text-[9px] text-slate-400">{currentDate || '8/19/2026'}</div>
        </div>

        {/* Restore Window Button if Minimized */}
        {isMinimizedToTray && (
          <button
            onClick={() => onToggleMinimizeToTray(false)}
            className="ml-2 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Abel AI
          </button>
        )}
      </div>

      {/* 4. Windows Tray Context Menu Popup */}
      {showTrayMenu && (
        <div className="fixed bottom-12 right-6 z-50 w-64 bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-3 shadow-[0_0_30px_rgba(0,0,0,0.9)] font-mono text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Abel AI Tray Daemon
            </span>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
              RUNNING
            </span>
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div>Persona: <strong className="text-white">{personaLabel}</strong></div>
            <div>Wake Word: <strong className="text-amber-400">&quot;{voiceConfig.wakeWord}&quot;</strong></div>
            <div>Mic Hotkey: <strong className="text-amber-400">[{voiceConfig.triggerKeyDisplay || 'Space'}]</strong></div>
          </div>

          <div className="space-y-1 pt-1">
            <button
              onClick={() => {
                onToggleMinimizeToTray(false);
                setShowTrayMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-white font-bold transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Restore Full Window
            </button>

            <button
              onClick={() => {
                onOpenVoiceHUD();
                setShowTrayMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Mic className="w-3.5 h-3.5" />
              Trigger Voice Command
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onToggleMinimizeToTray(false);
                setShowTrayMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings &amp; Hotkeys
            </button>

            <button
              onClick={() => {
                if (confirm('Exit Abel AI completely?')) {
                  window.close();
                }
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-950/50 text-rose-400 transition-colors cursor-pointer flex items-center gap-2 text-[11px]"
            >
              <Power className="w-3.5 h-3.5" />
              Quit Abel AI
            </button>
          </div>
        </div>
      )}

      {/* Minimized Background Overlay Screen (When user clicks X) */}
      {isMinimizedToTray && (
        <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-center font-mono select-none">
          <div className="max-w-md w-full bg-slate-950 border-2 border-amber-500/50 rounded-3xl p-8 space-y-6 shadow-[0_0_50px_rgba(251,191,36,0.2)]">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              A
            </div>

            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                Abel AI Minimized to System Tray
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Abel AI is running silently in your Windows notification area next to the clock. The AI voice sentinel is active in the background.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Spoken Wake Word:</span>
                <span className="text-amber-300 font-bold">&quot;{voiceConfig.wakeWord}&quot;</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mic Hotkey Trigger:</span>
                <span className="text-amber-300 font-bold">[{voiceConfig.triggerKeyDisplay || 'Space'}]</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Persona:</span>
                <span className="text-white font-bold">{personaLabel}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onToggleMinimizeToTray(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Restore Abel AI Window
              </button>
              <button
                onClick={onOpenVoiceHUD}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                Speak Voice Command Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
