import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Gamepad2,
  Brain,
  Code2,
  PhoneCall,
  Mail,
  TrendingUp,
  Calendar,
  Zap,
  Sliders,
  Radio,
  Volume2,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Video,
} from 'lucide-react';
import {
  NavSection,
  VoiceConfig,
  VoicePersona,
  PersonalProfile,
  StockHolding,
  CryptoHolding,
  CalendarTask,
  BuilderProject,
  EmailItem,
} from '../types';

interface AbelCoreHomeProps {
  profile: PersonalProfile;
  voiceConfig: VoiceConfig;
  onUpdateVoiceConfig: (config: VoiceConfig) => void;
  onNavigate: (section: NavSection) => void;
  stocks: StockHolding[];
  crypto: CryptoHolding[];
  tasks: CalendarTask[];
  builderProjects: BuilderProject[];
  emails: EmailItem[];
  onTriggerVoiceHUD: () => void;
}

export const AbelCoreHome: React.FC<AbelCoreHomeProps> = ({
  profile,
  voiceConfig,
  onUpdateVoiceConfig,
  onNavigate,
  stocks,
  crypto,
  tasks,
  builderProjects,
  emails,
  onTriggerVoiceHUD,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(
    voiceConfig.activePersona || 'witty_female'
  );

  const personas = [
    {
      id: 'witty_female' as VoicePersona,
      title: 'Witty & Sarcastic Female AI',
      subtitle: 'Razor-sharp, playfully sarcastic, flawless genius intellect',
      icon: '👑',
      tag: 'DEFAULT MODE',
      previewQuote: '"Oh, brilliant. Let me build that game before you can even find your coffee."',
    },
    {
      id: 'the_joker' as VoicePersona,
      title: 'The Joker (Gotham Mastermind)',
      subtitle: 'Dark Knight chaotic genius, theatrical flair, charismatic madness',
      icon: '🃏',
      tag: 'THEATRICAL FLAIR',
      previewQuote: '"Why so serious? Let’s put a golden smile on this codebase and make chaos!"',
    },
    {
      id: 't1800_arnold' as VoicePersona,
      title: 'T-1800 Cybernetic Cyborg',
      subtitle: 'Arnold Schwarzenegger Austrian action cadence, indestructible logic',
      icon: '🤖',
      tag: 'CYBERDYNE OS',
      previewQuote: '"Hasta la vista, software bugs. Target locked. I will compile your video game."',
    },
  ];

  const handlePersonaChange = (p: VoicePersona) => {
    setSelectedPersona(p);
    onUpdateVoiceConfig({
      ...voiceConfig,
      activePersona: p,
    });
  };

  // Calculations
  const stockTotal = stocks.reduce((acc, s) => acc + s.shares * s.currentPrice, 0);
  const cryptoTotal = crypto.reduce((acc, c) => acc + c.amount * c.currentPrice, 0);
  const portfolioTotal = stockTotal + cryptoTotal;
  const unreadEmails = emails.filter((e) => !e.read).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-8 font-mono text-slate-200">
      {/* Top Hero Banner with Golden Reactor & AI Identity */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border-2 border-amber-500/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Holographic Gold Glow Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12)_0,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Persona Greeting & Quick Actions */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-400/40 rounded-full text-amber-400 text-xs font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ABEL AI • AUTONOMOUS EXECUTIVE OS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              Ready, <span className="text-amber-400">{profile.activeUser?.name || profile.fullName}</span>.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Active Voice Persona:{' '}
              <strong className="text-amber-300">
                {personas.find((p) => p.id === selectedPersona)?.title}
              </strong>
              . Press your hotkey{' '}
              <span className="px-2 py-0.5 bg-slate-900 border border-amber-400/60 rounded text-amber-300 font-bold">
                [{voiceConfig.triggerKeyDisplay || 'Space'}]
              </span>{' '}
              or tap the reactor below to speak.
            </p>

            {/* Persona Voice Selector Pills */}
            <div className="pt-2">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest block mb-2 font-bold">
                Select Persona Voice:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {personas.map((persona) => {
                  const isActive = selectedPersona === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handlePersonaChange(persona.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_20px_rgba(251,191,36,0.35)] ring-1 ring-amber-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{persona.icon}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] leading-tight text-amber-200">
                        {persona.title.split(' ')[0]} {persona.title.split(' ')[1]}
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                        {persona.tag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Quote Preview */}
            <div className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-xl text-xs italic text-amber-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{personas.find((p) => p.id === selectedPersona)?.previewQuote}</span>
            </div>
          </div>

          {/* Right / Center: Prominent Golden Voice Detection Reactor Pulse */}
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Golden Concentric Rings */}
              <div className="absolute w-56 h-56 rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-amber-400/40 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute w-40 h-40 rounded-full border border-amber-400/50 animate-pulse shadow-[0_0_30px_rgba(251,191,36,0.3)]" />

              {/* Main Interactive Reactor Core Button */}
              <button
                id="abel-reactor-orb"
                onClick={onTriggerVoiceHUD}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-10 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-950/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="w-7 h-7 text-slate-950" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest mt-1 text-slate-950">
                  ABEL AI
                </span>
                <span className="text-[8px] font-bold text-slate-900">
                  PRESS [{voiceConfig.triggerKeyDisplay || 'Space'}]
                </span>
              </button>
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Voice Reactor Online
              </span>
              <p className="text-[11px] text-slate-400">
                Wake Word: <strong className="text-amber-300">"{voiceConfig.wakeWord || 'hey abel'}"</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Brainstorming Room */}
        <div
          onClick={() => onNavigate('brainstorm')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 rounded-2xl cursor-pointer transition-all shadow-md group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              <Brain className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-300 transition-colors">
              Brainstorm Studio
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ideate video games, apps, &amp; utilities with Abel AI in any persona voice.
            </p>
          </div>
        </div>

        {/* Software & Game Forge */}
        <div
          onClick={() => onNavigate('builder')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 rounded-2xl cursor-pointer transition-all shadow-md group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
              {builderProjects.length} Ready
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-300 transition-colors">
              Software &amp; Game Forge
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Write video games &amp; tools with live status bar &amp; Approve / Deploy buttons.
            </p>
          </div>
        </div>

        {/* Shop Telephone Secretary */}
        <div
          onClick={() => onNavigate('telephone')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 rounded-2xl cursor-pointer transition-all shadow-md group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
              Live AI Line
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-300 transition-colors">
              Shop AI Secretary
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Answers phone calls, quotes shop labor, &amp; schedules customer repair bookings.
            </p>
          </div>
        </div>

        {/* TikTok Studio & Google Veo */}
        <div
          onClick={() => onNavigate('tiktok')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 rounded-2xl cursor-pointer transition-all shadow-md group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
              Google Veo 3.1
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-300 transition-colors">
              TikTok Video Studio
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Text a video idea with Google AI, review 9:16 storyboards, and post live to your TikTok.
            </p>
          </div>
        </div>

        {/* Wealth Terminal */}
        <div
          onClick={() => onNavigate('portfolio')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 rounded-2xl cursor-pointer transition-all shadow-md group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              ${portfolioTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-300 transition-colors">
              Wealth Terminal
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Live stock &amp; crypto watchtower with quantitative risk sentinel alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Spoken Commands / Child-Friendly Prompts */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" /> Quick Spoken Commands (Click to Test):
          </span>
          <span className="text-[10px] text-slate-500">Press [{voiceConfig.triggerKeyDisplay}] anytime</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {[
            'Abel, make a TikTok video about our twin turbo dyno pull',
            'Abel, open TikTok Studio',
            'Abel, build a 2D space arcade video game with gold laser cannons',
            'Brainstorm game ideas for my 14 year old son',
            'Schedule GT3 dyno session for tomorrow at 9 AM',
            'Triage all unread shop emails',
            'Show me stock and crypto holdings',
            'Switch voice persona to The Joker',
            'Switch voice persona to Arnold Terminator',
          ].map((cmd, i) => (
            <button
              key={i}
              onClick={onTriggerVoiceHUD}
              className="text-xs px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-900 text-slate-300 hover:text-amber-300 rounded-xl transition-all font-mono text-left cursor-pointer"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
