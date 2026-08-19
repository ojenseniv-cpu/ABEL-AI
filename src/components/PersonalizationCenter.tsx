import React, { useState } from 'react';
import {
  Sliders,
  User,
  ShieldCheck,
  Zap,
  Mail,
  PhoneCall,
  TrendingUp,
  Code2,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Mic,
  Keyboard,
  Volume2,
  Key,
  Monitor,
  Users,
  Plus,
  Trash2,
  Terminal,
  FolderDown,
  Sparkles,
  Coins,
  DollarSign,
  Globe,
  Settings2,
  Eye,
  Check,
  Building,
  Wrench,
  Palette,
  Target,
  ShieldAlert,
  Edit3,
  ChevronDown,
  ChevronUp,
  Workflow,
} from 'lucide-react';
import {
  PersonalProfile,
  UserProfile,
  StockHolding,
  CryptoHolding,
  ThresholdTriggerAction,
  ShopKnowledgeBase,
  NavSection,
  VoicePersona,
  ConnectedEmailAccount,
  ThemeConfig,
} from '../types';
import { defaultThemeConfig } from '../data/mockData';
import { ThemeEditor } from './ThemeEditor';

interface PersonalizationCenterProps {
  profile: PersonalProfile;
  onUpdateProfile: (profile: PersonalProfile) => void;
  stocks: StockHolding[];
  crypto: CryptoHolding[];
  onUpdateStocks: (stocks: StockHolding[]) => void;
  onUpdateCrypto: (crypto: CryptoHolding[]) => void;
  knowledgeBase: ShopKnowledgeBase;
  onUpdateKnowledge: (kb: ShopKnowledgeBase) => void;
  onExportData: () => void;
  onResetData: () => void;
}

type SettingsTab =
  | 'theme_editor'
  | 'crypto_stocks'
  | 'email_accounts'
  | 'shop_phone'
  | 'gui_devices'
  | 'voice_hotkey'
  | 'antigravity_installer';

