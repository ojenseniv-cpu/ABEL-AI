import React from 'react';
import {
  PhoneCall,
  Mail,
  TrendingUp,
  Code2,
  Workflow,
  Calendar,
  Sliders,
  ShieldCheck,
  Radio,
  Zap,
  Terminal,
  Activity,
  Brain,
  Sparkles,
  Gamepad2,
  User,
  Users,
  Video,
  Monitor,
  Download,
} from 'lucide-react';
import { NavSection, VoicePersona, UserProfile } from '../types';

interface HeaderProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  unreadEmailsCount: number;
  activeCallCount: number;
  pendingTasksCount?: number;
  phoneStatus: string;
  activePersona?: VoicePersona;
  onPersonaChange?: (p: VoicePersona) => void;
  activeUser?: UserProfile;
  onOpenUserModal?: () => void;
  visibleModules?: Partial<Record<NavSection, boolean>>;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onSelectSection,
  unreadEmailsCount,
  activeCallCount,
  pendingTasksCount = 0,
  phoneStatus,
  activePersona = 'witty_female',
  onPersonaChange,
  activeUser,
  onOpenUserModal,
  visibleModules,
  onOpenInstallModal,
}) => {
  const allNavItems: {
    id: NavSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number | string;
  }[] = [
    {
      id: 'core',
      label: 'Abel Core',
      icon: Sparkles,
    },
    {
      id: 'portfolio',
      label: 'Crypto & Wealth',
      icon: TrendingUp,
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      icon: Brain,
    },
    {
      id: 'builder',
      label: 'Software Forge',
      icon: Gamepad2,
    },
    {
      id: 'tiktok',
      label: 'TikTok Studio',
      icon: Video,
    },
    {
      id: 'telephone',
      label: 'Shop Phone',
      icon: PhoneCall,
      badge: activeCallCount > 0 ? 'Live' : undefined,
    },
    {
      id: 'email',
      label: 'Email AI',
      icon: Mail,
      badge: unreadEmailsCount > 0 ? unreadEmailsCount : undefined,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'automations',
      label: 'Automations',
      icon: Workflow,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Sliders,
    },
  ];

  // Filter based on user's GUI customization preferences in Settings
  const navItems = allNavItems.filter(
    (item) => item.id === 'settings' || item.id === 'core' || visibleModules?.[item.id] !== false
  );

  return (
    <header
      id="main-header"
      className="bg-slate-950/90 backdrop-blur-md border-b border-amber-500/30 sticky top-0 z-40 text-slate-300 font-mono shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Top Banner / System Telemetry Bar */}
      <div className="border-b border-amber-500/20 bg-black/80 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-0.5 bg-slate-900 border border-amber-500/40 rounded-md text-amber-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold tracking-wide text-amber-300">ABEL AI ONLINE</span>
          </div>
          <span className="text-slate-800 hidden sm:inline">|</span>

          {/* Quick Voice Persona Switcher */}
          {onPersonaChange && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[11px]">
              <span className="text-slate-400 text-[10px]">VOICE:</span>
              <button
                onClick={() => onPersonaChange('witty_female')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  activePersona === 'witty_female'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Witty & Sarcastic Female AI"
              >
                👑 Witty
              </button>
              <button
                onClick={() => onPersonaChange('the_joker')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  activePersona === 'the_joker'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="The Joker Mastermind"
              >
                🃏 Joker
              </button>
              <button
                onClick={() => onPersonaChange('t1800_arnold')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  activePersona === 't1800_arnold'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="T-1800 Cybernetic Arnold"
              >
                🤖 T-1800
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>SHOP LINE:</span>
              <strong className="text-amber-300 font-medium">
                {phoneStatus === 'online_ai' ? 'AI SECRETARY' : 'FORWARDING'}
              </strong>
            </span>
            <span className="text-slate-800">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>ANTI-GRAVITY:</span>
              <strong className="text-slate-300 font-medium">SYNC READY</strong>
            </span>
          </div>
        </div>

        {/* User Account / Device Switcher & Windows Install Action */}
        <div className="flex items-center gap-2 text-[11px]">
          {activeUser && (
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-xl text-amber-300 hover:text-white transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                {activeUser.name.charAt(0) || 'U'}
              </div>
              <span className="font-bold">{activeUser.name || 'Primary Profile'}</span>
              <span className="text-[9px] text-slate-400">({activeUser.role.split(' ')[0]})</span>
            </button>
          )}

          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-[10px] shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer transition-transform active:scale-95"
            title="Install Abel AI on Windows Desktop"
          >
            <Monitor className="w-3.5 h-3.5 text-slate-950" />
            <span>Install on Windows</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 sm:px-6 py-3 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          onClick={() => onSelectSection('core')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)] group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
              Abel <span className="text-amber-400 font-black">AI</span>
              <span className="text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40 uppercase">
                BLACK &amp; GOLD v5.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Autonomous Operating System • Built for Creators &amp; Executives
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          id="nav-tabs"
          className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400/80'}`} />
                <span>{item.label}</span>

                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
