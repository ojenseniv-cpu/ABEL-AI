import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  TrendingUp as TrendUpIcon,
  Sparkles as SparkleIcon,
  DollarSign as DollarIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  RefreshCw as RefreshIcon,
  ArrowUpRight as ArrowUpIcon,
  ArrowDownRight as ArrowDownIcon,
  Zap as ZapIcon,
  Coins as CoinIcon,
  Layers as LayerIcon,
  Sliders as SliderIcon,
  Bell,
  ShieldAlert,
  Radio,
  Check,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Target,
  Shield,
  Workflow,
  ExternalLink,
  Volume2,
  Mail,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { StockHolding, CryptoHolding, PortfolioInsight, ThresholdTriggerAction } from '../types';

interface PortfolioWatchtowerProps {
  stocks: StockHolding[];
  crypto: CryptoHolding[];
  onUpdateStocks: (stocks: StockHolding[]) => void;
  onUpdateCrypto: (crypto: CryptoHolding[]) => void;
  onTriggerAutomation?: (triggerEvent: string, details: string) => void;
  onNavigateToSettings?: () => void;
}

export const PortfolioWatchtower: React.FC<PortfolioWatchtowerProps> = ({
  stocks,
  crypto,
  onUpdateStocks,
  onUpdateCrypto,
  onTriggerAutomation,
  onNavigateToSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'crypto' | 'thresholds' | 'stocks' | 'ai_sentinel'>('overview');
  const [isAuditing, setIsAuditing] = useState(false);
  const [insight, setInsight] = useState<PortfolioInsight | null>(null);
  const [activeTriggerToast, setActiveTriggerToast] = useState<string | null>(null);

  // Add Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'stock' | 'crypto'>('crypto');
  const [newTicker, setNewTicker] = useState('');
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState<number>(1);
  const [newBuyPrice, setNewBuyPrice] = useState<number>(100);
  const [newCurrentPrice, setNewCurrentPrice] = useState<number>(105);
  const [newChange24h, setNewChange24h] = useState<number>(2.5);
  const [newSectorOrNet, setNewSectorOrNet] = useState('Solana');
  const [newAlertHigh, setNewAlertHigh] = useState<number>(125);
  const [newAlertLow, setNewAlertLow] = useState<number>(85);
  const [newHighAction, setNewHighAction] = useState<ThresholdTriggerAction>('send_sms_to_owner');
  const [newLowAction, setNewLowAction] = useState<ThresholdTriggerAction>('send_sms_to_owner');

  // Web3 / MetaMask Wallet Integration State
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(() => {
    return localStorage.getItem('abel_ai_connected_wallet');
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletStatusMsg, setWalletStatusMsg] = useState<string | null>(null);
  const [manualWalletAddress, setManualWalletAddress] = useState('');

  // Safe MetaMask Connection with Graceful Fallback
  const handleConnectMetaMask = async () => {
    setIsConnectingWallet(true);
    setWalletStatusMsg(null);

    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setConnectedWallet(addr);
          localStorage.setItem('abel_ai_connected_wallet', addr);
          setWalletStatusMsg(`Connected successfully: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
        } else {
          setWalletStatusMsg('No accounts returned by MetaMask. You can track any public address manually.');
        }
      } else {
        setWalletStatusMsg(
          'MetaMask extension is not detected in this browser context (e.g. iframe preview or unsupported browser). You can enter any Ethereum or Solana address manually below to track balances.'
        );
      }
    } catch (err: any) {
      if (err?.code === 4001) {
        setWalletStatusMsg('Connection request was cancelled in MetaMask.');
      } else {
        setWalletStatusMsg('Unable to connect to MetaMask. You can enter your public wallet address manually.');
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleManualWalletSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWalletAddress.trim()) return;
    const addr = manualWalletAddress.trim();
    setConnectedWallet(addr);
    localStorage.setItem('abel_ai_connected_wallet', addr);
    setWalletStatusMsg(`Watching wallet address: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
    setManualWalletAddress('');
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    localStorage.removeItem('abel_ai_connected_wallet');
    setWalletStatusMsg('Wallet disconnected.');
  };

  // Calculations
  const totalStocksValue = stocks.reduce((acc, s) => acc + (s.shares || 0) * (s.currentPrice || 0), 0);
  const totalStocksCost = stocks.reduce((acc, s) => acc + (s.shares || 0) * (s.avgBuyPrice || 0), 0);
  const stocksPnL = totalStocksValue - totalStocksCost;
  const stocksPnLPct = totalStocksCost > 0 ? (stocksPnL / totalStocksCost) * 100 : 0;

  const totalCryptoValue = crypto.reduce((acc, c) => acc + (c.amount || 0) * (c.currentPrice || 0), 0);
  const totalCryptoCost = crypto.reduce((acc, c) => acc + (c.amount || 0) * (c.avgBuyPrice || 0), 0);
  const cryptoPnL = totalCryptoValue - totalCryptoCost;
  const cryptoPnLPct = totalCryptoCost > 0 ? (cryptoPnL / totalCryptoCost) * 100 : 0;

  const totalPortfolioValue = totalStocksValue + totalCryptoValue;
  const totalPortfolioCost = totalStocksCost + totalCryptoCost;
  const totalPnL = totalPortfolioValue - totalPortfolioCost;
  const totalPnLPct = totalPortfolioCost > 0 ? (totalPnL / totalPortfolioCost) * 100 : 0;

  // Threshold Calculations
  const armedCryptoCount = crypto.filter((c) => c.autoTriggerEnabled !== false && (c.alertHigh || c.alertLow)).length;
  const breachedUpperCount = crypto.filter((c) => c.alertHigh && c.currentPrice >= c.alertHigh).length;
  const breachedLowerCount = crypto.filter((c) => c.alertLow && c.currentPrice <= c.alertLow).length;
  const totalBreaches = breachedUpperCount + breachedLowerCount;

  // Chart data
  const allocationData = [
    { name: 'Equities & ETFs', value: Math.round(totalStocksValue), color: '#f59e0b' },
    { name: 'Cryptocurrencies', value: Math.round(totalCryptoValue), color: '#fbbf24' },
  ];

  const assetBarData = [
    ...stocks.map((s) => ({
      name: s.ticker,
      value: Math.round((s.shares || 0) * (s.currentPrice || 0)),
      change: s.change24h || 0,
      type: 'Stock',
    })),
    ...crypto.map((c) => ({
      name: c.symbol,
      value: Math.round((c.amount || 0) * (c.currentPrice || 0)),
      change: c.change24h || 0,
      type: 'Crypto',
    })),
  ].sort((a, b) => b.value - a.value);

  // Trigger Gemini Quantitative Sentinel Audit
  const runAiPortfolioAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai/portfolio-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks, crypto }),
      });
      const data = await res.json();
      setInsight(data);
      setIsAuditing(false);
      setActiveTab('ai_sentinel');
    } catch (err) {
      console.error('Portfolio audit error:', err);
      setIsAuditing(false);
    }
  };

  const handleAddAsset = () => {
    if (!newTicker.trim()) return;

    if (addType === 'stock') {
      const newStock: StockHolding = {
        id: `stk-${Date.now()}`,
        ticker: newTicker.toUpperCase().trim(),
        name: newName.trim() || newTicker.toUpperCase().trim(),
        shares: newAmount,
        avgBuyPrice: newBuyPrice,
        currentPrice: newCurrentPrice || newBuyPrice,
        change24h: newChange24h,
        alertHigh: Math.round((newCurrentPrice || newBuyPrice) * 1.15),
        alertLow: Math.round((newCurrentPrice || newBuyPrice) * 0.9),
        sector: newSectorOrNet || 'Tech',
      };
      onUpdateStocks([newStock, ...stocks]);
    } else {
      const current = newCurrentPrice || newBuyPrice;
      const newCr: CryptoHolding = {
        id: `crp-${Date.now()}`,
        symbol: newTicker.toUpperCase().trim(),
        name: newName.trim() || newTicker.toUpperCase().trim(),
        amount: newAmount,
        avgBuyPrice: newBuyPrice,
        currentPrice: current,
        change24h: newChange24h,
        alertHigh: newAlertHigh || Math.round(current * 1.25),
        alertLow: newAlertLow || Math.round(current * 0.85),
        highTriggerAction: newHighAction,
        lowTriggerAction: newLowAction,
        autoTriggerEnabled: true,
        network: newSectorOrNet || 'Solana',
      };
      onUpdateCrypto([newCr, ...crypto]);
    }

    setShowAddModal(false);
    setNewTicker('');
    setNewName('');
  };

  const handleDeleteStock = (id: string) => {
    onUpdateStocks(stocks.filter((s) => s.id !== id));
  };

  const handleDeleteCrypto = (id: string) => {
    onUpdateCrypto(crypto.filter((c) => c.id !== id));
  };

  // Update specific crypto threshold fields
  const handleUpdateCryptoField = (id: string, updates: Partial<CryptoHolding>) => {
    const updated = crypto.map((c) => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      return c;
    });
    onUpdateCrypto(updated);
  };

  // Simulate price change & check triggers
  const handleSimulatePrice = (id: string, multiplier: number) => {
    const coin = crypto.find((c) => c.id === id);
    if (!coin) return;

    const newPrice = Math.max(0.0001, parseFloat((coin.currentPrice * multiplier).toFixed(2)));
    const pctChange = parseFloat((((newPrice - coin.avgBuyPrice) / (coin.avgBuyPrice || 1)) * 100).toFixed(2));

    let breachType: 'normal' | 'upper_breached' | 'lower_breached' = 'normal';
    if (coin.alertHigh && newPrice >= coin.alertHigh) {
      breachType = 'upper_breached';
    } else if (coin.alertLow && newPrice <= coin.alertLow) {
      breachType = 'lower_breached';
    }

    const updated = crypto.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          currentPrice: newPrice,
          change24h: pctChange,
          lastTriggerStatus: breachType,
        };
      }
      return c;
    });

    onUpdateCrypto(updated);

    if (breachType !== 'normal' && (coin.autoTriggerEnabled ?? true)) {
      const action = breachType === 'upper_breached' ? coin.highTriggerAction || 'send_sms_to_owner' : coin.lowTriggerAction || 'send_sms_to_owner';
      triggerAutomationEngine(coin.symbol, newPrice, breachType, action);
    }
  };

  // Explicit Trigger Automation Engine
  const triggerAutomationEngine = (
    symbol: string,
    price: number,
    type: 'upper_breached' | 'lower_breached' | 'manual_test',
    action: ThresholdTriggerAction = 'send_sms_to_owner'
  ) => {
    const actionDescriptions: Record<ThresholdTriggerAction, string> = {
      send_sms_to_owner: "High-Priority SMS Alert dispatched to Alex's mobile",
      auto_email_customer: 'Automated Email warning dispatched to crypto analyst team',
      create_calendar_task: 'Emergency Risk Review auto-scheduled in Calendar Scheduler',
      trigger_market_digest: 'Synthesized Quantitative Gemini Portfolio Risk Audit',
      voice_announcement: 'Broadcast Voice Announcement via Abel OS Audio Channel',
    };

    const conditionText =
      type === 'upper_breached'
        ? `Upper Take-Profit Threshold Breached ($${price})`
        : type === 'lower_breached'
        ? `Lower Stop-Loss Safety Breached ($${price})`
        : `Manual Diagnostic Trigger Test ($${price})`;

    const detailMsg = `${symbol} ${conditionText} → Action Executed: ${actionDescriptions[action]}`;

    if (onTriggerAutomation) {
      onTriggerAutomation('crypto_price_alert', detailMsg);
    }

    // Update lastTriggeredAt
    const updated = crypto.map((c) => (c.symbol === symbol ? { ...c, lastTriggeredAt: new Date().toLocaleTimeString() } : c));
    onUpdateCrypto(updated);

    setActiveTriggerToast(detailMsg);
    setTimeout(() => setActiveTriggerToast(null), 4500);
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Toast notification for triggered automations */}
      {activeTriggerToast && (
        <div className="p-4 bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs flex items-center justify-between shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-bounce">
          <div className="flex items-center gap-2.5">
            <ZapIcon className="w-5 h-5 fill-slate-950" />
            <div>
              <span className="uppercase font-extrabold tracking-wider">[AUTOMATION ENGINE TRIGGERED]:</span> {activeTriggerToast}
            </div>
          </div>
          <button onClick={() => setActiveTriggerToast(null)} className="p-1 hover:bg-slate-900/20 rounded-lg cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Sub-Header & Live Market Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md border border-amber-500/40 p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <TrendUpIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Crypto &amp; Stock Wealth Watchtower
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-400/40 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Live Sentinel Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time portfolio monitor, user-configured crypto watchtower, and automated price threshold engine
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('thresholds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'thresholds'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Price Thresholds ({armedCryptoCount})</span>
              {totalBreaches > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-extrabold animate-pulse">
                  {totalBreaches}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crypto ({crypto.length})
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stocks'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stocks ({stocks.length})
            </button>
            <button
              onClick={() => setActiveTab('ai_sentinel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'ai_sentinel'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SparkleIcon className="w-3.5 h-3.5" />
              AI Sentinel
            </button>
          </div>

          <button
            onClick={runAiPortfolioAudit}
            disabled={isAuditing}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.3)] transition-all cursor-pointer"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'AI Risk Audit'}</span>
          </button>

          <button
            onClick={() => setShowWalletModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              connectedWallet
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {connectedWallet
                ? `Wallet: ${connectedWallet.slice(0, 5)}...${connectedWallet.slice(-4)}`
                : 'Connect Wallet / Web3'}
            </span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            + Add Position
          </button>
        </div>
      </div>

      {/* Top Net Worth Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Value */}
        <div className="bg-slate-950 border border-amber-500/30 p-5 rounded-3xl shadow-sm">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
            Total Monitored Portfolio
          </span>
          <div className="text-2xl font-extrabold text-white">
            ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold">
            {totalPnL >= 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowUpIcon className="w-3.5 h-3.5" />
                +${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })} (+{totalPnLPct.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center">
                <ArrowDownIcon className="w-3.5 h-3.5" />
                -${Math.abs(totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({totalPnLPct.toFixed(1)}%)
              </span>
            )}
            <span className="text-slate-500 text-[10px]">ALL-TIME</span>
          </div>
        </div>

        {/* Crypto Holdings Total */}
        <div className="bg-slate-950 border border-amber-500/30 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Crypto Holdings ({crypto.length} tokens)
            </span>
            <CoinIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1">
            ${totalCryptoValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-slate-400">
            {crypto.length === 0 ? 'No coins added yet' : `${crypto.length} active watchlist tokens`}
          </div>
        </div>

        {/* Stock Holdings Total */}
        <div className="bg-slate-950 border border-amber-500/30 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Stock Equities ({stocks.length} tickers)
            </span>
            <DollarIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            ${totalStocksValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-slate-400">
            {stocks.length === 0 ? 'No equities added yet' : `${stocks.length} monitored stocks`}
          </div>
        </div>

        {/* Active Volatility & Threshold Alerts */}
        <div
          onClick={() => setActiveTab('thresholds')}
          className="bg-slate-950 border border-amber-500/30 hover:border-amber-400 p-5 rounded-3xl shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Threshold Automations
            </span>
            <ZapIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`text-2xl font-extrabold ${totalBreaches > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {totalBreaches > 0 ? `${totalBreaches} BREACHED` : `${armedCryptoCount} ARMED`}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Automations connected to bus</span>
            <span className="text-amber-400 underline">Manage →</span>
          </div>
        </div>
      </div>

      {/* TAB: THRESHOLDS & AUTOMATION ENGINE */}
      {activeTab === 'thresholds' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Crypto Price Threshold &amp; Automation Trigger Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Set upper take-profit limits and lower stop-loss boundaries that automatically fire notifications, emails, voice broadcasts, or calendar tickets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAddType('crypto');
                    setShowAddModal(true);
                  }}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  + Add Watch Token
                </button>
              </div>
            </div>

            {/* Threshold Quick Batch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <ZapIcon className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Automated Cross-Module Dispatch:</span>
                <span className="text-[11px] text-slate-400">When any threshold is hit, Abel AI immediately executes the assigned action.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = crypto.map((c) => ({
                      ...c,
                      alertHigh: parseFloat((c.currentPrice * 1.2).toFixed(2)),
                      alertLow: parseFloat((c.currentPrice * 0.9).toFixed(2)),
                      autoTriggerEnabled: true,
                    }));
                    onUpdateCrypto(updated);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-[11px] font-bold cursor-pointer"
                >
                  ⚡ Set All to +20% / -10%
                </button>
              </div>
            </div>
          </div>

          {/* List of Crypto Tokens with Full Threshold Controls */}
          {crypto.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
              <CoinIcon className="w-12 h-12 text-amber-400/50 mx-auto" />
              <div className="text-base font-bold text-white">No Crypto Watchlist Configured</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Add cryptocurrencies to set upper price targets (take profit) and lower safety floors (stop loss).
              </p>
              <button
                onClick={() => {
                  setAddType('crypto');
                  setShowAddModal(true);
                }}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg"
              >
                + Add First Crypto Token
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {crypto.map((coin) => {
                const high = coin.alertHigh || Math.round(coin.currentPrice * 1.2);
                const low = coin.alertLow || Math.round(coin.currentPrice * 0.85);
                const isBreachedHigh = coin.currentPrice >= high;
                const isBreachedLow = coin.currentPrice <= low;
                const isArmed = coin.autoTriggerEnabled ?? true;

                // Price progress between low and high
                const range = Math.max(1, high - low);
                const progressPct = Math.min(100, Math.max(0, ((coin.currentPrice - low) / range) * 100));

                const distToHighPct = (((high - coin.currentPrice) / coin.currentPrice) * 100).toFixed(1);
                const distToLowPct = (((coin.currentPrice - low) / coin.currentPrice) * 100).toFixed(1);

                return (
                  <div
                    key={coin.id}
                    className={`p-6 rounded-3xl border-2 transition-all space-y-5 shadow-lg ${
                      isBreachedHigh
                        ? 'bg-amber-950/20 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                        : isBreachedLow
                        ? 'bg-rose-950/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                        : 'bg-slate-950 border-amber-500/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                          {coin.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{coin.symbol}</span>
                            <span className="text-xs text-slate-400">({coin.name})</span>
                            <span className="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-amber-300 font-mono">
                              {coin.network}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Holdings: <span className="text-white font-bold">{coin.amount} {coin.symbol}</span> ($
                            {((coin.amount || 0) * coin.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                          </div>
                        </div>
                      </div>

                      {/* Current Price & Status */}
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-amber-300">${coin.currentPrice.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {coin.change24h >= 0 ? `+${coin.change24h}% 24h` : `${coin.change24h}% 24h`}
                        </div>
                      </div>
                    </div>

                    {/* Visual Price Corridor Slider */}
                    <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Stop-Loss: ${low} (-{distToLowPct}%)
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          Take-Profit: ${high} (+{distToHighPct}%)
                        </span>
                      </div>

                      {/* Progress Bar Corridor */}
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isBreachedHigh
                              ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                              : isBreachedLow
                              ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                              : 'bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Safe Floor</span>
                        <span className="text-amber-300 font-bold">Current: ${coin.currentPrice}</span>
                        <span>Upper Ceiling</span>
                      </div>
                    </div>

                    {/* Threshold Setting Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Upper Take Profit Limit */}
                      <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                            <Target className="w-4 h-4" />
                            Take-Profit Threshold ($)
                          </label>
                          {isBreachedHigh && (
                            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[9px] font-bold">
                              BREACHED 🚨
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">$</span>
                          <input
                            type="number"
                            step="any"
                            value={high}
                            onChange={(e) => handleUpdateCryptoField(coin.id, { alertHigh: parseFloat(e.target.value) || high })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-1.5 text-white font-bold font-mono"
                          />
                        </div>

                        {/* Quick % Offset Buttons */}
                        <div className="flex items-center gap-1.5">
                          {[5, 10, 25, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() =>
                                handleUpdateCryptoField(coin.id, {
                                  alertHigh: parseFloat((coin.currentPrice * (1 + pct / 100)).toFixed(2)),
                                })
                              }
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg cursor-pointer"
                            >
                              +{pct}%
                            </button>
                          ))}
                        </div>

                        {/* Action when Take Profit Breached */}
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Action on Take-Profit:</label>
                          <select
                            value={coin.highTriggerAction || 'send_sms_to_owner'}
                            onChange={(e) =>
                              handleUpdateCryptoField(coin.id, { highTriggerAction: e.target.value as ThresholdTriggerAction })
                            }
                            className="w-full bg-slate-950 border border-slate-800 text-amber-300 rounded-xl px-2.5 py-1.5 text-[11px] cursor-pointer"
                          >
                            <option value="send_sms_to_owner">📱 Instant SMS Alert to Alex</option>
                            <option value="auto_email_customer">✉️ Dispatch Warning Email</option>
                            <option value="create_calendar_task">📅 Auto-Schedule Calendar Ticket</option>
                            <option value="trigger_market_digest">📊 Run Gemini Risk Report</option>
                            <option value="voice_announcement">🔊 Spoken Voice OS Alert</option>
                          </select>
                        </div>
                      </div>

                      {/* Lower Stop Loss Limit */}
                      <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" />
                            Stop-Loss Threshold ($)
                          </label>
                          {isBreachedLow && (
                            <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                              BREACHED 🔻
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">$</span>
                          <input
                            type="number"
                            step="any"
                            value={low}
                            onChange={(e) => handleUpdateCryptoField(coin.id, { alertLow: parseFloat(e.target.value) || low })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-400 rounded-xl px-3 py-1.5 text-white font-bold font-mono"
                          />
                        </div>

                        {/* Quick % Offset Buttons */}
                        <div className="flex items-center gap-1.5">
                          {[5, 10, 20, 35].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() =>
                                handleUpdateCryptoField(coin.id, {
                                  alertLow: parseFloat((coin.currentPrice * (1 - pct / 100)).toFixed(2)),
                                })
                              }
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg cursor-pointer"
                            >
                              -{pct}%
                            </button>
                          ))}
                        </div>

                        {/* Action when Stop Loss Breached */}
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Action on Stop-Loss:</label>
                          <select
                            value={coin.lowTriggerAction || 'send_sms_to_owner'}
                            onChange={(e) =>
                              handleUpdateCryptoField(coin.id, { lowTriggerAction: e.target.value as ThresholdTriggerAction })
                            }
                            className="w-full bg-slate-950 border border-slate-800 text-rose-300 rounded-xl px-2.5 py-1.5 text-[11px] cursor-pointer"
                          >
                            <option value="send_sms_to_owner">📱 Instant SMS Alert to Alex</option>
                            <option value="auto_email_customer">✉️ Dispatch Warning Email</option>
                            <option value="create_calendar_task">📅 Auto-Schedule Calendar Ticket</option>
                            <option value="trigger_market_digest">📊 Run Gemini Risk Report</option>
                            <option value="voice_announcement">🔊 Spoken Voice OS Alert</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Controls: Auto-Trigger Toggle & Live Price Simulator */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                      {/* Auto Trigger Armed Switch */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isArmed}
                          onChange={(e) => handleUpdateCryptoField(coin.id, { autoTriggerEnabled: e.target.checked })}
                          className="w-4 h-4 accent-amber-400 cursor-pointer rounded"
                        />
                        <span className={`font-bold ${isArmed ? 'text-amber-400' : 'text-slate-500'}`}>
                          {isArmed ? '⚡ Auto-Trigger Armed' : '⏸ Auto-Trigger Paused'}
                        </span>
                      </label>

                      {/* Simulator & Diagnostic Test Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulatePrice(coin.id, 1.05)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Simulate +5% Price Movement"
                        >
                          ▲ +5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulatePrice(coin.id, 0.95)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Simulate -5% Price Movement"
                        >
                          ▼ -5%
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            triggerAutomationEngine(
                              coin.symbol,
                              coin.currentPrice,
                              'manual_test',
                              coin.highTriggerAction || 'send_sms_to_owner'
                            )
                          }
                          className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <ZapIcon className="w-3 h-3" />
                          Test Trigger
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cryptocurrencies Card */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <CoinIcon className="w-4 h-4" />
                Crypto Watchtower ({crypto.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('thresholds')}
                  className="text-[10px] text-amber-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer underline"
                >
                  <Target className="w-3 h-3" /> Thresholds ({armedCryptoCount})
                </button>
                <button
                  onClick={() => {
                    setAddType('crypto');
                    setShowAddModal(true);
                  }}
                  className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                >
                  + Add Coin
                </button>
              </div>
            </div>

            {crypto.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                <CoinIcon className="w-8 h-8 text-amber-400/50 mx-auto" />
                <div className="text-sm font-bold text-white">No Crypto Configured</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add the cryptocurrencies you or your son want to trade and monitor (e.g., SOL, BTC, ETH, SUI).
                </p>
                <button
                  onClick={() => {
                    setAddType('crypto');
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  + Add Your First Crypto
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {crypto.map((coin) => (
                  <div
                    key={coin.id}
                    className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 text-sm">{coin.symbol}</span>
                        <span className="text-xs text-slate-400">{coin.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-800">
                          {coin.network}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Holdings: {coin.amount} (${((coin.amount || 0) * coin.currentPrice).toFixed(2)})</span>
                        <span className="text-emerald-400">TP: ${coin.alertHigh || Math.round(coin.currentPrice * 1.2)}</span>
                        <span className="text-rose-400">SL: ${coin.alertLow || Math.round(coin.currentPrice * 0.85)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">${coin.currentPrice}</div>
                        <div className={`text-[10px] font-bold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCrypto(coin.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equities Card */}
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <DollarIcon className="w-4 h-4" />
                Equities &amp; ETFs ({stocks.length})
              </h3>
              <button
                onClick={() => {
                  setAddType('stock');
                  setShowAddModal(true);
                }}
                className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
              >
                + Add Stock
              </button>
            </div>

            {stocks.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                <DollarIcon className="w-8 h-8 text-amber-400/50 mx-auto" />
                <div className="text-sm font-bold text-white">No Stock Tickers Configured</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add stock tickers you want Abel AI to track and analyze (e.g. NVDA, TSLA, AAPL).
                </p>
                <button
                  onClick={() => {
                    setAddType('stock');
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  + Add Stock Ticker
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {stocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 text-sm">{stock.ticker}</span>
                        <span className="text-xs text-slate-400">{stock.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-800">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Shares: {stock.shares} • Value: ${((stock.shares || 0) * (stock.currentPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">${stock.currentPrice}</div>
                        <div className={`text-[10px] font-bold ${stock.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stock.change24h >= 0 ? `+${stock.change24h}%` : `${stock.change24h}%`}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteStock(stock.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CRYPTO ONLY */}
      {activeTab === 'crypto' && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CoinIcon className="w-4 h-4" />
              Cryptocurrency Watchtower &amp; Quantitative Nodes ({crypto.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('thresholds')}
                className="px-3 py-1.5 bg-slate-900 border border-amber-400/40 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" /> Price Thresholds
              </button>
              <button
                onClick={() => {
                  setAddType('crypto');
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" /> Add Crypto
              </button>
            </div>
          </div>

          {crypto.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <CoinIcon className="w-8 h-8 text-amber-400/50 mx-auto" />
              <div className="text-sm font-bold text-white">No Crypto Added</div>
              <p className="text-xs text-slate-400">Add the tokens your son or you want to track.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {crypto.map((c) => (
                <div key={c.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-amber-300 text-base">{c.symbol}</div>
                    <span className="text-xs text-slate-400">{c.name}</span>
                  </div>
                  <div className="text-xl font-bold text-white">${c.currentPrice}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="text-emerald-400">TP: ${c.alertHigh || Math.round(c.currentPrice * 1.2)}</span>
                    <span className="text-rose-400">SL: ${c.alertLow || Math.round(c.currentPrice * 0.85)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Holdings: {c.amount}</span>
                    <button onClick={() => handleDeleteCrypto(c.id)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: STOCKS ONLY */}
      {activeTab === 'stocks' && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <DollarIcon className="w-4 h-4" />
              Stock Equities Watchtower ({stocks.length})
            </h3>
            <button
              onClick={() => {
                setAddType('stock');
                setShowAddModal(true);
              }}
              className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" /> Add Stock
            </button>
          </div>

          {stocks.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <DollarIcon className="w-8 h-8 text-amber-400/50 mx-auto" />
              <div className="text-sm font-bold text-white">No Stock Equities Added</div>
              <p className="text-xs text-slate-400">Add the stock tickers you want to track.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stocks.map((s) => (
                <div key={s.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-amber-300 text-base">{s.ticker}</div>
                    <span className="text-xs text-slate-400">{s.name}</span>
                  </div>
                  <div className="text-xl font-bold text-white">${s.currentPrice}</div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Shares: {s.shares}</span>
                    <button onClick={() => handleDeleteStock(s.id)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: AI SENTINEL */}
      {activeTab === 'ai_sentinel' && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <SparkleIcon className="w-4 h-4" />
              Gemini Quantitative Sentinel Risk Audit
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
              REAL-TIME RISK SYNTHESIS
            </span>
          </div>

          {!insight ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <SparkleIcon className="w-8 h-8 text-amber-400/50 mx-auto" />
              <div className="text-sm font-bold text-white">No Audit Generated Yet</div>
              <p className="text-xs text-slate-400">Click below to run a quantitative risk and volatility audit.</p>
              <button
                onClick={runAiPortfolioAudit}
                disabled={isAuditing}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                {isAuditing ? 'Auditing...' : 'Run Quantitative Audit'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs uppercase font-bold text-amber-400">Market Summary</div>
                <p className="text-xs text-slate-300 leading-relaxed">{insight.marketSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs uppercase font-bold text-emerald-400">Key Actionables</div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {insight.keyActionables.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs uppercase font-bold text-amber-400">Hedge Recommendations</div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {insight.hedgeRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Position to Watchtower
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setAddType('crypto')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  addType === 'crypto' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                }`}
              >
                Cryptocurrency
              </button>
              <button
                type="button"
                onClick={() => setAddType('stock')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  addType === 'stock' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                }`}
              >
                Stock Equity
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  {addType === 'crypto' ? 'Token Symbol (e.g. SOL)' : 'Ticker (e.g. NVDA)'}
                </label>
                <input
                  type="text"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  placeholder={addType === 'crypto' ? 'SOL' : 'NVDA'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Asset Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={addType === 'crypto' ? 'Solana' : 'NVIDIA Corporation'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    {addType === 'crypto' ? 'Amount Held' : 'Shares'}
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Buy / Current Price ($)</label>
                  <input
                    type="number"
                    value={newBuyPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewBuyPrice(val);
                      setNewCurrentPrice(val);
                      setNewAlertHigh(parseFloat((val * 1.25).toFixed(2)));
                      setNewAlertLow(parseFloat((val * 0.85).toFixed(2)));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {addType === 'crypto' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Take-Profit ($)</label>
                    <input
                      type="number"
                      value={newAlertHigh}
                      onChange={(e) => setNewAlertHigh(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 uppercase font-bold block mb-1">Stop-Loss ($)</label>
                    <input
                      type="number"
                      value={newAlertLow}
                      onChange={(e) => setNewAlertLow(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAsset}
                disabled={!newTicker.trim()}
                className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Confirm &amp; Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web3 & MetaMask Wallet Integration Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Web3 &amp; Crypto Wallet Watchtower
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Connect MetaMask, Rabby, or track any public EVM/Solana address.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Active Status */}
            {connectedWallet ? (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Wallet Connected
                  </span>
                  <button
                    type="button"
                    onClick={handleDisconnectWallet}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-xs text-amber-300 select-all break-all border border-slate-800">
                  {connectedWallet}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1-Click MetaMask Connect */}
                <button
                  type="button"
                  onClick={handleConnectMetaMask}
                  disabled={isConnectingWallet}
                  className="w-full p-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-between shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🦊</span>
                    <div className="text-left">
                      <div className="font-bold">Connect Browser MetaMask</div>
                      <div className="text-[10px] opacity-80">Auto-detect Ethereum &amp; Web3 providers</div>
                    </div>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    {isConnectingWallet ? 'Connecting...' : 'Connect →'}
                  </span>
                </button>

                {/* Status or Fallback Message */}
                {walletStatusMsg && (
                  <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-xl text-xs text-slate-300">
                    <div className="text-amber-300 font-bold text-[11px] mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Notice:
                    </div>
                    {walletStatusMsg}
                  </div>
                )}

                {/* Manual Address Tracking Option */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">
                    Or Track Any Public Wallet Address (Ethereum / Solana / Polygon):
                  </label>
                  <form onSubmit={handleManualWalletSave} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x... or Solana public key"
                      value={manualWalletAddress}
                      onChange={(e) => setManualWalletAddress(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!manualWalletAddress.trim()}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Track
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Quick Demo Wallet Addresses */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-400">Quick Test / Demo Addresses:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { label: 'Ethereum Whale Vault', addr: '0x28C6c06298d514Db089934071355E5743bf21d60' },
                  { label: 'Solana Treasury Cold Wallet', addr: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' },
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setConnectedWallet(demo.addr);
                      localStorage.setItem('abel_ai_connected_wallet', demo.addr);
                      setWalletStatusMsg(`Now monitoring ${demo.label}`);
                    }}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-[10px] text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-white">{demo.label}</div>
                    <div className="font-mono text-slate-500 truncate">{demo.addr}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