export const PersonalizationCenter: React.FC<PersonalizationCenterProps> = ({
  profile,
  onUpdateProfile,
  stocks,
  crypto,
  onUpdateStocks,
  onUpdateCrypto,
  knowledgeBase,
  onUpdateKnowledge,
  onExportData,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme_editor');
  const [formProfile, setFormProfile] = useState<PersonalProfile>(profile);
  const [formKB, setFormKB] = useState<ShopKnowledgeBase>(knowledgeBase);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBindingKey, setIsBindingKey] = useState(false);
  const [downloadingInstaller, setDownloadingInstaller] = useState(false);

  // New Crypto state
  const [newCryptoSymbol, setNewCryptoSymbol] = useState('');
  const [newCryptoName, setNewCryptoName] = useState('');
  const [newCryptoAmount, setNewCryptoAmount] = useState('');
  const [newCryptoBuyPrice, setNewCryptoBuyPrice] = useState('');
  const [newCryptoNetwork, setNewCryptoNetwork] = useState('Solana');
  const [newCryptoAlertHigh, setNewCryptoAlertHigh] = useState('');
  const [newCryptoAlertLow, setNewCryptoAlertLow] = useState('');
  const [newCryptoHighAction, setNewCryptoHighAction] = useState<ThresholdTriggerAction>('send_sms_to_owner');
  const [newCryptoLowAction, setNewCryptoLowAction] = useState<ThresholdTriggerAction>('send_sms_to_owner');
  const [newCryptoAutoTrigger, setNewCryptoAutoTrigger] = useState(true);
  const [expandedThresholdCoinId, setExpandedThresholdCoinId] = useState<string | null>(null);

  // New Stock state
  const [newStockTicker, setNewStockTicker] = useState('');
  const [newStockName, setNewStockName] = useState('');
  const [newStockShares, setNewStockShares] = useState('');
  const [newStockBuyPrice, setNewStockBuyPrice] = useState('');
  const [newStockSector, setNewStockSector] = useState('Technology');

  // New Email state
  const [newEmailAddress, setNewEmailAddress] = useState('');
  const [newEmailLabel, setNewEmailLabel] = useState('');
  const [newEmailType, setNewEmailType] = useState<'google' | 'company' | 'imap'>('google');

  // New Shop Service state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceEstimate, setNewServiceEstimate] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New User state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Crypto Trader & Game Dev (Son)');

  const handleSaveAll = () => {
    onUpdateProfile(formProfile);
    onUpdateKnowledge(formKB);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleKeyDownBinding = (e: React.KeyboardEvent) => {
    if (!isBindingKey) return;
    e.preventDefault();
    e.stopPropagation();

    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }

    const modifiers: string[] = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.altKey) modifiers.push('Alt');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.metaKey) modifiers.push('Win');

    const mainKey = e.code === 'Space' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
    const keyDisplay = [...modifiers, mainKey].join(' + ');

    setFormProfile({
      ...formProfile,
      voiceConfig: {
        ...formProfile.voiceConfig,
        triggerKey: e.code || e.key,
        triggerKeyDisplay: keyDisplay,
        triggerModifiers: {
          ctrl: e.ctrlKey,
          alt: e.altKey,
          shift: e.shiftKey,
          meta: e.metaKey,
        },
      },
    });
    setIsBindingKey(false);
  };

  // Add Crypto Watch item
  const handleAddCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCryptoSymbol.trim()) return;

    const symbol = newCryptoSymbol.trim().toUpperCase();
    const name = newCryptoName.trim() || symbol;
    const amount = parseFloat(newCryptoAmount) || 0;
    const buyPrice = parseFloat(newCryptoBuyPrice) || 1.0;
    const alertHigh = parseFloat(newCryptoAlertHigh) || parseFloat((buyPrice * 1.25).toFixed(2));
    const alertLow = parseFloat(newCryptoAlertLow) || parseFloat((buyPrice * 0.85).toFixed(2));

    const newCoin: CryptoHolding = {
      id: `crypto-${Date.now()}`,
      symbol,
      name,
      amount,
      avgBuyPrice: buyPrice,
      currentPrice: buyPrice,
      change24h: 0.0,
      network: newCryptoNetwork,
      alertHigh,
      alertLow,
      highTriggerAction: newCryptoHighAction,
      lowTriggerAction: newCryptoLowAction,
      autoTriggerEnabled: newCryptoAutoTrigger,
    };

    onUpdateCrypto([...crypto, newCoin]);
    setNewCryptoSymbol('');
    setNewCryptoName('');
    setNewCryptoAmount('');
    setNewCryptoBuyPrice('');
    setNewCryptoAlertHigh('');
    setNewCryptoAlertLow('');
  };

  const handleUpdateSingleCrypto = (id: string, updates: Partial<CryptoHolding>) => {
    const updated = crypto.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onUpdateCrypto(updated);
  };

  const handleBatchSetThresholds = (highPct: number, lowPct: number) => {
    const updated = crypto.map((c) => ({
      ...c,
      alertHigh: parseFloat((c.currentPrice * (1 + highPct / 100)).toFixed(2)),
      alertLow: parseFloat((c.currentPrice * (1 - lowPct / 100)).toFixed(2)),
      autoTriggerEnabled: true,
    }));
    onUpdateCrypto(updated);
  };

  const handleDeleteCrypto = (id: string) => {
    onUpdateCrypto(crypto.filter((c) => c.id !== id));
  };

  // Add Stock Watch item
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockTicker.trim()) return;

    const ticker = newStockTicker.trim().toUpperCase();
    const name = newStockName.trim() || ticker;
    const shares = parseFloat(newStockShares) || 0;
    const buyPrice = parseFloat(newStockBuyPrice) || 100.0;

    const newStock: StockHolding = {
      id: `stock-${Date.now()}`,
      ticker,
      name,
      shares,
      avgBuyPrice: buyPrice,
      currentPrice: buyPrice,
      change24h: 0.0,
      sector: newStockSector,
      alertHigh: buyPrice * 1.2,
      alertLow: buyPrice * 0.9,
    };

    onUpdateStocks([...stocks, newStock]);
    setNewStockTicker('');
    setNewStockName('');
    setNewStockShares('');
    setNewStockBuyPrice('');
  };

  const handleDeleteStock = (id: string) => {
    onUpdateStocks(stocks.filter((s) => s.id !== id));
  };

  // Add Connected Email
  const handleAddEmailAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailAddress.trim()) return;

    const account: ConnectedEmailAccount = {
      id: `email-acc-${Date.now()}`,
      type: newEmailType,
      email: newEmailAddress.trim(),
      label: newEmailLabel.trim() || newEmailAddress.trim(),
      syncIntervalMinutes: 5,
      enabled: true,
    };

    setFormProfile({
      ...formProfile,
      connectedEmails: [...(formProfile.connectedEmails || []), account],
    });

    setNewEmailAddress('');
    setNewEmailLabel('');
  };

  const handleDeleteEmailAccount = (id: string) => {
    setFormProfile({
      ...formProfile,
      connectedEmails: formProfile.connectedEmails?.filter((e) => e.id !== id),
    });
  };

  // Add Shop Service
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const service = {
      name: newServiceName.trim(),
      estimate: newServiceEstimate.trim() || '$100 - $300',
      description: newServiceDesc.trim() || 'Standard diagnostic and repair procedure.',
    };

    setFormKB({
      ...formKB,
      standardServices: [...formKB.standardServices, service],
    });

    setNewServiceName('');
    setNewServiceEstimate('');
    setNewServiceDesc('');
  };

  const handleDeleteService = (idx: number) => {
    setFormKB({
      ...formKB,
      standardServices: formKB.standardServices.filter((_, i) => i !== idx),
    });
  };

  // Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${newUserName.toLowerCase().replace(/\s+/g, '')}@device.local`,
      role: newUserRole,
      avatarColor: 'from-amber-400 to-yellow-600',
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    };

    setFormProfile({
      ...formProfile,
      allUsers: [...(formProfile.allUsers || []), newUser],
    });

    setNewUserName('');
    setNewUserEmail('');
  };

  const handleDownloadWindowsInstaller = () => {
    setDownloadingInstaller(true);
    const link = document.createElement('a');
    link.href = '/api/tools/windows-installer-script';
    link.download = 'install_abel_ai.ps1';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingInstaller(false), 1500);
  };

  const toggleModuleVisibility = (mod: NavSection) => {
    const current = formProfile.visibleModules || {
      core: true,
      brainstorm: true,
      builder: true,
      telephone: true,
      email: true,
      calendar: true,
      portfolio: true,
      automations: true,
      settings: true,
    };
    setFormProfile({
      ...formProfile,
      visibleModules: {
        ...current,
        [mod]: current[mod] === false ? true : false,
      },
    });
  };

  return (
    <div
      className="space-y-6 font-mono text-slate-200"
      onKeyDown={handleKeyDownBinding}
      tabIndex={0}
    >
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-amber-500/40 p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Abel AI Master System Settings
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-400/40 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                WINDOWS INSTALLED • ZERO MOCK DATA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure crypto watchlists, email accounts, shop secretary phone, GUI modules, and hotkeys.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all self-start md:self-auto shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save All System Configs
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          All settings updated and saved! Watchlists, email rules, and phone policies are live.
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'theme_editor', label: 'Theme Editor (Black & Gold)', icon: Palette },
          { id: 'crypto_stocks', label: 'Crypto & Stock Watchlists', icon: Coins },
          { id: 'email_accounts', label: 'Email Accounts & Sync', icon: Mail },
          { id: 'shop_phone', label: 'Shop Phone & Secretary', icon: PhoneCall },
          { id: 'gui_devices', label: 'GUI Modules & Devices', icon: Eye },
          { id: 'voice_hotkey', label: 'Voice Persona & Hotkey', icon: Mic },
          { id: 'antigravity_installer', label: 'Anti-Gravity & Windows Installer', icon: FolderDown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: THEME EDITOR (BLACK & GOLD) */}
      {activeTab === 'theme_editor' && (
        <ThemeEditor
          themeConfig={formProfile.themeConfig || defaultThemeConfig}
          onChange={(newTheme) =>
            setFormProfile({
              ...formProfile,
              themeConfig: newTheme,
            })
          }
        />
      )}

      {/* TAB 1: CRYPTO & STOCK WATCHLISTS */}
      {activeTab === 'crypto_stocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crypto Watchlist Configuration */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Crypto Watchlist Setup ({crypto.length} coins)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchSetThresholds(20, 10)}
                  className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 rounded-lg cursor-pointer font-bold"
                  title="Apply +20% Take Profit and -10% Stop Loss to all coins"
                >
                  ⚡ Batch ±20/10%
                </button>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
                  LIVE WATCHTOWER
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Enter what cryptocurrencies you or your son want Abel AI to track, and customize automated take-profit &amp; stop-loss thresholds:
            </p>

            {/* List of Configured Cryptos with Threshold Editors */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {crypto.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs text-center">
                  No crypto tokens configured yet. Add your tokens below (e.g. BTC, ETH, SOL, SUI).
                </div>
              ) : (
                crypto.map((coin) => {
                  const isExpanded = expandedThresholdCoinId === coin.id;
                  const high = coin.alertHigh || Math.round(coin.currentPrice * 1.2);
                  const low = coin.alertLow || Math.round(coin.currentPrice * 0.85);

                  return (
                    <div
                      key={coin.id}
                      className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300 text-sm">{coin.symbol}</span>
                            <span className="text-[10px] text-slate-400">({coin.name})</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-800">
                              {coin.network}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>Holdings: {coin.amount > 0 ? `${coin.amount} ${coin.symbol}` : 'Watching only'}</span>
                            <span className="text-emerald-400 font-bold">🎯 TP: ${high}</span>
                            <span className="text-rose-400 font-bold">🛑 SL: ${low}</span>
                            <span className="text-amber-300 font-bold">
                              {coin.autoTriggerEnabled !== false ? '⚡ Auto-Trigger' : '⏸ Paused'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setExpandedThresholdCoinId(isExpanded ? null : coin.id)}
                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Target className="w-3 h-3" />
                            <span>{isExpanded ? 'Close' : 'Edit Limits'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCrypto(coin.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove coin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Inline Threshold Editor */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3 mt-2 animate-fadeIn">
                          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <Target className="w-3.5 h-3.5" />
                            <span>Customize Thresholds &amp; Automation for {coin.symbol}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Take Profit Setting */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <Target className="w-3 h-3" /> Take-Profit Target ($):
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="any"
                                  value={high}
                                  onChange={(e) =>
                                    handleUpdateSingleCrypto(coin.id, { alertHigh: parseFloat(e.target.value) || high })
                                  }
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSingleCrypto(coin.id, {
                                      alertHigh: parseFloat((coin.currentPrice * 1.2).toFixed(2)),
                                    })
                                  }
                                  className="px-2 py-1 bg-slate-800 text-[10px] text-emerald-400 rounded-lg font-bold"
                                >
                                  +20%
                                </button>
                              </div>
                              <select
                                value={coin.highTriggerAction || 'send_sms_to_owner'}
                                onChange={(e) =>
                                  handleUpdateSingleCrypto(coin.id, {
                                    highTriggerAction: e.target.value as ThresholdTriggerAction,
                                  })
                                }
                                className="w-full bg-slate-900 border border-slate-800 text-emerald-300 rounded-lg px-2 py-1 text-[10px]"
                              >
                                <option value="send_sms_to_owner">📱 Instant SMS to Alex</option>
                                <option value="auto_email_customer">✉️ Dispatch Warning Email</option>
                                <option value="create_calendar_task">📅 Auto-Schedule Calendar Ticket</option>
                                <option value="trigger_market_digest">📊 Run Gemini Risk Audit</option>
                                <option value="voice_announcement">🔊 Voice OS Announcement</option>
                              </select>
                            </div>

                            {/* Stop Loss Setting */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Stop-Loss Floor ($):
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="any"
                                  value={low}
                                  onChange={(e) =>
                                    handleUpdateSingleCrypto(coin.id, { alertLow: parseFloat(e.target.value) || low })
                                  }
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSingleCrypto(coin.id, {
                                      alertLow: parseFloat((coin.currentPrice * 0.9).toFixed(2)),
                                    })
                                  }
                                  className="px-2 py-1 bg-slate-800 text-[10px] text-rose-400 rounded-lg font-bold"
                                >
                                  -10%
                                </button>
                              </div>
                              <select
                                value={coin.lowTriggerAction || 'send_sms_to_owner'}
                                onChange={(e) =>
                                  handleUpdateSingleCrypto(coin.id, {
                                    lowTriggerAction: e.target.value as ThresholdTriggerAction,
                                  })
                                }
                                className="w-full bg-slate-900 border border-slate-800 text-rose-300 rounded-lg px-2 py-1 text-[10px]"
                              >
                                <option value="send_sms_to_owner">📱 Instant SMS to Alex</option>
                                <option value="auto_email_customer">✉️ Dispatch Warning Email</option>
                                <option value="create_calendar_task">📅 Auto-Schedule Calendar Ticket</option>
                                <option value="trigger_market_digest">📊 Run Gemini Risk Audit</option>
                                <option value="voice_announcement">🔊 Voice OS Announcement</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={coin.autoTriggerEnabled !== false}
                                onChange={(e) =>
                                  handleUpdateSingleCrypto(coin.id, { autoTriggerEnabled: e.target.checked })
                                }
                                className="w-3.5 h-3.5 accent-amber-400 cursor-pointer"
                              />
                              <span className="font-bold text-slate-300">Enable Automated Trigger Execution</span>
                            </label>
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Changes saved live</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Crypto Form */}
            <form onSubmit={handleAddCrypto} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">+ Add Crypto with Custom Thresholds:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Symbol (e.g. SOL)"
                  value={newCryptoSymbol}
                  onChange={(e) => setNewCryptoSymbol(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Name (e.g. Solana)"
                  value={newCryptoName}
                  onChange={(e) => setNewCryptoName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Amount held"
                  value={newCryptoAmount}
                  onChange={(e) => setNewCryptoAmount(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Buy / Current Price $"
                  value={newCryptoBuyPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCryptoBuyPrice(val);
                    const num = parseFloat(val) || 0;
                    if (num > 0) {
                      setNewCryptoAlertHigh((num * 1.25).toFixed(2));
                      setNewCryptoAlertLow((num * 0.85).toFixed(2));
                    }
                  }}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Threshold inputs for new coin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[9px] text-emerald-400 uppercase font-bold block mb-1">Take-Profit Target ($)</label>
                  <input
                    type="number"
                    placeholder="Take-Profit $"
                    value={newCryptoAlertHigh}
                    onChange={(e) => setNewCryptoAlertHigh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-rose-400 uppercase font-bold block mb-1">Stop-Loss Floor ($)</label>
                  <input
                    type="number"
                    placeholder="Stop-Loss $"
                    value={newCryptoAlertLow}
                    onChange={(e) => setNewCryptoAlertLow(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newCryptoSymbol.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                + Add to Crypto Watchtower &amp; Arm Thresholds
              </button>
            </form>
          </div>

          {/* Stock Watchlist Configuration */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Stock Watchlist Setup ({stocks.length} equities)
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
                WALL STREET SATELLITE
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Enter what stock equities you want Abel AI to track, analyze quarterly earnings for, and watch:
            </p>

            {/* List of Configured Stocks */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {stocks.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs text-center">
                  No stock tickers configured yet. Add your stocks below (e.g. NVDA, TSLA, AAPL).
                </div>
              ) : (
                stocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 text-sm">{stock.ticker}</span>
                        <span className="text-[10px] text-slate-400">({stock.name})</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-800">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Shares: {stock.shares > 0 ? stock.shares : 'Watching only'} • Buy Price: ${stock.avgBuyPrice}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStock(stock.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove stock"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Stock Form */}
            <form onSubmit={handleAddStock} className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">+ Add Stock to Watchlist:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Ticker (e.g. NVDA)"
                  value={newStockTicker}
                  onChange={(e) => setNewStockTicker(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold"
                />
                <input
                  type="text"
                  placeholder="Name (e.g. NVIDIA Corp)"
                  value={newStockName}
                  onChange={(e) => setNewStockName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Shares held"
                  value={newStockShares}
                  onChange={(e) => setNewStockShares(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Buy Price $"
                  value={newStockBuyPrice}
                  onChange={(e) => setNewStockBuyPrice(e.target.value)}
                  className="bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={!newStockTicker.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                + Add to Stock Watchtower
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: EMAIL ACCOUNTS & SYNC */}
      {activeTab === 'email_accounts' && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Connected Email Accounts &amp; Intelligence Policies
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">
              DUAL GOOGLE + COMPANY LINK
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Configure the email accounts Abel AI connects to for autonomous lead triage, draft synthesis, and VIP customer filtering:
          </p>

          {/* List of Connected Email Accounts */}
          <div className="space-y-3">
            {formProfile.connectedEmails?.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs text-center">
                No external email accounts connected yet. Add your personal Google or Company email account below.
              </div>
            ) : (
              formProfile.connectedEmails?.map((acc) => (
                <div
                  key={acc.id}
                  className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                      @
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {acc.label}
                        <span className="text-[9px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-amber-300 uppercase">
                          {acc.type}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{acc.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEmailAccount(acc.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Email Account Form */}
          <form onSubmit={handleAddEmailAccount} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">+ Connect Email Account:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Account Type</label>
                <select
                  value={newEmailType}
                  onChange={(e) => setNewEmailType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                >
                  <option value="google">Google Workspace / Gmail</option>
                  <option value="company">Company SMTP / IMAP</option>
                  <option value="imap">Standard IMAP Server</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Account Label</label>
                <input
                  type="text"
                  placeholder="e.g. My Personal Gmail"
                  value={newEmailLabel}
                  onChange={(e) => setNewEmailLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={newEmailAddress}
                  onChange={(e) => setNewEmailAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!newEmailAddress.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
            >
              + Link &amp; Authorize Email Account
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SHOP PHONE & SECRETARY */}
      {activeTab === 'shop_phone' && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              Shop Telephony &amp; AI Secretary Knowledge Base
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
              VOICE RECEPTIONIST
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Shop / Business Name</label>
              <input
                type="text"
                value={formKB.shopName}
                onChange={(e) => setFormKB({ ...formKB, shopName: e.target.value })}
                placeholder="e.g. Apex Performance & Automotive"
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Shop Phone Number</label>
              <input
                type="text"
                value={formKB.phone}
                onChange={(e) => setFormKB({ ...formKB, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Physical Address</label>
              <input
                type="text"
                value={formKB.address}
                onChange={(e) => setFormKB({ ...formKB, address: e.target.value })}
                placeholder="123 Industrial Way, City, State"
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Hourly Labor Rate ($/hr)</label>
              <input
                type="number"
                value={formKB.hourlyLaborRate}
                onChange={(e) => setFormKB({ ...formKB, hourlyLaborRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>
          </div>

          {/* Standard Services List */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Standard Services &amp; Price Estimates ({formKB.standardServices.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formKB.standardServices.length === 0 ? (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-500 text-xs text-center">
                  No standard services added. Add services below so the AI secretary can quote caller pricing accurately.
                </div>
              ) : (
                formKB.standardServices.map((srv, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{srv.name} - <span className="text-amber-400">{srv.estimate}</span></div>
                      <div className="text-[11px] text-slate-400">{srv.description}</div>
                    </div>
                    <button onClick={() => handleDeleteService(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Service Form */}
            <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <input
                type="text"
                placeholder="Service Name (e.g. Brake Replacement)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
              />
              <input
                type="text"
                placeholder="Estimate (e.g. $350 - $500)"
                value={newServiceEstimate}
                onChange={(e) => setNewServiceEstimate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
              />
              <button
                type="submit"
                disabled={!newServiceName.trim()}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold rounded-xl cursor-pointer"
              >
                + Add Service
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: GUI MODULES & DEVICES */}
      {activeTab === 'gui_devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GUI Module Visibility Toggles */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Customize GUI Navigation Tabs
              </span>
            </h3>

            <p className="text-xs text-slate-400">
              Choose which navigation tabs should appear on this computer. For example, your son can enable only Crypto and Builder tabs:
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: 'core', label: 'Abel Core Home', desc: 'Central reactor pulse & quick launch dock' },
                { id: 'portfolio', label: 'Wealth & Crypto Terminal', desc: 'Live crypto watchtower and stock portfolio analytics' },
                { id: 'tiktok', label: 'TikTok Video Studio', desc: 'Text a video with Google Veo, 9:16 player & instant poster' },
                { id: 'brainstorm', label: 'Brainstorm Studio', desc: 'Creative persona ideation & video game concept forge' },
                { id: 'builder', label: 'Software Forge', desc: 'Precision code writing, progress telemetry & approval' },
                { id: 'telephone', label: 'Shop AI Secretary', desc: 'Autonomous phone receptionist and appointment dispatcher' },
                { id: 'email', label: 'Email Intelligence', desc: 'Google Workspace and company lead triager' },
                { id: 'calendar', label: 'Calendar & Schedule', desc: 'Shop bays and task agenda' },
                { id: 'automations', label: 'Automations Hub', desc: 'Zero-latency cross-module event pipelines' },
              ].map((mod) => {
                const isVisible = (formProfile.visibleModules as any)?.[mod.id] !== false;
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModuleVisibility(mod.id as NavSection)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isVisible
                        ? 'bg-amber-500/10 border-amber-400/40 text-white'
                        : 'bg-slate-900/50 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{mod.label}</div>
                      <div className="text-[10px] text-slate-400">{mod.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isVisible ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {isVisible ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Device User Management */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Device Profiles ({formProfile.allUsers?.length || 0})
              </span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {formProfile.allUsers?.map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${u.avatarColor} text-slate-950 font-bold flex items-center justify-center`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add User */}
            <form onSubmit={handleAddUser} className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">+ Add Device Profile:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Leo)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Crypto Trader)"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={!newUserName.trim()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                + Register Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: VOICE PERSONA & HOTKEY */}
      {activeTab === 'voice_hotkey' && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Operating System Persona &amp; Custom Hotkey
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
              REAL-TIME VOICE SYNTHESIS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Persona Switcher */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-bold uppercase text-[10px]">Select Voice Persona</label>
              {[
                { id: 'witty_female', label: '👑 Witty & Sarcastic Female', desc: 'Razor-sharp, playful, high-velocity intelligence.' },
                { id: 'the_joker', label: '🃏 The Joker Mastermind', desc: 'Theatrical genius with unpredictable dramatic variation.' },
                { id: 't1800_arnold', label: '🤖 Arnold T-1800 Cybernetic', desc: 'Deep Austrian baritone robotic terminator cadence.' },
              ].map((p) => {
                const isSelected = formProfile.voiceConfig?.activePersona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() =>
                      setFormProfile({
                        ...formProfile,
                        voiceConfig: {
                          ...formProfile.voiceConfig,
                          activePersona: p.id as VoicePersona,
                        },
                      })
                    }
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-bold">{p.label}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{p.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Keyboard Trigger & Wake Word & Windows Tray */}
            <div className="space-y-4">
              {/* Hotkey Rebinding Card */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Keyboard className="w-4 h-4 text-amber-400" /> Handy-Style Hotkey Combo
                  </span>
                  <span className="text-amber-400 font-bold">
                    [{formProfile.voiceConfig?.triggerKeyDisplay || 'Space'}]
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Click below and press ANY key combination (e.g. <strong className="text-amber-300">Ctrl + Space</strong>, <strong className="text-amber-300">Alt + V</strong>, <strong className="text-amber-300">F2</strong>):
                </p>
                <button
                  type="button"
                  onClick={() => setIsBindingKey(true)}
                  className={`w-full py-3 px-4 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    isBindingKey
                      ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-slate-950 text-amber-300 border-slate-800 hover:border-amber-400'
                  }`}
                >
                  {isBindingKey
                    ? 'PRESS ANY KEY OR COMBO (e.g. Ctrl+Space) NOW...'
                    : `Active Hotkey: [ ${formProfile.voiceConfig?.triggerKeyDisplay || 'Space'} ] (Click to Reassign)`}
                </button>
              </div>

              {/* Hotkey Activation Mode */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormProfile({
                      ...formProfile,
                      voiceConfig: {
                        ...formProfile.voiceConfig,
                        hotkeyMode: 'toggle',
                      },
                    })
                  }
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    formProfile.voiceConfig?.hotkeyMode !== 'push_to_talk'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">Toggle Mic (1-Click)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Press hotkey once to start/stop</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormProfile({
                      ...formProfile,
                      voiceConfig: {
                        ...formProfile.voiceConfig,
                        hotkeyMode: 'push_to_talk',
                      },
                    })
                  }
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    formProfile.voiceConfig?.hotkeyMode === 'push_to_talk'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">Push-to-Talk (Hold)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hold key to speak, release to send</div>
                </button>
              </div>

              {/* Spoken Wake Word */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold uppercase text-[10px]">Spoken Wake Word</label>
                  <span className="text-[10px] text-slate-400">Background Voice Sentinel</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. hey abel, abel, computer, jarvis"
                  value={formProfile.voiceConfig?.wakeWord || 'hey abel'}
                  onChange={(e) =>
                    setFormProfile({
                      ...formProfile,
                      voiceConfig: {
                        ...formProfile.voiceConfig,
                        wakeWord: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              {/* Windows Close to System Tray */}
              <div
                onClick={() =>
                  setFormProfile({
                    ...formProfile,
                    voiceConfig: {
                      ...formProfile.voiceConfig,
                      minimizeToTrayOnClose:
                        formProfile.voiceConfig?.minimizeToTrayOnClose === false ? true : false,
                    },
                  })
                }
                className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-amber-400 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Minimize to System Tray on X</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 font-mono rounded">
                      WINDOWS APP
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Clicking [X] keeps Abel AI running next to the system clock, listening for your wake word and hotkey.
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    formProfile.voiceConfig?.minimizeToTrayOnClose !== false
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {formProfile.voiceConfig?.minimizeToTrayOnClose !== false ? '✓' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ANTI-GRAVITY & WINDOWS INSTALLER */}
      {activeTab === 'antigravity_installer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anti-Gravity Central Hub */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Anti-Gravity Central API Key Hub
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
                TRANSFER READY
              </span>
            </h3>

            <p className="text-xs text-slate-400">
              Update all your API keys in one place. They synchronize seamlessly with Anti-Gravity:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Gemini AI API Key</label>
                <input
                  type="password"
                  placeholder="Injected via Secrets or enter manual key..."
                  value={formProfile.antiGravity?.geminiApiKey || ''}
                  onChange={(e) =>
                    setFormProfile({
                      ...formProfile,
                      antiGravity: {
                        ...formProfile.antiGravity!,
                        geminiApiKey: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Google Workspace OAuth Client ID</label>
                <input
                  type="text"
                  value={formProfile.antiGravity?.googleOAuthClientId || ''}
                  onChange={(e) =>
                    setFormProfile({
                      ...formProfile,
                      antiGravity: {
                        ...formProfile.antiGravity!,
                        googleOAuthClientId: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">Shop Telephony Inbound Webhook URL</label>
                <input
                  type="text"
                  value={formProfile.antiGravity?.phoneWebhookUrl || ''}
                  onChange={(e) =>
                    setFormProfile({
                      ...formProfile,
                      antiGravity: {
                        ...formProfile.antiGravity!,
                        phoneWebhookUrl: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Windows PowerShell Installer Package (.ps1) */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Windows App Installer (.ps1 / .psi)
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">
                  WINDOWS NATIVE
                </span>
              </h3>

              <p className="text-xs text-slate-400">
                Generate and download the native Windows PowerShell setup script to install Abel AI on your laptop, your son's computer, or your shop desktop without any password prompts.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Install Directory:</span>
                  <span className="text-white font-mono text-xs">{formProfile.antiGravity?.windowsInstallerOptions?.installPath || 'C:\\Users\\User\\AppData\\Local\\AbelAI'}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Auto-Start with Windows</span>
                  <span className="text-amber-400 font-bold">Enabled</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadWindowsInstaller}
                  disabled={downloadingInstaller}
                  className="py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-2xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all cursor-pointer"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  {downloadingInstaller ? 'Generating...' : 'PS1 Installer (.ps1)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/api/tools/windows-batch-installer';
                  }}
                  className="py-3 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-white font-bold rounded-2xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Double-Click (.bat)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onExportData}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export Backup
                </button>
                <button
                  type="button"
                  onClick={onResetData}
                  className="py-2 px-3 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
