import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sliders,
  Settings,
  Radio,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  Zap,
  Volume,
  Keyboard,
  Shield,
  Layers,
  ChevronRight,
  AlertTriangle,
  Monitor,
  Laptop,
  Check,
  Award,
} from 'lucide-react';

interface MicrophoneVoiceAdaptationStudioProps {
  isOpen: boolean;
  onClose: () => void;
  currentWakeWord: string;
  onUpdateWakeWord: (wakeWord: string) => void;
  triggerHotkey: string;
  onUpdateTriggerHotkey: (hotkey: string) => void;
}

export const MicrophoneVoiceAdaptationStudio: React.FC<MicrophoneVoiceAdaptationStudioProps> = ({
  isOpen,
  onClose,
  currentWakeWord,
  onUpdateWakeWord,
  triggerHotkey,
  onUpdateTriggerHotkey,
}) => {
  // Audio Devices State
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [peakAudioLevel, setPeakAudioLevel] = useState(0);

  // Audio Processing Parameters
  const [inputGain, setInputGain] = useState(1.2);
  const [noiseGateThreshold, setNoiseGateThreshold] = useState(15); // % threshold
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);

  // Voice & Wake Word State
  const [tempWakeWord, setTempWakeWord] = useState(currentWakeWord || 'hey abel');
  const [wakeSensitivity, setWakeSensitivity] = useState(85);
  const [voiceMode, setVoiceMode] = useState<'wake_word' | 'push_to_talk' | 'always_listening'>('wake_word');
  const [tempHotkey, setTempHotkey] = useState(triggerHotkey || 'Space');
  const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);

  // Live Testing & Speech Recognition
  const [testTranscript, setTestTranscript] = useState('');
  const [wakeDetected, setWakeDetected] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  // Web Audio Nodes Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load available media devices
  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const mics = devices.filter((d) => d.kind === 'audioinput');
          setAudioDevices(mics);
          if (mics.length > 0 && selectedDeviceId === 'default') {
            setSelectedDeviceId(mics[0].deviceId || 'default');
          }
        }
      } catch (err) {
        console.warn('Could not enumerate audio devices:', err);
      }
    };

    getDevices();
  }, [isOpen]);

  // Handle live audio stream for VU meter and calibration
  useEffect(() => {
    if (!isOpen) {
      stopAudioStream();
      return;
    }

    startAudioStream();

    return () => {
      stopAudioStream();
    };
  }, [isOpen, selectedDeviceId, echoCancellation, noiseSuppression, autoGainControl]);

  const startAudioStream = async () => {
    try {
      stopAudioStream();

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedDeviceId !== 'default' ? { exact: selectedDeviceId } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setMicActive(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100 * inputGain));

        setAudioLevel(normalized);
        setPeakAudioLevel((prev) => Math.max(prev * 0.95, normalized));

        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
      startSpeechRecognition();
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      setMicActive(false);
    }
  };

  const stopAudioStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setMicActive(false);
    setAudioLevel(0);
  };

  // Live Speech Recognition for Wake Word testing
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim().toLowerCase();
        setTestTranscript(text);

        const targetWake = tempWakeWord.toLowerCase();
        if (text.includes(targetWake) || text.includes('abel') || text.includes('hey abel')) {
          setWakeDetected(true);
          playChime(600, 900);
          setTimeout(() => setWakeDetected(false), 3000);
        }
      };

      recognition.onerror = () => {};

      recognition.onend = () => {
        if (isOpen && micActive) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition could not be initialized:', e);
    }
  };

  // Play luxury feedback chime with Web Audio
  const playChime = (freq1 = 520, freq2 = 880) => {
    if (!soundFeedback) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Key capture listener for push-to-talk hotkey
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isRecordingHotkey) {
      e.preventDefault();
      e.stopPropagation();
      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';
      if (e.ctrlKey && keyName !== 'Control') keyName = `Ctrl+${keyName}`;
      if (e.altKey && keyName !== 'Alt') keyName = `Alt+${keyName}`;
      if (e.shiftKey && keyName !== 'Shift' && !keyName.includes('Ctrl+')) keyName = `Shift+${keyName}`;

      setTempHotkey(keyName);
      setIsRecordingHotkey(false);
      playChime(440, 660);
    }
  };

  // Save all adapted settings
  const handleSaveAndApply = () => {
    onUpdateWakeWord(tempWakeWord.trim().toLowerCase());
    onUpdateTriggerHotkey(tempHotkey);

    // Save hardware audio profile to localStorage
    const audioProfile = {
      selectedDeviceId,
      inputGain,
      noiseGateThreshold,
      echoCancellation,
      noiseSuppression,
      autoGainControl,
      wakeSensitivity,
      voiceMode,
      soundFeedback,
    };
    localStorage.setItem('abel_audio_hardware_profile', JSON.stringify(audioProfile));

    setCalibrationSuccess(true);
    playChime(440, 880);
    setTimeout(() => {
      setCalibrationSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-slate-950 border-2 border-amber-400/90 rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-6 shadow-[0_0_60px_rgba(251,191,36,0.35)] relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Studio Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Windows Microphone & Voice Adaptation Studio
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-full">
                  LIVE CALIBRATION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Fine-tune your Windows hardware microphone, filter ambient noise, train wake-word confidence, and bind global trigger hotkeys.
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

        {/* Live Audio Meter & Hardware Device Selector */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> 1. Select Microphone Device
              </span>
              <p className="text-xs text-slate-300 font-sans">Choose which physical or virtual microphone Abel AI listens to.</p>
            </div>

            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 font-sans focus:outline-none focus:border-amber-400 cursor-pointer min-w-[220px]"
            >
              {audioDevices.length > 0 ? (
                audioDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Microphone ${idx + 1}`}
                  </option>
                ))
              ) : (
                <option value="default">Default System Microphone</option>
              )}
            </select>
          </div>

          {/* Real-time Decibel / VU Meter Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Live Input Level & Noise Floor
              </span>
              <span className={`font-bold ${audioLevel > noiseGateThreshold ? 'text-amber-400' : 'text-slate-500'}`}>
                {audioLevel}% dBFS {audioLevel > noiseGateThreshold ? '(VOICE ACTIVE)' : '(SILENCE GATE)'}
              </span>
            </div>

            <div className="relative h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              {/* Noise gate marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                style={{ left: `${noiseGateThreshold}%` }}
                title={`Noise Gate Threshold (${noiseGateThreshold}%)`}
              />
              {/* Live dynamic VU level */}
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  audioLevel > noiseGateThreshold
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                    : 'bg-slate-700'
                }`}
                style={{ width: `${Math.max(2, audioLevel)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-sans">
              <span>-60 dB (Floor)</span>
              <span className="text-rose-400">Gate: {noiseGateThreshold}%</span>
              <span>0 dB (Peak)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Audio DSP & Noise Cancellation Settings */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> 2. Audio Processing & Noise Suppression (DSP)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Echo Cancellation</span>
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Noise Suppression</span>
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300">Auto Gain Control</span>
              <input
                type="checkbox"
                checked={autoGainControl}
                onChange={(e) => setAutoGainControl(e.target.checked)}
                className="accent-amber-400 w-4 h-4 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Microphone Gain Multiplier</span>
                <span className="text-amber-400 font-bold">{inputGain.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={inputGain}
                onChange={(e) => setInputGain(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Background Noise Gate</span>
                <span className="text-amber-400 font-bold">{noiseGateThreshold}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={noiseGateThreshold}
                onChange={(e) => setNoiseGateThreshold(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Wake-Word Adaptation & Live Training */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 3. Wake-Word Training & Voice Adaptation
            </span>
            {wakeDetected && (
              <span className="text-[10px] px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-full animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                ✓ WAKE DETECTED!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Custom Wake Word / Phrase:</label>
              <input
                type="text"
                value={tempWakeWord}
                onChange={(e) => setTempWakeWord(e.target.value)}
                placeholder="e.g. hey abel, abel, computer"
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-amber-300 font-bold text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Recognition Sensitivity</span>
                <span className="text-amber-400 font-bold">{wakeSensitivity}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={wakeSensitivity}
                onChange={(e) => setWakeSensitivity(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer pt-2"
              />
            </div>
          </div>

          {/* Real-time Voice Detection Sandbox */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                <Mic className="w-3 h-3 text-amber-400" /> Speak to test: Say <strong className="text-amber-300">"{tempWakeWord}"</strong> or any command
              </span>
              <button
                type="button"
                onClick={() => playChime(520, 880)}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" /> Test Chime
              </button>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono min-h-[38px] flex items-center justify-between">
              <span className={testTranscript ? 'text-amber-300' : 'text-slate-600 italic'}>
                {testTranscript ? `"${testTranscript}"` : 'Listening for your voice input...'}
              </span>
              {testTranscript && (
                <button
                  onClick={() => setTestTranscript('')}
                  className="text-[10px] text-slate-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Trigger Mode & Global Hotkey Binding */}
        <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" /> 4. Voice Trigger Mode & Keyboard Hotkey
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setVoiceMode('wake_word')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                voiceMode === 'wake_word'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <div>Wake-Word Only</div>
              <div className="text-[10px] font-normal opacity-80">Triggers on "{tempWakeWord}"</div>
            </button>

            <button
              type="button"
              onClick={() => setVoiceMode('push_to_talk')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                voiceMode === 'push_to_talk'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <div>Push-to-Talk Hotkey</div>
              <div className="text-[10px] font-normal opacity-80">Hold [{tempHotkey}] key</div>
            </button>

            <button
              type="button"
              onClick={() => setVoiceMode('always_listening')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                voiceMode === 'always_listening'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <div>Hybrid Mode</div>
              <div className="text-[10px] font-normal opacity-80">Wake word + Hotkey active</div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-300 font-sans">
              Global Microphone Activation Hotkey:
            </div>
            <button
              type="button"
              onClick={() => setIsRecordingHotkey(true)}
              className={`py-1.5 px-4 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                isRecordingHotkey
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-950 text-amber-300 border-amber-500/40 hover:border-amber-400'
              }`}
            >
              {isRecordingHotkey ? 'Press any key on keyboard...' : `[${tempHotkey}] (Click to Change)`}
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all cursor-pointer active:scale-98"
          >
            {calibrationSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Microphone Adapted &amp; Saved!</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Save &amp; Calibrate Windows Microphone</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
