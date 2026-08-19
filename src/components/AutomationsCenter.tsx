import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Zap,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { AutomationRule } from '../types';

interface AutomationsCenterProps {
  rules: AutomationRule[];
  onUpdateRules: (rules: AutomationRule[]) => void;
  recentLogs: { id: string; timestamp: string; message: string }[];
}

export const AutomationsCenter: React.FC<AutomationsCenterProps> = ({
  rules,
  onUpdateRules,
  recentLogs,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newTrigger, setNewTrigger] = useState<string>('call_booking_created');
  const [newAction, setNewAction] = useState<string>('auto_email_customer');

  const toggleRule = (id: string) => {
    onUpdateRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteRule = (id: string) => {
    onUpdateRules(rules.filter((r) => r.id !== id));
  };

  const handleCreateRule = () => {
    if (!newRuleName.trim()) {
      alert('Please provide a rule name.');
      return;
    }

    const created: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      description: newRuleDesc || 'Custom automation pipeline connecting cross-module events.',
      triggerEvent: newTrigger,
      conditions: 'true',
      actions: [newAction],
      enabled: true,
      executionCount: 0,
      lastTriggered: 'Pending execution',
    };

    onUpdateRules([...rules, created]);
    setShowAddModal(false);
    setNewRuleName('');
    setNewRuleDesc('');
  };

  const getTriggerLabel = (t: string) => {
    switch (t) {
      case 'call_booking_created':
        return 'Shop Phone Call: Service Booked';
      case 'urgent_email_received':
        return 'Company Email: Urgent Customer Lead';
      case 'crypto_price_alert':
        return 'Portfolio: Price Threshold Triggered (±5%)';
      case 'builder_build_complete':
        return 'Builder Agent: Spec Code Compiled';
      case 'voice_command_executed':
        return 'Voice OS: Command Trigger Executed';
      default:
        return t;
    }
  };

  const getActionLabel = (a: string) => {
    switch (a) {
      case 'auto_email_customer':
        return 'Auto-Dispatch Confirmation SMS & Email';
      case 'send_sms_to_owner':
        return "Send Instant High-Priority Alert to Alex's Phone";
      case 'create_dispatch_ticket':
        return 'Create Internal Bay Dispatch Ticket';
      case 'trigger_market_digest':
        return 'Synthesize Gemini Quantitative Risk Report';
      case 'create_calendar_task':
        return 'Auto-Schedule Emergency Review Task in Calendar';
      case 'voice_announcement':
        return 'Broadcast Voice Announcement via Abel OS Audio';
      default:
        return a;
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-amber-500/30 p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Workflow className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Abel AI Automation Orchestrator
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Cross-Module Bus Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-latency pipeline bridging AI Telephone Calls, Email Triage, Portfolio Watchtower, and Builder Agent
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Automation Pipeline
        </button>
      </div>

      {/* Grid of Automation Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-6 rounded-3xl border transition-all ${
              rule.enabled
                ? 'bg-slate-950 border-amber-500/30 shadow-md'
                : 'bg-slate-950/40 border-slate-800 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">{rule.name}</h3>
              <button
                onClick={() => toggleRule(rule.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  rule.enabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {rule.enabled ? 'Active' : 'Paused'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{rule.description}</p>

            {/* Pipeline Visual Flow */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5 mb-4 text-xs">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">{getTriggerLabel(rule.triggerEvent)}</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowRight className="w-3.5 h-3.5 rotate-90" />
              </div>
              <div className="flex items-center gap-2.5 text-emerald-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{getActionLabel(rule.actions?.[0] || 'auto_email_customer')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span>Executed: {rule.executionCount} times</span>
              <span>Last: {rule.lastTriggered || 'Never'}</span>
              <button
                onClick={() => deleteRule(rule.id)}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                title="Delete rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Cross-Module Execution Event Feed */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Real-Time Execution Event Log (Cross-Module Bus)
        </h3>

        <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
          {recentLogs.length === 0 ? (
            <div className="p-5 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
              No recent automated triggers recorded in this session.
            </div>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shadow-[0_0_6px_#fbbf24]" />
                  <span>{log.message}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create Automation Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. Instant Notification on Urgent Service Call"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  placeholder="Explain what this automation triggers..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  When This Event Happens (Trigger)
                </label>
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="call_booking_created">
                    Shop Phone Call: Customer Books Service Appointment
                  </option>
                  <option value="urgent_email_received">
                    Company Email: Urgent Customer Lead Arrives
                  </option>
                  <option value="crypto_price_alert">
                    Portfolio: Stock or Crypto Price Moves &gt; 5%
                  </option>
                  <option value="builder_build_complete">
                    Builder Agent: Software Build &amp; Spec Passes Audit
                  </option>
                  <option value="voice_command_executed">
                    Voice OS: Hotkey or Wake Word Command Spoken
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Then Automatically Do (Action)
                </label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="auto_email_customer">
                    Auto-Dispatch Confirmation Email &amp; SMS to Caller
                  </option>
                  <option value="send_sms_to_owner">
                    Send High-Priority Push Alert to Alex&apos;s Phone
                  </option>
                  <option value="create_dispatch_ticket">
                    Generate Workshop Bay Ticket on Lift Staging
                  </option>
                  <option value="trigger_market_digest">
                    Run Gemini Quantitative Portfolio Risk Audit
                  </option>
                  <option value="create_calendar_task">
                    Auto-Schedule Emergency Review Task in Calendar
                  </option>
                  <option value="voice_announcement">
                    Broadcast Voice Announcement via Abel OS Audio
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRule}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(251,191,36,0.4)] cursor-pointer"
              >
                Deploy Automation Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
