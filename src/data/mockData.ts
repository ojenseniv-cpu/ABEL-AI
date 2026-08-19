import {
  EmailItem,
  PhoneCallRecord,
  StockHolding,
  CryptoHolding,
  ShopKnowledgeBase,
  PersonalProfile,
  AutomationRule,
  BuilderProject,
  CalendarTask,
  BrainstormSession,
  UserProfile,
} from '../types';

export const defaultUsersList: UserProfile[] = [
  {
    id: 'usr-primary',
    name: 'Primary Executive',
    role: 'System Owner / Architect',
    email: '',
    avatarColor: 'from-amber-400 to-yellow-600',
    isRegistered: true,
    registeredAt: new Date().toISOString(),
  },
];

export const defaultThemeConfig = {
  goldPalette: 'pure_amber' as const,
  backgroundAesthetic: 'pure_abyss_black' as const,
  fontStyle: 'tech_mono' as const,
  glowIntensity: 'balanced' as const,
  pulseSpeed: 'medium_pulse' as const,
  goldAccentBrightness: 100,
  borderSharpness: 'rounded_2xl' as const,
  enableAmbientScanline: false,
  enableHologramGrid: true,
};

export const defaultPersonalProfile: PersonalProfile = {
  fullName: '',
  ownerEmail: '',
  companyEmail: '',
  companyName: '',
  telephoneLineStatus: 'online_ai',
  personalTone: 'direct_and_professional',
  aiBuilderStrictness: 'ultra_strict_no_hallucinations',
  notificationChannel: 'push_dashboard',
  hasCompletedOnboarding: true,
  activeUser: defaultUsersList[0],
  allUsers: defaultUsersList,
  connectedEmails: [],
  themeConfig: defaultThemeConfig,
  visibleModules: {
    core: true,
    brainstorm: true,
    builder: true,
    telephone: true,
    email: true,
    calendar: true,
    portfolio: true,
    automations: true,
    settings: true,
  },
  voiceConfig: {
    activePersona: 'witty_female',
    wakeWord: 'hey abel',
    wakeWordEnabled: true,
    wakeWordSensitivity: 'medium',
    triggerKey: 'Space',
    triggerKeyDisplay: 'Space',
    triggerModifiers: {
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    },
    hotkeyMode: 'toggle',
    minimizeToTrayOnClose: true,
    voiceFeedbackEnabled: true,
    voicePitch: 1.0,
    voiceRate: 1.0,
    continuousListening: false,
  },
  antiGravity: {
    geminiApiKey: '',
    enableAntiGravitySync: true,
    antiGravityEndpoint: 'https://antigravity.internal/v1/bridge',
    googleOAuthClientId: '',
    companySmtpHost: '',
    companySmtpPort: '587',
    companySmtpUser: '',
    companySmtpPass: '',
    phoneWebhookUrl: '',
    stockApiKey: '',
    cryptoApiKey: '',
    windowsInstallerOptions: {
      installPath: 'C:\\Users\\User\\AppData\\Local\\AbelAI',
      createDesktopShortcut: true,
      startWithWindows: true,
      allowMultiUserSwitching: true,
    },
  },
};

export const defaultShopKnowledge: ShopKnowledgeBase = {
  shopName: '',
  shopType: 'Workshop & Fabrication Center',
  phone: '',
  address: '',
  businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM | Saturday: 9:00 AM - 2:00 PM',
  hourlyLaborRate: 125,
  standardServices: [],
  emergencyProtocol: 'Forward high-priority and emergency calls directly to mobile dispatch line.',
  faqs: [],
  vipCallers: [],
};

// Clean zero-data initial states (all real data entered by user in Settings or modules)
export const initialEmails: EmailItem[] = [];

export const initialCallRecords: PhoneCallRecord[] = [];

export const initialStocks: StockHolding[] = [];

export const initialCrypto: CryptoHolding[] = [];

export const initialCalendarTasks: CalendarTask[] = [];

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-Dispatch Service Booking',
    description: 'When shop secretary completes an appointment booking, send confirmation email & SMS.',
    triggerEvent: 'call_booking_created',
    conditions: 'true',
    actions: ['auto_email_customer'],
    enabled: true,
    executionCount: 0,
    lastTriggered: 'Pending execution',
  },
  {
    id: 'rule-2',
    name: 'Urgent Lead Notification',
    description: 'Send high-priority notification when an urgent inquiry or lead arrives.',
    triggerEvent: 'urgent_email_received',
    conditions: 'priority == urgent',
    actions: ['send_sms_to_owner'],
    enabled: true,
    executionCount: 0,
    lastTriggered: 'Pending execution',
  },
  {
    id: 'rule-3',
    name: 'Crypto & Stock Volatility Alert',
    description: 'Synthesize quantitative market report when price triggers breach 5% threshold.',
    triggerEvent: 'crypto_price_alert',
    conditions: 'delta > 5%',
    actions: ['trigger_market_digest'],
    enabled: true,
    executionCount: 0,
    lastTriggered: 'Pending execution',
  },
];

export const sampleBuilderProject: BuilderProject = {
  id: 'proj-init',
  title: 'Abel 2D Arcade Engine',
  prompt: 'A fast 2D space explorer arcade with particle explosions, score counter, and black/gold aesthetic',
  targetStack: 'React + HTML5 Canvas + Tailwind',
  type: 'video_game',
  status: 'review_ready',
  progressPercent: 100,
  statusMessage: 'Build verified and ready for review',
  strictConstraints: [
    'Pure 2D HTML5 canvas rendering loop',
    'Responsive keyboard controls (Arrow Keys / WASD + Space)',
    'Black and gold color palette',
  ],
  negativeConstraints: [
    'No external 3D libraries or heavy dependencies',
    'No unrequested login popups or auth walls',
  ],
  createdAt: 'Initial Template',
  architecturePlan: 'Single component 60FPS canvas engine with player ship, asteroid spawner, score counter, and particle physics.',
  files: [
    {
      filename: 'AbelArcadeGame.tsx',
      path: '/src/components/AbelArcadeGame.tsx',
      language: 'typescript',
      purpose: 'Self-contained 2D Canvas space arcade game',
      code: `// Abel AI Playable Canvas Game Engine\nexport default function AbelArcade() {\n  return <div className="p-4 text-amber-400 font-mono">Game Engine Ready</div>;\n}`,
    },
  ],
  designTokens: {
    fontFamilyDisplay: 'JetBrains Mono / Space Grotesk',
    fontFamilyBody: 'JetBrains Mono',
    colorPalette: [
      { name: 'Canvas Void', hex: '#050505', role: 'Primary background' },
      { name: 'Abel Gold', hex: '#fbbf24', role: 'Player ship and energy lasers' },
      { name: 'Solar Amber', hex: '#f59e0b', role: 'Score telemetry & UI' },
      { name: 'Cosmic Slate', hex: '#334155', role: 'Asteroid debris' },
    ],
    spacingScale: '16px base grid with 8px sub-divisions',
    layoutGuidelines: 'High contrast black and gold canvas framed by rounded tactile borders.',
  },
  complianceReport: {
    strictDirectiveAdherence: '100% compliant with prompt requirements.',
    zeroUnsolicitedFeaturesVerified: true,
    auditNotes: [
      'No unsolicited navigation or extraneous menus added',
      'Engine renders directly inside canvas viewport',
    ],
  },
  previewHtml: '<div style="background:#050505;color:#fbbf24;padding:24px;font-family:monospace;text-align:center;">Abel AI Game Engine Online</div>',
};

export const initialBrainstormSessions: BrainstormSession[] = [];
