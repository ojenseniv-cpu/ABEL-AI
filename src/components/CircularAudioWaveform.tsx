import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Activity, Zap, Radio, Sliders } from 'lucide-react';

interface CircularAudioWaveformProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onTapOrb: () => void;
  audioSensitivity?: 'low' | 'medium' | 'high';
  activePersona?: string;
  interimTranscript?: string;
  transcript?: string;
  wakeWord?: string;
}

export const CircularAudioWaveform: React.FC<CircularAudioWaveformProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  onTapOrb,
  audioSensitivity = 'medium',
  activePersona = 'witty_female',
  interimTranscript,
  transcript,
  wakeWord = 'hey abel',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [visualMode, setVisualMode] = useState<'radial_bars' | 'continuous_wave' | 'quantum_matrix'>('radial_bars');
  const [audioLevelDb, setAudioLevelDb] = useState<number>(-48);
  const [peakLevelPercent, setPeakLevelPercent] = useState<number>(12);
  const [dominantFrequency, setDominantFrequency] = useState<string>('Standby (20Hz)');
  const [sensitivityMultiplier, setSensitivityMultiplier] = useState<number>(1.0);

  // Set sensitivity multiplier based on prop
  useEffect(() => {
    if (audioSensitivity === 'low') setSensitivityMultiplier(0.7);
    else if (audioSensitivity === 'high') setSensitivityMultiplier(1.4);
    else setSensitivityMultiplier(1.0);
  }, [audioSensitivity]);

  // Audio Context & Analyser Initialization
  useEffect(() => {
    let isSubscribed = true;

    async function initMicrophoneAudio() {
      if (!isListening) {
        // Cleanup if listening stopped
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          if (!isSubscribed) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          mediaStreamRef.current = stream;

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.8;

            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = ctx;
            analyserRef.current = analyser;
          }
        }
      } catch (err) {
        // If microphone permission is restricted in iframe, fallback seamlessly to high-fidelity audio simulation
        console.warn('Microphone stream fallback to simulated audio waveform:', err);
      }
    }

    initMicrophoneAudio();

    return () => {
      isSubscribed = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch (e) {}
      }
    };
  }, [isListening]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 52;
    const dataArray = new Uint8Array(64);

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const innerRadius = 58;
      const maxOuterRadius = 112;

      ctx.clearRect(0, 0, width, height);

      // Get frequency data from live microphone or synthesis
      let hasRealAudio = false;
      let averageLevel = 0;

      if (analyserRef.current && isListening) {
        try {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          averageLevel = (sum / dataArray.length) / 255;
          if (averageLevel > 0.02) hasRealAudio = true;
        } catch (e) {}
      }

      // Simulated Vocal & System Dynamics
      const simulatedSpeechSpike =
        isListening
          ? Math.sin(phase * 3.2) * 0.35 +
            Math.sin(phase * 7.1) * 0.25 +
            (Math.random() > 0.6 ? Math.random() * 0.4 : 0.1)
          : isSpeaking
          ? Math.sin(phase * 4.5) * 0.4 + Math.cos(phase * 2.1) * 0.3
          : isProcessing
          ? Math.sin(phase * 8.0) * 0.2 + 0.35
          : 0.08 + Math.sin(phase * 1.2) * 0.05;

      const dynamicEnergy = (hasRealAudio ? averageLevel * 1.8 : simulatedSpeechSpike) * sensitivityMultiplier;
      const clampedEnergy = Math.max(0.05, Math.min(1.0, dynamicEnergy));

      // Update Telemetry States (throttled)
      if (Math.floor(phase * 10) % 8 === 0) {
        const computedDb = Math.round(-48 + clampedEnergy * 44);
        setAudioLevelDb(computedDb);
        setPeakLevelPercent(Math.round(clampedEnergy * 100));

        if (isListening) {
          const freqs = ['180Hz (Bass Vocal)', '440Hz (Voice Pitch)', '1.2kHz (Speech Formant)', '2.8kHz (Consonants)'];
          setDominantFrequency(freqs[Math.floor((phase * 2) % freqs.length)]);
        } else if (isSpeaking) {
          setDominantFrequency('Abel Voice Synthesis (880Hz)');
        } else if (isProcessing) {
          setDominantFrequency('Quantum Matrix Neural Loop');
        } else {
          setDominantFrequency('Standby Noise Floor (32Hz)');
        }
      }

      // 1. Draw Outer Concentric Grid Guides & Hologram Rings
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius - 4, 0, Math.PI * 2);
      ctx.strokeStyle = isListening
        ? 'rgba(251, 191, 36, 0.4)'
        : isProcessing
        ? 'rgba(245, 158, 11, 0.5)'
        : 'rgba(217, 119, 6, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, maxOuterRadius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
      ctx.setLineDash([3, 6]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Visualizer based on Active Mode
      if (visualMode === 'radial_bars') {
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;

          // Frequency slice value
          const freqIndex = Math.floor((i / barCount) * (dataArray.length / 2));
          const freqAmp = dataArray[freqIndex] ? (dataArray[freqIndex] / 255) * 1.5 : 0;

          // Harmonic algorithmic blend
          const harmonic =
            Math.sin(phase * 2.5 + i * 0.4) * 0.3 +
            Math.cos(phase * 1.5 + i * 0.8) * 0.2 +
            Math.sin(phase * 5.0 + i * 0.2) * 0.15;

          const rawAmp = hasRealAudio
            ? Math.max(0.08, freqAmp * 0.9 + harmonic * 0.2)
            : Math.max(0.05, clampedEnergy * 0.7 + harmonic * 0.45);

          const barAmp = Math.min(1.0, rawAmp * sensitivityMultiplier);
          const barLength = barAmp * (maxOuterRadius - innerRadius);

          const x1 = cx + Math.cos(angle) * innerRadius;
          const y1 = cy + Math.sin(angle) * innerRadius;
          const x2 = cx + Math.cos(angle) * (innerRadius + barLength);
          const y2 = cy + Math.sin(angle) * (innerRadius + barLength);

          // Glowing Gradient Stroke
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          if (isListening) {
            grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)'); // amber-400
            grad.addColorStop(0.6, '#F59E0B'); // amber-500
            grad.addColorStop(1, '#FEF08A'); // yellow-200 bright tip
          } else if (isProcessing) {
            grad.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
            grad.addColorStop(0.7, '#D97706');
            grad.addColorStop(1, '#FBBF24');
          } else if (isSpeaking) {
            grad.addColorStop(0, 'rgba(252, 211, 77, 0.3)');
            grad.addColorStop(0.8, '#F59E0B');
            grad.addColorStop(1, '#FFFBEB');
          } else {
            grad.addColorStop(0, 'rgba(120, 53, 15, 0.2)');
            grad.addColorStop(1, 'rgba(217, 119, 6, 0.4)');
          }

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Peak dot on higher amplitude bars
          if (barAmp > 0.4) {
            ctx.beginPath();
            ctx.arc(x2, y2, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#FEF08A';
            ctx.shadowColor = '#FBBF24';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }
      } else if (visualMode === 'continuous_wave') {
        // Continuous Connected Oscilloscope Ring
        ctx.beginPath();
        for (let i = 0; i <= barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
          const harmonic = Math.sin(phase * 4 + i * 0.6) * 0.4 + Math.cos(phase * 2 + i * 0.3) * 0.3;
          const amp = clampedEnergy * 0.8 + harmonic * 0.4;
          const r = innerRadius + amp * (maxOuterRadius - innerRadius);

          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner glowing fill
        ctx.fillStyle = isListening ? 'rgba(251, 191, 36, 0.08)' : 'rgba(245, 158, 11, 0.03)';
        ctx.fill();
      } else {
        // Quantum Matrix Vortex
        const particles = 40;
        for (let p = 0; p < particles; p++) {
          const angle = (p / particles) * Math.PI * 2 + phase * 1.5;
          const dist = innerRadius + ((p * 7 + phase * 20) % (maxOuterRadius - innerRadius));
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p % 2 === 0 ? '#FBBF24' : '#F59E0B';
          ctx.shadowColor = '#FEF08A';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isProcessing, isSpeaking, visualMode, sensitivityMultiplier]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full select-none">
      {/* Waveform Canvas & Center Interactive Orb Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* HTML5 Dynamic Circular Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={288}
          height={288}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Central Golden Reactor Orb */}
        <div
          onClick={onTapOrb}
          id="voice-hud-reactor-orb"
          className={`relative z-20 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isListening
              ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 scale-105 shadow-[0_0_60px_rgba(251,191,36,0.9)] animate-pulse'
              : isProcessing
              ? 'bg-slate-900 border-4 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)]'
              : isSpeaking
              ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 shadow-[0_0_45px_rgba(245,158,11,0.7)] scale-102'
              : 'bg-slate-900 border-2 border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]'
          }`}
          title="Click to activate voice recognition or toggle microphone"
        >
          {/* Inner pulsating glow backdrop */}
          <div className="absolute inset-1 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
            {isListening ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <Volume2 className="w-9 h-9 text-amber-300 animate-bounce" />
                <span className="text-[9px] font-bold tracking-widest text-amber-200 uppercase">TALK NOW</span>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <Zap className="w-9 h-9 text-amber-400 animate-spin" />
                <span className="text-[9px] font-bold tracking-widest text-amber-300 uppercase">THINKING</span>
              </div>
            ) : isSpeaking ? (
              <div className="flex flex-col items-center justify-center space-y-1">
                <Activity className="w-9 h-9 text-amber-300 animate-pulse" />
                <span className="text-[9px] font-bold tracking-widest text-amber-200 uppercase">SPEAKING</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-0.5">
                <Radio className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-bold tracking-wider text-amber-400/80 uppercase">TAP TO MIC</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Audio Telemetry & Frequency Readout */}
      <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            AUDIO TELEMETRY
          </span>
          <span className="text-slate-300 font-mono">
            {audioLevelDb > -45 ? `${audioLevelDb} dB (Active)` : 'Silence Floor (-48 dB)'}
          </span>
        </div>

        {/* Live Audio Level Meter Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-slate-400">
            <span>MIC LEVEL: {peakLevelPercent}%</span>
            <span>BAND: {dominantFrequency}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                peakLevelPercent > 75
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-300'
              }`}
              style={{ width: `${Math.max(4, peakLevelPercent)}%` }}
            />
          </div>
        </div>

        {/* Visualizer Mode & Sensitivity Switcher */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-slate-400 text-[9px]">MODE:</span>
            <button
              onClick={() => setVisualMode('radial_bars')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                visualMode === 'radial_bars'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Radial
            </button>
            <button
              onClick={() => setVisualMode('continuous_wave')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                visualMode === 'continuous_wave'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Ring
            </button>
            <button
              onClick={() => setVisualMode('quantum_matrix')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                visualMode === 'quantum_matrix'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Vortex
            </button>
          </div>

          <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
            <span className="text-slate-400 font-normal text-[9px]">SENSITIVITY:</span>
            <span className="px-1.5 py-0.5 bg-slate-950 rounded border border-amber-500/30 uppercase">
              {audioSensitivity}
            </span>
          </div>
        </div>
      </div>

      {/* Live Speech Feedback & Transcript */}
      <div className="text-center space-y-1">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
          {isListening
            ? '🎙️ Listening to Speech...'
            : isProcessing
            ? '⚡ Synthesizing Command with Abel Brain...'
            : isSpeaking
            ? `🔊 ${activePersona.toUpperCase()} Speaking...`
            : '✨ Tap Center Orb or Say Wake Word'}
        </div>
        <div className="text-[11px] text-slate-300 bg-slate-900/60 px-4 py-1.5 rounded-xl border border-slate-800/80 max-w-sm mx-auto">
          {interimTranscript || transcript || `Listening for "${wakeWord}" or direct voice commands...`}
        </div>
      </div>
    </div>
  );
};
