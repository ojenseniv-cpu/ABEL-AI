import React, { useState, useEffect } from 'react';
import {
  NavSection,
  EmailItem,
  PhoneCallRecord,
  StockHolding,
  CryptoHolding,
  AutomationRule,
  BuilderProject,
  ShopKnowledgeBase,
  PersonalProfile,
  CalendarTask,
  VoiceConfig,
  VoicePersona,
  UserProfile,
  BrainstormSession,
} from './types';
import {
  defaultPersonalProfile,
  defaultShopKnowledge,
  initialEmails,
  initialCallRecords,
  initialStocks,
  initialCrypto,
  initialAutomationRules,
  sampleBuilderProject,
  initialCalendarTasks,
  initialBrainstormSessions,
  defaultUsersList,
} from './data/mockData';
import { Header } from './components/Header';
import { AbelCoreHome } from './components/AbelCoreHome';
import { BrainstormStudio } from './components/BrainstormStudio';
import { BuilderAgent } from './components/BuilderAgent';
import { PhoneSecretary } from './components/PhoneSecretary';
import { EmailIntelligence } from './components/EmailIntelligence';
import { PortfolioWatchtower } from './components/PortfolioWatchtower';
import { CalendarScheduler } from './components/CalendarScheduler';
import { AutomationsCenter } from './components/AutomationsCenter';
import { PersonalizationCenter } from './components/PersonalizationCenter';
import { TikTokStudio } from './components/TikTokStudio';
import { VoiceCommandHUD } from './components/VoiceCommandHUD';
import { OnboardingModal } from './components/OnboardingModal';
import { WindowsTitlebarAndTray } from './components/WindowsTitlebarAndTray';
import { WindowsInstallModal } from './components/WindowsInstallModal';
import { MicrophoneVoiceAdaptationStudio } from './components/MicrophoneVoiceAdaptationStudio';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('core');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAudioCalibrationModal, setShowAudioCalibrationModal] = useState(false);
  const [isVoiceHUDOpen, setIsVoiceHUDOpen] = useState(false);
  const [isMinimizedToTray, setIsMinimizedToTray] = useState(false);

  // Persistent States with localStorage Fallback
  const [profile, setProfile] = useState<PersonalProfile>(() => {
    const saved = localStorage.getItem('abel_ai_profile_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.voiceConfig) parsed.voiceConfig = defaultPersonalProfile.voiceConfig;
        if (!parsed.themeConfig) parsed.themeConfig = defaultPersonalProfile.themeConfig;
        if (!parsed.antiGravity) parsed.antiGravity = defaultPersonalProfile.antiGravity;
        return parsed;
      } catch (e) {}
    }
    return defaultPersonalProfile;
  });

  const [knowledgeBase, setKnowledgeBase] = useState<ShopKnowledgeBase>(() => {
    const saved = localStorage.getItem('abel_ai_kb');
    return saved ? JSON.parse(saved) : defaultShopKnowledge;
  });

  const [emails, setEmails] = useState<EmailItem[]>(() => {
    const saved = localStorage.getItem('abel_ai_emails');
    return saved ? JSON.parse(saved) : initialEmails;
  });

  const [callRecords, setCallRecords] = useState<PhoneCallRecord[]>(() => {
    const saved = localStorage.getItem('abel_ai_calls');
    return saved ? JSON.parse(saved) : initialCallRecords;
  });

  const [stocks, setStocks] = useState<StockHolding[]>(() => {
    const saved = localStorage.getItem('abel_ai_stocks');
    return saved ? JSON.parse(saved) : initialStocks;
  });

  const [crypto, setCrypto] = useState<CryptoHolding[]>(() => {
    const saved = localStorage.getItem('abel_ai_crypto');
    return saved ? JSON.parse(saved) : initialCrypto;
  });

  const [tasks, setTasks] = useState<CalendarTask[]>(() => {
    const saved = localStorage.getItem('abel_ai_calendar_tasks');
    return saved ? JSON.parse(saved) : initialCalendarTasks;
  });

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem('abel_ai_rules');
    return saved ? JSON.parse(saved) : initialAutomationRules;
  });

  const [builderProjects, setBuilderProjects] = useState<BuilderProject[]>(() => {
    const saved = localStorage.getItem('abel_ai_builder_projects');
    return saved ? JSON.parse(saved) : [sampleBuilderProject];
  });

  const [brainstormSessions, setBrainstormSessions] = useState<BrainstormSession[]>(() => {
    const saved = localStorage.getItem('abel_ai_brainstorm_sessions');
    return saved ? JSON.parse(saved) : initialBrainstormSessions;
  });

  const [automationLogs, setAutomationLogs] = useState<
    { id: string; timestamp: string; message: string }[]
  >([
    {
      id: 'log-1',
      timestamp: 'Today, 7:15 AM',
      message: 'Abel AI Dispatch: Auto-confirm SMS sent for Thursday 10:00 AM WRX Brake Service.',
    },
    {
      id: 'log-2',
      timestamp: 'Today, 6:00 AM',
      message: 'Abel AI Watchtower: Portfolio risk analysis generated for NVDA & SOL holdings.',
    },
    {
      id: 'log-3',
      timestamp: 'Today, 5:45 AM',
      message: 'Abel AI Voice OS online. Wake word "Hey Abel" and Hotkey [Space] active.',
    },
  ]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('abel_ai_profile_v5', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('abel_ai_kb', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  useEffect(() => {
    localStorage.setItem('abel_ai_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('abel_ai_calls', JSON.stringify(callRecords));
  }, [callRecords]);

  useEffect(() => {
    localStorage.setItem('abel_ai_stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('abel_ai_crypto', JSON.stringify(crypto));
  }, [crypto]);

  useEffect(() => {
    localStorage.setItem('abel_ai_calendar_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('abel_ai_rules', JSON.stringify(automationRules));
  }, [automationRules]);

  useEffect(() => {
    localStorage.setItem('abel_ai_builder_projects', JSON.stringify(builderProjects));
  }, [builderProjects]);

  useEffect(() => {
    localStorage.setItem('abel_ai_brainstorm_sessions', JSON.stringify(brainstormSessions));
  }, [brainstormSessions]);

  // Check first-time onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('abel_ai_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // Cross-Module Automation Event Dispatcher
  const handleTriggerAutomation = (triggerEvent: string, details: string) => {
    const matchedRules = automationRules.filter(
      (r) => r.enabled && r.triggerEvent === triggerEvent
    );

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logItem = {
      id: `log-${Date.now()}`,
      timestamp: `Today, ${nowStr}`,
      message: `Event [${triggerEvent}]: ${details}`,
    };
    setAutomationLogs((prev) => [logItem, ...prev]);

    if (matchedRules.length > 0) {
      setAutomationRules((prev) =>
        prev.map((r) =>
          r.triggerEvent === triggerEvent && r.enabled
            ? { ...r, executionCount: r.executionCount + 1, lastTriggered: `Today, ${nowStr}` }
            : r
        )
      );
    }
  };

  // State update handlers
  const handleUpdateEmail = (updated: EmailItem) => {
    setEmails((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleAddEmail = (newEmail: EmailItem) => {
    setEmails((prev) => [newEmail, ...prev]);
  };

  const handleAddCallRecord = (record: PhoneCallRecord) => {
    setCallRecords((prev) => [record, ...prev]);

    if (record.intent === 'booking_service' && record.customerDetails) {
      const scheduledTask: CalendarTask = {
        id: `task-call-${record.id}`,
        title: `${record.callerName} - ${record.customerDetails.vehicleOrItem || 'Shop Service'}`,
        description: `Auto-scheduled from Abel AI Phone Call. Summary: ${record.summary}`,
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '10:00',
        durationMinutes: 90,
        category: 'shop_service',
        priority: 'high',
        completed: false,
        sourceModule: 'phone_secretary',
        relatedEntityId: record.id,
        attendeeOrCustomer: record.callerName,
        location: 'Workshop Bay 1',
      };
      setTasks((prev) => [scheduledTask, ...prev]);
      handleTriggerAutomation(
        'call_booking_created',
        `Automated booking dispatched to Calendar for ${record.callerName} (${scheduledTask.date} 10:00 AM)`
      );
    }
  };

  const handleAddBuilderProject = (project: BuilderProject) => {
    setBuilderProjects((prev) => [project, ...prev]);
  };

  const handleUpdateBuilderProject = (project: BuilderProject) => {
    setBuilderProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
  };

  const handleAddTask = (newTask: CalendarTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: CalendarTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddStock = (newStock: StockHolding) => {
    setStocks((prev) => {
      const existing = prev.find((s) => s.ticker === newStock.ticker);
      if (existing) {
        return prev.map((s) =>
          s.ticker === newStock.ticker ? { ...s, shares: s.shares + newStock.shares } : s
        );
      }
      return [newStock, ...prev];
    });
  };

  const handleAddCrypto = (newCrypto: CryptoHolding) => {
    setCrypto((prev) => {
      const existing = prev.find((c) => c.symbol === newCrypto.symbol);
      if (existing) {
        return prev.map((c) =>
          c.symbol === newCrypto.symbol ? { ...c, amount: c.amount + newCrypto.amount } : c
        );
      }
      return [newCrypto, ...prev];
    });
  };

  const handleUpdateVoiceConfig = (newConfig: VoiceConfig) => {
    setProfile((prev) => ({ ...prev, voiceConfig: newConfig }));
  };

  const handlePersonaChange = (persona: VoicePersona) => {
    setProfile((prev) => ({
      ...prev,
      voiceConfig: {
        ...prev.voiceConfig,
        activePersona: persona,
      },
    }));
  };

  const handleExportData = () => {
    const fullBackup = {
      profile,
      knowledgeBase,
      emails,
      callRecords,
      stocks,
      crypto,
      tasks,
      automationRules,
      builderProjects,
      brainstormSessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abel-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all Abel AI data back to factory defaults?')) {
      localStorage.clear();
      setProfile(defaultPersonalProfile);
      setKnowledgeBase(defaultShopKnowledge);
      setEmails(initialEmails);
      setCallRecords(initialCallRecords);
      setStocks(initialStocks);
      setCrypto(initialCrypto);
      setTasks(initialCalendarTasks);
      setAutomationRules(initialAutomationRules);
      setBuilderProjects([sampleBuilderProject]);
      setBrainstormSessions(initialBrainstormSessions);
      alert('Abel AI reset to factory defaults!');
    }
  };

  const handleOnboardingComplete = (user: UserProfile) => {
    localStorage.setItem('abel_ai_onboarded', 'true');
    const updatedUsers = [...(profile.allUsers || defaultUsersList), user];
    setProfile((prev) => ({
      ...prev,
      activeUser: user,
      allUsers: updatedUsers,
      fullName: user.name,
      ownerEmail: user.email,
    }));
    setShowOnboarding(false);
  };

  const handleSwitchUser = (user: UserProfile) => {
    setProfile((prev) => ({
      ...prev,
      activeUser: user,
      fullName: user.name,
      ownerEmail: user.email,
    }));
    setShowOnboarding(false);
  };

  const unreadEmailsCount = emails.filter((e) => !e.read).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const currentTheme = profile.themeConfig || defaultPersonalProfile.themeConfig || {
    goldPalette: 'pure_amber',
    backgroundAesthetic: 'pure_abyss_black',
    fontStyle: 'tech_mono',
    glowIntensity: 'balanced',
    pulseSpeed: 'medium_pulse',
    goldAccentBrightness: 100,
    borderSharpness: 'rounded_2xl',
    enableAmbientScanline: false,
    enableHologramGrid: true,
  };

  const bgClass =
    currentTheme.backgroundAesthetic === 'pure_abyss_black'
      ? 'bg-black'
      : currentTheme.backgroundAesthetic === 'obsidian_titanium'
      ? 'bg-[#0B0D14]'
      : currentTheme.backgroundAesthetic === 'midnight_matrix'
      ? 'bg-[#030712]'
      : 'bg-slate-950';

  const fontClass =
    currentTheme.fontStyle === 'tech_mono'
      ? 'font-tech-mono'
      : currentTheme.fontStyle === 'cyber_sans'
      ? 'font-cyber-sans'
      : currentTheme.fontStyle === 'executive_modern'
      ? 'font-executive-modern'
      : 'font-display-orbit';

  const pulseDuration =
    currentTheme.pulseSpeed === 'rapid_cyber'
      ? '0.8s'
      : currentTheme.pulseSpeed === 'medium_pulse'
      ? '2.0s'
      : currentTheme.pulseSpeed === 'slow_breathing'
      ? '4.0s'
      : '0s';

  return (
    <div
      className={`min-h-screen ${bgClass} text-slate-200 ${fontClass} flex flex-col selection:bg-amber-400 selection:text-slate-950 relative ${
        currentTheme.enableHologramGrid ? 'hologram-grid-bg' : ''
      }`}
      style={
        {
          '--pulse-speed': pulseDuration,
          filter:
            currentTheme.goldAccentBrightness !== 100
              ? `contrast(${Math.max(90, Math.min(130, currentTheme.goldAccentBrightness))}%)`
              : undefined,
        } as React.CSSProperties
      }
    >
      {currentTheme.enableAmbientScanline && <div className="fixed inset-0 scanline-overlay z-50 pointer-events-none" />}

      {/* 1. Native Windows Titlebar & System Tray Integration */}
      <WindowsTitlebarAndTray
        isMinimizedToTray={isMinimizedToTray}
        onToggleMinimizeToTray={setIsMinimizedToTray}
        voiceConfig={profile.voiceConfig || defaultPersonalProfile.voiceConfig}
        onOpenVoiceHUD={() => setIsVoiceHUDOpen(true)}
        onOpenSettings={() => {
          setCurrentSection('settings');
          setIsMinimizedToTray(false);
        }}
        activePersona={profile.voiceConfig?.activePersona || 'witty_female'}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenAudioCalibration={() => setShowAudioCalibrationModal(true)}
      />

      {/* Top Header & Navigation */}
      <Header
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        unreadEmailsCount={unreadEmailsCount}
        activeCallCount={0}
        pendingTasksCount={pendingTasksCount}
        phoneStatus={profile.telephoneLineStatus}
        activePersona={profile.voiceConfig?.activePersona || 'witty_female'}
        onPersonaChange={handlePersonaChange}
        activeUser={profile.activeUser}
        onOpenUserModal={() => setShowOnboarding(true)}
        visibleModules={profile.visibleModules}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenAudioCalibration={() => setShowAudioCalibrationModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {currentSection === 'core' && (
          <AbelCoreHome
            profile={profile}
            voiceConfig={profile.voiceConfig || defaultPersonalProfile.voiceConfig}
            onUpdateVoiceConfig={handleUpdateVoiceConfig}
            onNavigate={setCurrentSection}
            stocks={stocks}
            crypto={crypto}
            tasks={tasks}
            builderProjects={builderProjects}
            emails={emails}
            onTriggerVoiceHUD={() => setIsVoiceHUDOpen(true)}
          />
        )}

        {currentSection === 'brainstorm' && (
          <BrainstormStudio
            sessions={brainstormSessions}
            activePersona={profile.voiceConfig?.activePersona || 'witty_female'}
            onConvertToProject={(proj) => {
              const newProj: BuilderProject = {
                id: `proj-${Date.now()}`,
                title: proj.title || 'Abel AI Game Concept',
                prompt: proj.prompt || 'Custom project',
                targetStack: 'React + HTML5 Canvas + Tailwind Black & Gold',
                type: proj.type || 'video_game',
                strictConstraints: proj.strictConstraints || [
                  'Playable 2D canvas game loop',
                  'Black and gold design tokens',
                ],
                negativeConstraints: proj.negativeConstraints || ['No unwanted login screens'],
                architecturePlan: 'Architecture compiled from Brainstorming Studio.',
                files: [
                  {
                    filename: 'AbelPlayableArcade.tsx',
                    path: '/src/components/AbelPlayableArcade.tsx',
                    language: 'typescript',
                    purpose: 'Playable game compiled from brainstorming session',
                    code: `// Compiled from Abel AI Brainstorming Studio\nimport React from 'react';\n\nexport default function AbelPlayableArcade() {\n  return <div className="p-6 bg-black text-amber-400 font-mono">Game Active</div>;\n}`,
                  },
                ],
                designTokens: sampleBuilderProject.designTokens,
                complianceReport: sampleBuilderProject.complianceReport,
                previewHtml: sampleBuilderProject.previewHtml,
                status: 'review_ready',
                progressPercent: 100,
                statusMessage: 'Ready for User Approval & Deployment!',
                createdAt: 'Just now',
              };
              handleAddBuilderProject(newProj);
            }}
            onNavigate={setCurrentSection}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {currentSection === 'builder' && (
          <BuilderAgent
            projects={builderProjects}
            onAddProject={handleAddBuilderProject}
            onUpdateProject={handleUpdateBuilderProject}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {currentSection === 'tiktok' && (
          <TikTokStudio
            onAddTask={handleAddTask}
            onTriggerAutomation={handleTriggerAutomation}
            activePersona={profile.voiceConfig?.activePersona || 'witty_female'}
          />
        )}

        {currentSection === 'telephone' && (
          <PhoneSecretary
            knowledgeBase={knowledgeBase}
            onUpdateKnowledge={setKnowledgeBase}
            callRecords={callRecords}
            onAddCallRecord={handleAddCallRecord}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {currentSection === 'email' && (
          <EmailIntelligence
            emails={emails}
            personalProfile={profile}
            onUpdateEmail={handleUpdateEmail}
            onAddEmail={handleAddEmail}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {currentSection === 'calendar' && (
          <CalendarScheduler
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onTriggerAutomation={handleTriggerAutomation}
          />
        )}

        {currentSection === 'portfolio' && (
          <PortfolioWatchtower
            stocks={stocks}
            crypto={crypto}
            onUpdateStocks={setStocks}
            onUpdateCrypto={setCrypto}
            onTriggerAutomation={handleTriggerAutomation}
            onNavigateToSettings={() => setCurrentSection('settings')}
          />
        )}

        {currentSection === 'automations' && (
          <AutomationsCenter
            rules={automationRules}
            onUpdateRules={setAutomationRules}
            recentLogs={automationLogs}
          />
        )}

        {currentSection === 'settings' && (
          <PersonalizationCenter
            profile={profile}
            onUpdateProfile={setProfile}
            stocks={stocks}
            crypto={crypto}
            onUpdateStocks={setStocks}
            onUpdateCrypto={setCrypto}
            knowledgeBase={knowledgeBase}
            onUpdateKnowledge={setKnowledgeBase}
            onExportData={handleExportData}
            onResetData={handleResetData}
            onOpenAudioCalibration={() => setShowAudioCalibrationModal(true)}
            onOpenInstallModal={() => setShowInstallModal(true)}
          />
        )}
      </main>

      {/* Global Voice Command HUD & Hotkey Listener */}
      <VoiceCommandHUD
        currentSection={currentSection}
        voiceConfig={profile.voiceConfig || defaultPersonalProfile.voiceConfig}
        onUpdateVoiceConfig={handleUpdateVoiceConfig}
        onNavigate={setCurrentSection}
        onAddTask={handleAddTask}
        onAddStock={handleAddStock}
        onAddCrypto={handleAddCrypto}
        onTriggerAutomation={handleTriggerAutomation}
        isOpenExternal={isVoiceHUDOpen}
        onCloseExternal={() => setIsVoiceHUDOpen(false)}
        onRestoreFromTray={() => setIsMinimizedToTray(false)}
      />

      {/* Launch-Time Registration & Multi-User Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        existingUsers={profile.allUsers || defaultUsersList}
        onSwitchUser={handleSwitchUser}
      />

      {/* Dedicated Windows Desktop & Daemon Installer Modal */}
      <WindowsInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        wakeWord={profile.voiceConfig?.wakeWord}
        triggerHotkey={profile.voiceConfig?.triggerKeyDisplay}
        onOpenAudioCalibration={() => setShowAudioCalibrationModal(true)}
      />

      {/* Windows Microphone & Voice Adaptation Studio */}
      <MicrophoneVoiceAdaptationStudio
        isOpen={showAudioCalibrationModal}
        onClose={() => setShowAudioCalibrationModal(false)}
        currentWakeWord={profile.voiceConfig?.wakeWord || 'hey abel'}
        onUpdateWakeWord={(newWake) => {
          handleUpdateVoiceConfig({
            ...profile.voiceConfig,
            wakeWord: newWake,
          } as VoiceConfig);
        }}
        triggerHotkey={profile.voiceConfig?.triggerKeyDisplay || 'Space'}
        onUpdateTriggerHotkey={(newKey) => {
          handleUpdateVoiceConfig({
            ...profile.voiceConfig,
            triggerKeyDisplay: newKey,
          } as VoiceConfig);
        }}
      />

      {/* Luxury Black & Gold Telemetry Footer */}
      <footer className="h-11 bg-slate-950 border-t border-amber-500/30 px-6 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs shadow-inner">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              VOICE TRIGGER:{' '}
              <strong className="text-amber-300">
                [{profile.voiceConfig?.triggerKeyDisplay || 'Space'}]
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              WAKE WORD:{' '}
              <strong className="text-amber-300">
                "{profile.voiceConfig?.wakeWord || 'hey abel'}"
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              PERSONA:{' '}
              <strong className="text-amber-300">
                {profile.voiceConfig?.activePersona?.toUpperCase() || 'WITTY_FEMALE'}
              </strong>
            </span>
          </div>
        </div>

        <div className="text-[10px] text-amber-400/90 tracking-wider">
          ABEL AI • BLACK &amp; GOLD v5.0
        </div>
      </footer>
    </div>
  );
}
