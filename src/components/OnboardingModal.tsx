import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Users,
  Terminal,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile) => void;
  existingUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  existingUsers,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'new_user' | 'existing_user'>('new_user');
  const [name, setName] = useState('Alex Jensen');
  const [email, setEmail] = useState('alex.jensen@gmail.com');
  const [role, setRole] = useState('Lead Architect & Executive');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role: role.trim() || 'Operator',
      avatarColor: 'from-amber-400 to-yellow-600',
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    };

    onComplete(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border-2 border-amber-500/50 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden font-mono text-slate-200">
        {/* Top Gold Glowing Hologram Effect */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Terminal className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">
            Welcome to <span className="text-amber-400">Abel AI</span>
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous Executive Operating System • Multi-Device Device Setup
          </p>
        </div>

        {/* User Mode Tabs */}
        {existingUsers.length > 0 && (
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('new_user')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'new_user'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Register New Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('existing_user')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'existing_user'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Switch User ({existingUsers.length})
            </button>
          </div>
        )}

        {activeTab === 'new_user' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Full Name / Operator Handle
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Jensen or Leo (Creator)"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Primary Registration Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Used for email intelligence triage, alert notifications, and multi-device identity syncing.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Device Role / Experience Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white focus:outline-none transition-colors"
              >
                <option value="Lead Architect & Executive">Lead Architect & Executive (Full Control)</option>
                <option value="Game Developer & Creative Lead (14y)">Game Developer & Creative Lead (14y - Easy Builder Mode)</option>
                <option value="Workshop & Shop Specialist">Workshop & Shop Specialist (Phone & Bookings)</option>
                <option value="Junior Creator (Kid Safe)">Junior Creator (Simple 1-Click Game Builder)</option>
              </select>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Voice activation enabled with customizable keyboard trigger and wake word.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Launch Abel AI Core
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-slate-400 text-[11px]">
              Select an existing user profile configured on this system or network:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => onSwitchUser(u)}
                  className="flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/60 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${u.avatarColor} flex items-center justify-center text-slate-950 font-bold text-xs`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-lg">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
