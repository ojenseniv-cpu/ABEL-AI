import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  Gamepad2,
  Code2,
  Wrench,
  Bot,
  User,
  ArrowRight,
  Zap,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import {
  BrainstormSession,
  BrainstormMessage,
  VoicePersona,
  BuilderProject,
  NavSection,
} from '../types';

interface BrainstormStudioProps {
  sessions: BrainstormSession[];
  activePersona: VoicePersona;
  onConvertToProject: (project: Partial<BuilderProject>) => void;
  onNavigate: (section: NavSection) => void;
  onTriggerAutomation?: (event: string, details: string) => void;
}

export const BrainstormStudio: React.FC<BrainstormStudioProps> = ({
  sessions: initialSessions,
  activePersona,
  onConvertToProject,
  onNavigate,
  onTriggerAutomation,
}) => {
  const [sessions, setSessions] = useState<BrainstormSession[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessions[0]?.id || 'bs-1'
  );
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetDomain, setTargetDomain] = useState<
    'video_game' | 'business_app' | 'shop_utility' | 'automation' | 'creative'
  >('video_game');

  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const userMsgText = inputText.trim();
    setInputText('');

    const userMsg: BrainstormMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      persona: activePersona,
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedSession: BrainstormSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMsg],
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === currentSession.id ? updatedSession : s))
    );

    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/chat-brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedSession.messages,
          userMessage: userMsgText,
          persona: activePersona,
          domain: targetDomain,
        }),
      });

      const data = await res.json();
      setIsGenerating(false);

      const aiMsg: BrainstormMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'abel',
        persona: activePersona,
        text: data.reply || 'Concept mapped and ready for compilation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedIdeas: data.extractedIdeas,
        actionPlanReady: data.actionPlanReady,
      };

      const finalKeyFeatures = Array.from(
        new Set([...(currentSession.keyFeatures || []), ...(data.extractedIdeas || [])])
      );

      const finalSession: BrainstormSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMsg],
        keyFeatures: finalKeyFeatures,
        readyForCodegen: data.actionPlanReady ?? true,
        projectDraftPrompt:
          data.projectDraftPrompt ||
          `Build an interactive ${targetDomain} incorporating: ${finalKeyFeatures.join(', ')}`,
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === currentSession.id ? finalSession : s))
      );

      if (onTriggerAutomation) {
        onTriggerAutomation(
          'brainstorm_updated',
          `Abel AI Brainstorm (${activePersona}): ${data.extractedIdeas?.join(' • ') || userMsgText}`
        );
      }
    } catch (err) {
      console.error('Brainstorm error:', err);
      setIsGenerating(false);
    }
  };

  const handleConvertAndBuild = () => {
    const draftTitle = currentSession.title || 'Abel AI Custom Program';
    const draftPrompt =
      currentSession.projectDraftPrompt ||
      `Build a complete ${targetDomain} featuring: ${currentSession.keyFeatures.join(', ')}`;

    onConvertToProject({
      title: draftTitle,
      prompt: draftPrompt,
      type: targetDomain === 'video_game' ? 'video_game' : 'application',
      strictConstraints: currentSession.keyFeatures,
      negativeConstraints: [
        'No unrequested authentication screens',
        'No external broken paywalls',
      ],
    });

    onNavigate('builder');
  };

  const handleCreateNewSession = () => {
    const newSession: BrainstormSession = {
      id: `bs-${Date.now()}`,
      title: 'New Creative Game / App Idea',
      targetDomain: 'video_game',
      targetAudience: 'Teens & Creators (14y)',
      readyForCodegen: false,
      keyFeatures: [],
      messages: [
        {
          id: `bm-init-${Date.now()}`,
          sender: 'abel',
          persona: activePersona,
          text:
            activePersona === 't1800_arnold'
              ? 'Target acquired. What mission or video game shall we build today? Speak your parameters.'
              : activePersona === 'the_joker'
              ? 'Well well well! What mischievous new game or software are we cooking up today? Let us make it wild!'
              : 'Hey there! What are we building today? A video game, a shop tool, or something completely new?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-amber-500/40 p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Abel AI Brainstorming Studio
              </h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold border border-amber-400/40">
                ACTIVE PERSONA: {activePersona.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Talk, ideate, and convert creative concepts directly into playable video games &amp; programs
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewSession}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all self-start md:self-auto shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer"
        >
          + New Brainstorm Session
        </button>
      </div>

      {/* Main Studio Grid: Sessions List / Chat Interface / Extracted Idea Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Saved Sessions (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
            Brainstorm Rooms ({sessions.length})
          </span>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {sessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/60'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-300 line-clamp-1">
                      {session.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{session.messages.length} exchanges</span>
                    <span className="text-amber-400/80 uppercase font-bold text-[9px]">
                      {session.targetDomain.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Live Chat with Abel AI (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 flex flex-col h-[580px] shadow-md">
          {/* Domain Picker Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Target Type:</span>
              <select
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="video_game">🎮 2D Video Game / Arcade</option>
                <option value="business_app">💼 Business &amp; Executive App</option>
                <option value="shop_utility">🔧 Workshop Utility / Fastener Tool</option>
                <option value="automation">⚡ Cross-Module Automation</option>
                <option value="creative">✨ Creative Simulator</option>
              </select>
            </div>
            <span className="text-[10px] text-slate-500">{currentSession.title}</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {currentSession.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                      {msg.persona === 'the_joker' ? '🃏' : msg.persona === 't1800_arnold' ? '🤖' : '👑'}
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      isUser
                        ? 'bg-amber-400 text-slate-950 font-bold rounded-tr-none shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.extractedIdeas && msg.extractedIdeas.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                          ★ Extracted Game &amp; App Features:
                        </span>
                        <ul className="space-y-0.5 list-disc list-inside text-[11px] text-slate-300">
                          {msg.extractedIdeas.map((idea, idx) => (
                            <li key={idx}>{idea}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div
                      className={`text-[9px] ${
                        isUser ? 'text-slate-800' : 'text-slate-500'
                      } text-right`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex gap-3 text-xs items-center text-amber-400 animate-pulse p-2">
                <Bot className="w-5 h-5" />
                <span>Abel AI is synthesizing creative mechanics in {activePersona} voice...</span>
              </div>
            )}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Let's make a 2D space shooter with gold coins and lasers..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(251,191,36,0.3)] cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Extracted Feature Blueprint & 1-Click Codegen (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/70 border border-amber-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-md space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
              <Lightbulb className="w-4 h-4" />
              <span>Extracted Blueprint</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Features Ready to Build:
              </span>
              {currentSession.keyFeatures && currentSession.keyFeatures.length > 0 ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {currentSession.keyFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-amber-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
                  Chat with Abel AI to extract gameplay mechanics or application features.
                </p>
              )}
            </div>
          </div>

          {/* 1-Click Code Generation Trigger */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400">
              Transform this brainstorm into an executable program inside the Software Forge:
            </div>
            <button
              onClick={handleConvertAndBuild}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              Compile into Software Forge
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
