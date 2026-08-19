import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Wrench,
  DollarSign,
  Plus,
  Send,
  Sparkles,
  BookOpen,
  History,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { PhoneCallRecord, ShopKnowledgeBase, CallMessage } from '../types';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../utils/audio';

interface PhoneSecretaryProps {
  knowledgeBase: ShopKnowledgeBase;
  onUpdateKnowledge: (kb: ShopKnowledgeBase) => void;
  callRecords: PhoneCallRecord[];
  onAddCallRecord: (record: PhoneCallRecord) => void;
  onTriggerAutomation?: (trigger: string, details: string) => void;
}

export const PhoneSecretary: React.FC<PhoneSecretaryProps> = ({
  knowledgeBase,
  onUpdateKnowledge,
  callRecords,
  onAddCallRecord,
  onTriggerAutomation,
}) => {
  const [activeTab, setActiveTab] = useState<'live_simulator' | 'call_logs' | 'knowledge_base'>('live_simulator');
  
  // Call Simulator State
  const [isInCall, setIsInCall] = useState(false);
  const [callerName, setCallerName] = useState('Marcus Vance');
  const [callerNumber, setCallerNumber] = useState('+1 (512) 555-8819');
  const [callerInput, setCallerInput] = useState('');
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [liveIntent, setLiveIntent] = useState<string>('general_question');
  const [extractedInfo, setExtractedInfo] = useState<{
    vehicleOrItem?: string;
    preferredDate?: string;
    quotedPrice?: string;
    callbackNumber?: string;
  }>({});
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  // Selected Call Log for details view
  const [selectedCallId, setSelectedCallId] = useState<string | null>(callRecords[0]?.id || null);
  const [filterIntent, setFilterIntent] = useState<string>('all');

  // Shop Knowledge Base Editor State
  const [editableKB, setEditableKB] = useState<ShopKnowledgeBase>(knowledgeBase);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick Scenarios for fast testing
  const quickScenarios = [
    {
      label: 'WRX Brake Vibration & 60k Service',
      caller: 'Sarah Jenkins',
      phone: '+1 (512) 555-0194',
      prompt: 'Hi! I drive a 2022 Subaru WRX and notice steering vibration under hard braking. Also need my 60k fluid service. Can I get a price estimate and book a time this week?',
    },
    {
      label: 'Porsche GT3 Dyno & Cooling Upgrade',
      caller: 'Marcus Vance',
      phone: '+1 (555) 302-8819',
      prompt: 'Hey Alex, Marcus here. Need to get the GT3 on the dyno for air-fuel logging before next weekend and get an auxiliary oil cooler installed. What is your bay availability Tuesday?',
    },
    {
      label: 'Suspension Clunk Inspection Under Warranty',
      caller: 'David Klein',
      phone: '+1 (512) 555-4920',
      prompt: 'Hey, you guys installed coilovers on my Mustang last Thursday. Noticing a slight clunk over steep driveways. Can I swing by for a quick check?',
    },
    {
      label: 'Spam Commercial Energy Telemarketer',
      caller: 'Apex Solar Solutions',
      phone: '+1 (800) 412-9901',
      prompt: 'Hello! I am calling regarding your commercial electricity bills for Precision Tech and can offer 40% government solar rebate savings today...',
    },
  ];

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessingAI]);

  // Call duration counter
  useEffect(() => {
    if (isInCall) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInCall]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start simulated phone call
  const startCall = async (caller: string, phone: string, initialPrompt?: string) => {
    setCallerName(caller);
    setCallerNumber(phone);
    setIsInCall(true);
    setExtractedInfo({});
    setLiveIntent('general_question');

    // Initial greeting from AI Virtual Secretary
    const greetingText = `Thank you for calling ${knowledgeBase.shopName}. This is Alex's automated shop receptionist. How can I assist you with your vehicle or project today?`;
    
    const initialMsgs: CallMessage[] = [
      {
        speaker: 'assistant',
        text: greetingText,
        time: '00:00',
      },
    ];

    setMessages(initialMsgs);

    if (audioEnabled) {
      setIsSpeaking(true);
      speakText(greetingText, () => setIsSpeaking(false));
    }

    // If a scenario initial prompt is provided, dispatch after a short delay
    if (initialPrompt) {
      setTimeout(() => {
        sendCallerMessage(initialPrompt, initialMsgs);
      }, 2000);
    }
  };

  // Send a caller message to backend agent
  const sendCallerMessage = async (text: string, currentHistory?: CallMessage[]) => {
    if (!text.trim()) return;

    const callerMsg: CallMessage = {
      speaker: 'caller',
      text: text.trim(),
      time: formatTime(callDuration),
    };

    const historyToUse = currentHistory || messages;
    const updatedMessages = [...historyToUse, callerMsg];
    setMessages(updatedMessages);
    setCallerInput('');
    setIsProcessingAI(true);

    try {
      const res = await fetch('/api/ai/phone-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledgeBase,
          history: updatedMessages,
          callerName,
          callerNumber,
          userUtterance: text,
        }),
      });

      const data = await res.json();
      setIsProcessingAI(false);

      if (data.assistantSpeech) {
        const assistantMsg: CallMessage = {
          speaker: 'assistant',
          text: data.assistantSpeech,
          time: formatTime(callDuration + 2),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.intent) setLiveIntent(data.intent);
        if (data.extractedDetails) {
          setExtractedInfo((prev) => ({ ...prev, ...data.extractedDetails }));
        }

        if (audioEnabled) {
          setIsSpeaking(true);
          speakText(data.assistantSpeech, () => setIsSpeaking(false));
        }

        // If call completed or booking made, trigger automations
        if (data.callCompleted || data.intent === 'booking_service') {
          if (onTriggerAutomation) {
            onTriggerAutomation(
              'call_booking_created',
              `Phone Secretary booked service for ${callerName} (${callerNumber}) - Intent: ${data.intent}`
            );
          }
        }
      }
    } catch (err) {
      console.error('Call processing error:', err);
      setIsProcessingAI(false);
      const fallbackMsg: CallMessage = {
        speaker: 'assistant',
        text: `I have noted your request regarding "${text}". Alex will review our shop bays and send a confirmation shortly.`,
        time: formatTime(callDuration + 1),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // Complete and log active call
  const endCall = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setIsListeningMic(false);
    setIsInCall(false);

    if (messages.length > 1) {
      const newRecord: PhoneCallRecord = {
        id: `call-${Date.now().toString().slice(-4)}`,
        callerName: callerName || 'Customer',
        callerNumber: callerNumber || '+1 (555) 000-0000',
        timestamp: 'Just now',
        durationSeconds: callDuration || 45,
        status: 'completed',
        intent: (liveIntent as any) || 'general_question',
        summary: `Call with ${callerName}. Intent: ${liveIntent}. Vehicle: ${extractedInfo.vehicleOrItem || 'General'}. Quoted: ${extractedInfo.quotedPrice || 'N/A'}.`,
        actionRequired: liveIntent === 'booking_service' || liveIntent === 'urgent_repair',
        followUpTask: extractedInfo.preferredDate 
          ? `Stage parts and reserve bay for ${extractedInfo.preferredDate}`
          : `Review notes for ${callerName}`,
        messages: [...messages],
        customerDetails: { ...extractedInfo, callbackNumber: callerNumber },
      };

      onAddCallRecord(newRecord);
      setSelectedCallId(newRecord.id);
    }
  };

  // Speech Recognition toggle
  const toggleMic = () => {
    if (isListeningMic) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListeningMic(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setCallerInput(transcript);
        },
        (err) => {
          console.warn('Speech recognition error/ended:', err);
          setIsListeningMic(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListeningMic(true);
      } else {
        alert('Web Speech Recognition is not supported or permitted in this browser.');
      }
    }
  };

  const handleSaveKnowledge = () => {
    onUpdateKnowledge(editableKB);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const selectedCall = callRecords.find((c) => c.id === selectedCallId) || callRecords[0];

  const filteredCalls = callRecords.filter((c) => {
    if (filterIntent === 'all') return true;
    return c.intent === filterIntent;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Header & Live Status Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">AI Virtual Telephone Secretary &amp; Receptionist</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                Line Active (VoIP)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Autonomous conversational agent answering shop calls, quotes, scheduling, and screening spam 24/7
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            id="tab-live-simulator"
            onClick={() => setActiveTab('live_simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'live_simulator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Live Simulator
          </button>
          <button
            id="tab-call-logs"
            onClick={() => setActiveTab('call_logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'call_logs'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Call Logs ({callRecords.length})
          </button>
          <button
            id="tab-knowledge-base"
            onClick={() => setActiveTab('knowledge_base')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'knowledge_base'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Shop Rules &amp; KB
          </button>
        </div>
      </div>

      {/* 1. LIVE CALL SIMULATOR */}
      {activeTab === 'live_simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Inbound Scenarios & Dialpad */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400" />
                  Communications Feed
                </h3>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Trigger realistic voice calls to see the AI Secretary answer in real-time, quote rates, and book appointments.
              </p>

              {/* Scenario Cards */}
              <div className="space-y-2.5">
                {quickScenarios.map((sc, idx) => (
                  <button
                    key={idx}
                    disabled={isInCall}
                    onClick={() => startCall(sc.caller, sc.phone, sc.prompt)}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {sc.label}
                      </span>
                      <Play className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{sc.caller}</span>
                      <span>•</span>
                      <span>{sc.phone}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Caller Setup */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Caller Line</h4>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Caller Name</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  disabled={isInCall}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 font-mono"
                  placeholder="e.g. Jason Miller"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Caller Phone Number</label>
                <input
                  type="text"
                  value={callerNumber}
                  onChange={(e) => setCallerNumber(e.target.value)}
                  disabled={isInCall}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 font-mono"
                  placeholder="e.g. +1 (512) 555-9012"
                />
              </div>
              <button
                onClick={() => startCall(callerName, callerNumber)}
                disabled={isInCall}
                className="w-full py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Initiate Inbound Call
              </button>
            </div>
          </div>

          {/* Center & Right Column: Interactive Phone Screen & Live Transcript Stream */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[580px]">
              {/* Call Header Status Bar */}
              <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isInCall ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-600'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {isInCall ? `Active Call: ${callerName}` : 'Virtual Receptionist Line: Ready'}
                      </span>
                      {isInCall && (
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                          {formatTime(callDuration)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {isInCall ? callerNumber : `${knowledgeBase.shopName} (${knowledgeBase.phone})`}
                    </span>
                  </div>
                </div>

                {/* Audio Controls & End Call */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAudioEnabled(!audioEnabled);
                      if (isSpeaking) stopSpeaking();
                    }}
                    title={audioEnabled ? 'Audio Voice Output Enabled' : 'Audio Muted'}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      audioEnabled
                        ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700'
                    }`}
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span className="hidden sm:inline">{audioEnabled ? 'Voice On' : 'Voice Off'}</span>
                  </button>

                  {isInCall ? (
                    <button
                      onClick={endCall}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      Hang Up &amp; Log
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">Awaiting Inbound</span>
                  )}
                </div>
              </div>

              {/* Extracted Intent & Details Bar */}
              {isInCall && (
                <div className="bg-slate-950/90 px-5 py-2.5 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">DETECTED INTENT:</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {liveIntent.replace('_', ' ')}
                    </span>
                  </div>
                  {extractedInfo.vehicleOrItem && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{extractedInfo.vehicleOrItem}</span>
                    </div>
                  )}
                  {extractedInfo.quotedPrice && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{extractedInfo.quotedPrice}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Live Transcript Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-900/30">
                {!isInCall && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-800/60 text-cyan-400 border border-slate-700/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                      <PhoneCall className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Virtual Receptionist Ready on Port 3000</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Click one of the quick scenario buttons on the left or enter a custom customer query to start a simulated telephone call.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isAssistant = msg.speaker === 'assistant';
                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-slate-400">
                          <span className="font-mono">{isAssistant ? 'AI Secretary (Alex\'s Desk)' : callerName}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">{msg.time}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isAssistant
                              ? 'bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-tl-xs font-sans'
                              : 'bg-cyan-600 text-slate-950 font-medium rounded-tr-xs shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}

                {isProcessingAI && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 text-xs text-cyan-300 border border-slate-700/40 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>AI Secretary formulating spoken response using shop knowledge base...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Interactive Caller Input Bar */}
              {isInCall && (
                <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5">
                  <button
                    onClick={toggleMic}
                    title="Speak using your microphone"
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isListeningMic
                        ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    {isListeningMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={callerInput}
                    onChange={(e) => setCallerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendCallerMessage(callerInput);
                      }
                    }}
                    placeholder={isListeningMic ? 'Listening to your microphone...' : 'Type customer response or question...'}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={() => sendCallerMessage(callerInput)}
                    disabled={!callerInput.trim() || isProcessingAI}
                    className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all flex items-center justify-center font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CALL LOGS & INBOX */}
      {activeTab === 'call_logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Calls */}
          <div className="space-y-3">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'booking_service', 'price_quote', 'urgent_repair', 'spam'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterIntent(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase whitespace-nowrap transition-colors ${
                    filterIntent === f
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredCalls.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No call logs found for this filter.
                </div>
              ) : (
                filteredCalls.map((call) => {
                  const isSelected = selectedCall?.id === call.id;
                  return (
                    <button
                      key={call.id}
                      onClick={() => setSelectedCallId(call.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-white">{call.callerName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{call.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed font-sans">
                        {call.summary}
                      </p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-semibold border border-cyan-500/20 uppercase">
                          {call.intent.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400 font-mono">{formatTime(call.durationSeconds)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Drawer */}
          <div className="lg:col-span-2">
            {selectedCall ? (
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-5">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedCall.callerName}
                      <span className="text-xs font-mono font-normal text-slate-400">
                        ({selectedCall.callerNumber})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Call Date: {selectedCall.timestamp} • Duration: {formatTime(selectedCall.durationSeconds)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {selectedCall.intent.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Extracted Details Grid */}
                {selectedCall.customerDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-0.5">Vehicle / Inquiry:</span>
                      <strong className="text-slate-200">{selectedCall.customerDetails.vehicleOrItem || 'General'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-0.5">Target Date:</span>
                      <strong className="text-cyan-300 font-mono">{selectedCall.customerDetails.preferredDate || 'Not specified'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-0.5">Quoted Estimate:</span>
                      <strong className="text-emerald-400 font-mono">{selectedCall.customerDetails.quotedPrice || 'Standard rate'}</strong>
                    </div>
                  </div>
                )}

                {/* Follow Up Action Callout */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-cyan-200 uppercase tracking-wider font-mono">Required Owner Action</h5>
                    <p className="text-xs text-slate-300 mt-0.5">{selectedCall.followUpTask}</p>
                  </div>
                </div>

                {/* Full Transcript Log */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Full Audio Call Transcript ({selectedCall.messages.length} exchanges)
                  </h4>
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {selectedCall.messages.map((m, idx) => (
                      <div key={idx} className="text-xs flex items-start gap-2">
                        <span
                          className={`font-semibold shrink-0 font-mono ${
                            m.speaker === 'assistant' ? 'text-cyan-400' : 'text-slate-300'
                          }`}
                        >
                          {m.speaker === 'assistant' ? 'AI Secretary:' : `${selectedCall.callerName}:`}
                        </span>
                        <span className="text-slate-300 leading-relaxed">{m.text}</span>
                        <span className="ml-auto font-mono text-[10px] text-slate-500 shrink-0">{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                Select a call log on the left to inspect transcripts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SHOP RULES & KNOWLEDGE BASE EDITOR */}
      {activeTab === 'knowledge_base' && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">Shop Knowledge Base &amp; Receptionist Directives</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                The AI Secretary uses this exact knowledge base to quote estimates, offer business hours, and screen callers.
              </p>
            </div>
            <button
              onClick={handleSaveKnowledge}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] self-start"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Knowledge Base
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Shop Knowledge Base updated! The AI Secretary has adopted the new rules.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Shop / Company Name</label>
              <input
                type="text"
                value={editableKB.shopName}
                onChange={(e) => setEditableKB({ ...editableKB, shopName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Phone Number</label>
              <input
                type="text"
                value={editableKB.phone}
                onChange={(e) => setEditableKB({ ...editableKB, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Hours</label>
              <input
                type="text"
                value={editableKB.businessHours}
                onChange={(e) => setEditableKB({ ...editableKB, businessHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hourly Labor Rate ($/hr)</label>
              <input
                type="number"
                value={editableKB.hourlyLaborRate}
                onChange={(e) => setEditableKB({ ...editableKB, hourlyLaborRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Emergency Towing &amp; After-Hours Protocol</label>
              <textarea
                rows={2}
                value={editableKB.emergencyProtocol}
                onChange={(e) => setEditableKB({ ...editableKB, emergencyProtocol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Standard Services Catalog */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Standard Service Catalog &amp; Pricing Rules
            </h4>
            <div className="space-y-3">
              {editableKB.standardServices.map((svc, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold font-mono block mb-1">Service</span>
                    <input
                      type="text"
                      value={svc.name}
                      onChange={(e) => {
                        const updated = [...editableKB.standardServices];
                        updated[idx].name = e.target.value;
                        setEditableKB({ ...editableKB, standardServices: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold font-mono block mb-1">Quoted Range</span>
                    <input
                      type="text"
                      value={svc.estimate}
                      onChange={(e) => {
                        const updated = [...editableKB.standardServices];
                        updated[idx].estimate = e.target.value;
                        setEditableKB({ ...editableKB, standardServices: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold font-mono block mb-1">Scope &amp; Details</span>
                    <input
                      type="text"
                      value={svc.description}
                      onChange={(e) => {
                        const updated = [...editableKB.standardServices];
                        updated[idx].description = e.target.value;
                        setEditableKB({ ...editableKB, standardServices: updated });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
