import React, { useState } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  Sliders,
} from 'lucide-react';
import { EmailItem, EmailAccountType, PersonalProfile } from '../types';

interface EmailIntelligenceProps {
  emails: EmailItem[];
  personalProfile: PersonalProfile;
  onUpdateEmail: (email: EmailItem) => void;
  onAddEmail: (email: EmailItem) => void;
  onTriggerAutomation?: (trigger: string, details: string) => void;
}

export const EmailIntelligence: React.FC<EmailIntelligenceProps> = ({
  emails,
  personalProfile,
  onUpdateEmail,
  onAddEmail,
  onTriggerAutomation,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<'all' | EmailAccountType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);

  // Custom draft & tone editor
  const [activeDraft, setActiveDraft] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [selectedTone, setSelectedTone] = useState(personalProfile.personalTone);

  // New Email Simulation Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simAccount, setSimAccount] = useState<EmailAccountType>('company');
  const [simFrom, setSimFrom] = useState('');
  const [simFromEmail, setSimFromEmail] = useState('');
  const [simSubject, setSimSubject] = useState('');
  const [simBody, setSimBody] = useState('');

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  // Filter emails based on account, category, search
  const filteredEmails = emails.filter((e) => {
    if (selectedAccountId !== 'all' && e.account !== selectedAccountId) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.subject.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectEmail = (email: EmailItem) => {
    setSelectedEmailId(email.id);
    setActiveDraft(email.suggestedReply || '');
    if (!email.read) {
      onUpdateEmail({ ...email, read: true });
    }
  };

  const handleSendReply = () => {
    if (!selectedEmail || !activeDraft.trim()) return;

    const updated: EmailItem = {
      ...selectedEmail,
      isAutoReplied: true,
      repliedAt: 'Just now',
    };
    onUpdateEmail(updated);

    if (onTriggerAutomation) {
      onTriggerAutomation('email_reply_sent', `Reply dispatched to ${selectedEmail.from}`);
    }
  };

  const handleCreateInboundEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simFrom.trim() || !simSubject.trim()) return;

    const newMail: EmailItem = {
      id: `mail-${Date.now()}`,
      account: simAccount,
      from: simFrom.trim(),
      fromEmail: simFromEmail.trim() || `${simFrom.toLowerCase().replace(/\s+/g, '')}@customer.com`,
      to: simAccount === 'google' ? personalProfile.ownerEmail : personalProfile.companyEmail,
      subject: simSubject.trim(),
      snippet: simBody.trim().slice(0, 100) + '...',
      body: simBody.trim(),
      date: 'Just now',
      read: false,
      priority: 'high',
      category: 'customer_lead',
      sentiment: 'positive',
      actionItems: ['Review customer request and send confirmation'],
      suggestedReply: `Hi ${simFrom},\n\nThank you for reaching out to Abel AI. We received your note regarding "${simSubject}" and have scheduled a follow-up.`,
    };

    onAddEmail(newMail);
    setSelectedEmailId(newMail.id);
    setActiveDraft(newMail.suggestedReply || '');
    setShowSimulateModal(false);

    setSimFrom('');
    setSimFromEmail('');
    setSimSubject('');
    setSimBody('');
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-amber-500/40 p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Email Intelligence &amp; Autonomous Lead Triage
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-400/40 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Live Mail Monitor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-inbox lead triage, priority extraction, and autonomous draft responder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsAutoPilot(!isAutoPilot)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isAutoPilot
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutoPilot ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>AUTO-PILOT: <strong className={isAutoPilot ? 'text-amber-400' : 'text-slate-500'}>{isAutoPilot ? 'ONLINE' : 'OFFLINE'}</strong></span>
          </button>

          <button
            onClick={() => setShowSimulateModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Inbound Email
          </button>
        </div>
      </div>

      {/* Main 2-Column Email Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inbox..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border-2 border-amber-500/30 rounded-3xl text-slate-400 text-xs space-y-3">
                <Inbox className="w-8 h-8 text-amber-400/50 mx-auto" />
                <div className="font-bold text-white">No Emails in Inbox</div>
                <p className="text-slate-400 max-w-xs mx-auto">
                  Connect your Google Workspace or Company email in Settings, or simulate an inbound test lead.
                </p>
                <button
                  onClick={() => setShowSimulateModal(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  + Simulate Inbound Lead
                </button>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    } ${!email.read ? 'border-l-4 border-l-amber-400' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{email.from}</span>
                      <span className="text-[10px] text-slate-500">{email.date}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-amber-300 line-clamp-1 mb-1">{email.subject}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{email.snippet}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail & Reply */}
        <div className="lg:col-span-7">
          {selectedEmail ? (
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-md">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{selectedEmail.subject}</h3>
                  <span className="text-xs text-amber-400 font-bold">[{selectedEmail.date}]</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  From: <strong className="text-white">{selectedEmail.from}</strong> &lt;{selectedEmail.fromEmail}&gt;
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedEmail.body}
              </div>

              {/* Suggested Reply Box */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase text-amber-400">
                  AI Synthesized Response Draft:
                </label>
                <textarea
                  rows={4}
                  value={activeDraft}
                  onChange={(e) => setActiveDraft(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-2xl p-4 text-xs text-white"
                />
                <button
                  onClick={handleSendReply}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Send Autonomous Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-950 border-2 border-slate-800 rounded-3xl text-slate-500 text-xs">
              Select an email from the left pane to view intelligence triage and drafts.
            </div>
          )}
        </div>
      </div>

      {/* Simulate Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateInboundEmail}
            className="bg-slate-950 border-2 border-amber-400/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                Simulate Inbound Email
              </h3>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">From Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mike Henderson"
                  value={simFrom}
                  onChange={(e) => setSimFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Need transmission repair estimate"
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Body</label>
                <textarea
                  rows={3}
                  placeholder="Hello, I heard you specialize in custom tuning..."
                  value={simBody}
                  onChange={(e) => setSimBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="flex-1 py-2.5 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!simFrom.trim() || !simSubject.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Inject Email
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
