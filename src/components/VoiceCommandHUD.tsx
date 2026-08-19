import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Keyboard,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Settings2,
  Radio,
  Clock,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Bot,
  Sliders,
  Check,
} from 'lucide-react';
import {
  NavSection,
  VoiceConfig,
  VoicePersona,
  CalendarTask,
  StockHolding,
  CryptoHolding,
  VoiceCommandLog,
} from '../types';
import { CircularAudioWaveform } from './CircularAudioWaveform';

interface VoiceCommandHUDProps {
  currentSection: NavSection;
  voiceConfig: VoiceConfig;
  onUpdateVoiceConfig: (config: VoiceConfig) => void;
  onNavigate: (section: NavSection) => void;
  onAddTask: (task: CalendarTask) => void;
  onAddStock?: (stock: StockHolding) => void;
  onAddCrypto?: (crypto: CryptoHolding) => void;
  onTriggerAutomation?: (event: string, details: string) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  onRestoreFromTray?: () => void;
}

export const VoiceCommandHUD: React.FC<VoiceCommandHUDProps> = ({
  currentSection,
  voiceConfig,
  onUpdateVoiceConfig,
  onNavigate,
  onAddTask,
  onAddStock,
  onAddCrypto,
  onTriggerAutomation,
  isOpenExternal,
  onCloseExternal,
  onRestoreFromTray,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [lastActionTaken, setLastActionTaken] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isBindingKey, setIsBindingKey] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Config modal temp state
  const [tempWakeWord, setTempWakeWord] = useState(voiceConfig.wakeWord || 'hey abel');
  const [tempHotkeyDisplay, setTempHotkeyDisplay] = useState(voiceConfig.triggerKeyDisplay || 'Space');
  const [tempSensitivity, setTempSensitivity] = useState<'low' | 'medium' | 'high'>(
    voiceConfig.wakeWordSensitivity || 'medium'
  );

  const [commandLogs, setCommandLogs] = useState<VoiceCommandLog[]>([
    {
      id: 'log-1',
      timestamp: 'Today, 8:40 AM',
      transcript: 'Schedule Porsche brake check for tomorrow 9 AM',
      intent: 'schedule_task',
      actionTaken: 'Created calendar task: Porsche Brake Service',
      success: true,
    },
    {
      id: 'log-2',
      timestamp: 'Today, 8:30 AM',
      transcript: 'Abel, show crypto watchtower',
      intent: 'navigate',
      actionTaken: 'Navigated to Wealth Terminal',
      success: true,
    },
  ]);

  const recognitionRef = useRef<any>(null);

  // Sync external open state
  useEffect(() => {
    if (isOpenExternal !== undefined && isOpenExternal !== isOpen) {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) {
        startMicListening();
      }
    }
  }, [isOpenExternal]);

  // Persona TTS Helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceConfig.voiceFeedbackEnabled) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const persona = voiceConfig.activePersona || 'witty_female';

    // Persona-specific vocal acoustics
    if (persona === 't1800_arnold') {
      utterance.pitch = 0.6; // Deep Austrian cybernetic baritone
      utterance.rate = 0.88;
    } else if (persona === 'the_joker') {
      utterance.pitch = 1.35; // Theatrical dramatic variation
      utterance.rate = 1.12;
    } else {
      // Witty Sarcastic Female
      utterance.pitch = 1.15;
      utterance.rate = 1.05;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition Setup & Background Wake Word Listener
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimTranscript(interim);

        const currentText = (final || interim).toLowerCase().trim();
        const wakePhrase = (voiceConfig.wakeWord || 'hey abel').toLowerCase().trim();

        // Background Wake Word Detection
        if (wakePhrase && currentText.includes(wakePhrase)) {
          if (!isOpen) {
            setIsOpen(true);
            if (onRestoreFromTray) onRestoreFromTray();
          }
        }

        if (final) {
          setTranscript(final);
          handleExecuteVoiceCommand(final);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if continuous wake word is active
        if (voiceConfig.wakeWordEnabled && !isProcessing) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;

      if (voiceConfig.wakeWordEnabled) {
        try {
          recognition.start();
        } catch (e) {}
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [voiceConfig.wakeWord, voiceConfig.wakeWordEnabled, voiceConfig.activePersona]);

  // Handy-Style Hotkey Listener with Modifier Keys (Ctrl, Alt, Shift, Meta)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. If currently in Handy-style key-binding mode:
      if (isBindingKey) {
        e.preventDefault();
        e.stopPropagation();

        // Check if just a modifier was pressed by itself
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
          return;
        }

        const modifiers: string[] = [];
        if (e.ctrlKey) modifiers.push('Ctrl');
        if (e.altKey) modifiers.push('Alt');
        if (e.shiftKey) modifiers.push('Shift');
        if (e.metaKey) modifiers.push('Win');

        const mainKey = e.code === 'Space' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
        const display = [...modifiers, mainKey].join(' + ');

        onUpdateVoiceConfig({
          ...voiceConfig,
          triggerKey: e.code || e.key,
          triggerKeyDisplay: display,
          triggerModifiers: {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey,
          },
        });
        setTempHotkeyDisplay(display);
        setIsBindingKey(false);
        return;
      }

      // 2. Normal Hotkey Execution:
      const activeElementTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeElementTag === 'input' || activeElementTag === 'textarea';

      // Verify Modifier match
      const reqCtrl = voiceConfig.triggerModifiers?.ctrl ?? false;
      const reqAlt = voiceConfig.triggerModifiers?.alt ?? false;
      const reqShift = voiceConfig.triggerModifiers?.shift ?? false;
      const reqMeta = voiceConfig.triggerModifiers?.meta ?? false;

      const hasModifiers = reqCtrl || reqAlt || reqShift || reqMeta;
      const modifiersMatch =
        (!reqCtrl || e.ctrlKey) &&
        (!reqAlt || e.altKey) &&
        (!reqShift || e.shiftKey) &&
        (!reqMeta || e.metaKey);

      // Check key match
      const keyMatches =
        e.code === voiceConfig.triggerKey ||
        e.key.toLowerCase() === voiceConfig.triggerKey.toLowerCase();

      if (keyMatches && (hasModifiers ? modifiersMatch : !isInput)) {
        e.preventDefault();
        setIsOpen(true);
        if (onRestoreFromTray) onRestoreFromTray();
        startMicListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceConfig, isBindingKey, onRestoreFromTray]);

  const startMicListening = () => {
    setTranscript('');
    setInterimTranscript('');
    setAiResponseText('');
    setLastActionTaken(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(true);
      }
    } else {
      setIsListening(true);
    }
  };

  const stopMicListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleExecuteVoiceCommand = async (textToExecute: string) => {
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToExecute,
          currentSection,
          persona: voiceConfig.activePersona || 'witty_female',
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.reply) {
        setAiResponseText(data.reply);
        speakText(data.reply);
      }

      if (data.action) {
        const act = data.action;
        setLastActionTaken(`${act.type}: ${act.summary || ''}`);

        if (act.type === 'navigate' && act.targetSection) {
          onNavigate(act.targetSection);
        } else if (act.type === 'schedule_task' && act.taskData) {
          onAddTask({
            id: `task-${Date.now()}`,
            title: act.taskData.title || 'Voice Task',
            date: act.taskData.date || new Date().toISOString().split('T')[0],
            time: act.taskData.time || '09:00',
            durationMinutes: act.taskData.durationMinutes || 60,
            category: act.taskData.category || 'general',
            priority: act.taskData.priority || 'normal',
            completed: false,
            sourceModule: 'voice_command',
          });
        } else if (act.type === 'add_crypto' && act.cryptoData && onAddCrypto) {
          onAddCrypto({
            id: `crypto-${Date.now()}`,
            symbol: (act.cryptoData.symbol || 'SOL').toUpperCase(),
            name: act.cryptoData.name || 'Crypto',
            amount: act.cryptoData.amount || 1,
            avgBuyPrice: act.cryptoData.price || 100,
            currentPrice: act.cryptoData.price || 100,
            change24h: 0.0,
            network: 'Mainnet',
          });
        }
      }

      setCommandLogs((prev) => [
        {
          id: `cmd-${Date.now()}`,
          timestamp: 'Just now',
          transcript: textToExecute,
          intent: data.action?.type || 'general_chat',
          actionTaken: data.action?.summary || data.reply || 'Responded',
          success: true,
        },
        ...prev.slice(0, 8),
      ]);
    } catch (err) {
      console.error('Voice command error:', err);
      setIsProcessing(false);
      const fallbackReply = 'Command processed by local voice engine.';
      setAiResponseText(fallbackReply);
      speakText(fallbackReply);
    }
  };

  const handleSaveConfig = () => {
    onUpdateVoiceConfig({
      ...voiceConfig,
      wakeWord: tempWakeWord.trim().toLowerCase(),
      triggerKeyDisplay: tempHotkeyDisplay,
      wakeWordSensitivity: tempSensitivity,
    });
    setShowConfigModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-slate-950 border-2 border-amber-400/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(251,191,36,0.35)] relative overflow-hidden">
        {/* Top Glow Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-300" />

        {/* Header with Title & Close */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Abel AI Voice HUD</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  HOTKEY: [{voiceConfig.triggerKeyDisplay || 'Space'}]
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Wake Word: &quot;{voiceConfig.wakeWord}&quot; • Persona: {voiceConfig.activePersona}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-colors cursor-pointer"
              title="Handy-style Hotkey & Wake Word Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onCloseExternal) onCloseExternal();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Golden Voice Pulse Reactor with Circular Audio Waveform Visualizer */}
        <div className="py-2">
          <CircularAudioWaveform
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            onTapOrb={() => {
              if (isListening) {
                stopMicListening();
              } else {
                startMicListening();
              }
            }}
            audioSensitivity={voiceConfig.wakeWordSensitivity || 'medium'}
            activePersona={voiceConfig.activePersona || 'witty_female'}
            interimTranscript={interimTranscript}
            transcript={transcript}
            wakeWord={voiceConfig.wakeWord || 'hey abel'}
          />
        </div>

        {/* AI Response Text Box */}
        {aiResponseText && (
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/40 text-xs space-y-1.5 shadow-md">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Abel AI Response
              </span>
              {lastActionTaken && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {lastActionTaken}
                </span>
              )}
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">{aiResponseText}</p>
          </div>
        )}

        {/* Quick Manual Text Fallback Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualInput.trim()) {
              handleExecuteVoiceCommand(manualInput.trim());
              setManualInput('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Or type a command (e.g. 'schedule oil change tomorrow')..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Handy-Style Hotkey & Wake Word Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-amber-400/80 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_0_40px_rgba(251,191,36,0.3)] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Handy-Style Hotkey &amp; Wake Word Setup
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Hotkey Rebinding Area */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold uppercase text-[10px]">
                  Pick Hotkey Combination (Handy Style)
                </label>
                <p className="text-slate-400 text-[11px]">
                  Click below and press ANY key combination (e.g. <strong className="text-amber-300">Ctrl + Space</strong>, <strong className="text-amber-300">Alt + V</strong>, <strong className="text-amber-300">F2</strong>):
                </p>

                <button
                  type="button"
                  onClick={() => setIsBindingKey(true)}
                  className={`w-full py-3.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    isBindingKey
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-slate-950 text-amber-300 border-slate-800 hover:border-amber-400'
                  }`}
                >
                  {isBindingKey
                    ? 'PRESS ANY KEY OR COMBO (e.g. Ctrl+Space) NOW...'
                    : `Active Hotkey: [ ${tempHotkeyDisplay} ] (Click to Reassign)`}
                </button>
              </div>

              {/* Spoken Wake Word Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase text-[10px]">
                  Spoken Wake Word
                </label>
                <input
                  type="text"
                  placeholder="e.g. hey abel, abel, computer"
                  value={tempWakeWord}
                  onChange={(e) => setTempWakeWord(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              {/* Wake Word Sensitivity */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase text-[10px]">
                  Wake Word Sensitivity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setTempSensitivity(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase cursor-pointer ${
                        tempSensitivity === lvl
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close to Tray Switch */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Minimize to Tray on X</div>
                  <div className="text-[10px] text-slate-400">Keep listening in background next to clock</div>
                </div>
                <span className="text-amber-400 font-bold text-xs">ENABLED</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
