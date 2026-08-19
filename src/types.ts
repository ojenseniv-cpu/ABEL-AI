export type NavSection =
  | 'core'
  | 'brainstorm'
  | 'builder'
  | 'tiktok'
  | 'telephone'
  | 'email'
  | 'portfolio'
  | 'calendar'
  | 'automations'
  | 'settings';

export interface TikTokStoryboardScene {
  sceneNumber: number;
  visualPrompt: string;
  cameraMovement: string;
  textOverlay: string;
  durationSec: number;
  soundEffect: string;
  lightingCue?: string;
}

export interface TikTokVideoItem {
  id: string;
  title: string;
  prompt: string;
  aspectRatio: '9:16' | '16:9';
  style: string;
  caption: string;
  hashtags: string[];
  storyboard: TikTokStoryboardScene[];
  voiceoverScript: string;
  veoPrompt: string;
  musicSuggestion: string;
  status: 'draft' | 'generating' | 'ready' | 'posted' | 'scheduled';
  videoUrl?: string;
  thumbnailGradient?: string;
  createdAt: string;
  postedAt?: string;
  scheduledFor?: string;
  likes: number;
  views: number;
  comments: number;
  shares: number;
  sourceGoogleIdea?: string;
}

export type VoicePersona = 'witty_female' | 'the_joker' | 't1800_arnold';

export type EmailAccountType = 'google' | 'company';

export interface EmailItem {
  id: string;
  account: EmailAccountType;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  read: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'customer_lead' | 'invoice' | 'service_request' | 'internal' | 'personal' | 'spam';
  sentiment: 'positive' | 'neutral' | 'urgent_negative' | 'inquiry';
  actionItems: string[];
  suggestedReply?: string;
  isAutoReplied?: boolean;
  repliedAt?: string;
}

export interface CallMessage {
  speaker: 'caller' | 'assistant';
  text: string;
  time: string;
}

export interface PhoneCallRecord {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  durationSeconds: number;
  status: 'completed' | 'active' | 'missed' | 'forwarded_to_owner';
  intent: 'booking_service' | 'price_quote' | 'parts_inquiry' | 'urgent_repair' | 'general_question' | 'spam';
  summary: string;
  actionRequired: boolean;
  followUpTask: string;
  messages: CallMessage[];
  customerDetails?: {
    vehicleOrItem?: string;
    preferredDate?: string;
    quotedPrice?: string;
    callbackNumber?: string;
  };
}

export interface StockHolding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  change24h: number;
  alertHigh?: number;
  alertLow?: number;
  sector: string;
}

export type ThresholdTriggerAction =
  | 'send_sms_to_owner'
  | 'auto_email_customer'
  | 'create_calendar_task'
  | 'trigger_market_digest'
  | 'voice_announcement';

export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  change24h: number;
  alertHigh?: number; // Upper Take-Profit Threshold ($)
  alertLow?: number; // Lower Stop-Loss Threshold ($)
  highTriggerAction?: ThresholdTriggerAction;
  lowTriggerAction?: ThresholdTriggerAction;
  autoTriggerEnabled?: boolean;
  lastTriggeredAt?: string;
  lastTriggerStatus?: 'normal' | 'upper_breached' | 'lower_breached';
  network: string;
}

export interface PortfolioInsight {
  overallHealth: 'excellent' | 'moderate' | 'high_risk';
  marketSummary: string;
  keyActionables: string[];
  riskSentimentScore: number; // 0 to 100
  cryptoVolatilityScore: number; // 0 to 100
  hedgeRecommendations: string[];
  timestamp: string;
}

export interface GeneratedFile {
  filename: string;
  path: string;
  language: string;
  purpose: string;
  code: string;
}

export type BuilderPhase =
  | 'idle'
  | 'architecting'
  | 'synthesizing'
  | 'testing'
  | 'review_ready'
  | 'approved'
  | 'deployed'
  | 'rejected';

export interface BuilderProject {
  id: string;
  title: string;
  prompt: string;
  targetStack: string;
  type: 'video_game' | 'application' | 'automation_tool' | 'custom_software';
  status: BuilderPhase;
  progressPercent: number;
  statusMessage: string;
  strictConstraints: string[];
  negativeConstraints: string[];
  createdAt: string;
  architecturePlan: string;
  files: GeneratedFile[];
  designTokens: {
    fontFamilyDisplay: string;
    fontFamilyBody: string;
    colorPalette: { name: string; hex: string; role: string }[];
    spacingScale: string;
    layoutGuidelines: string;
  };
  complianceReport: {
    strictDirectiveAdherence: string;
    zeroUnsolicitedFeaturesVerified: boolean;
    auditNotes: string[];
  };
  previewHtml?: string;
  rejectionReason?: string;
}

export interface BrainstormMessage {
  id: string;
  sender: 'user' | 'abel';
  persona: VoicePersona;
  text: string;
  timestamp: string;
  extractedIdeas?: string[];
  actionPlanReady?: boolean;
}

export interface BrainstormSession {
  id: string;
  title: string;
  targetDomain: 'video_game' | 'business_app' | 'shop_utility' | 'automation' | 'creative';
  messages: BrainstormMessage[];
  keyFeatures: string[];
  targetAudience: string;
  readyForCodegen: boolean;
  projectDraftPrompt?: string;
}

export interface ShopKnowledgeBase {
  shopName: string;
  shopType: string;
  phone: string;
  address: string;
  businessHours: string;
  hourlyLaborRate: number;
  standardServices: { name: string; estimate: string; description: string }[];
  emergencyProtocol: string;
  faqs: { question: string; answer: string }[];
  vipCallers: { name: string; phone: string; notes: string }[];
}

export interface VoiceConfig {
  activePersona: VoicePersona;
  wakeWord: string; // e.g. "hey abel", "abel", "computer"
  wakeWordEnabled: boolean;
  wakeWordSensitivity: 'low' | 'medium' | 'high';
  triggerKey: string; // Key code e.g. "Space", "KeyV", "F2", etc.
  triggerKeyDisplay: string; // Visual label e.g. "Ctrl + Space", "Space", "Alt + V"
  triggerModifiers?: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
  hotkeyMode: 'toggle' | 'push_to_talk';
  minimizeToTrayOnClose: boolean;
  voiceFeedbackEnabled: boolean;
  voicePitch: number;
  voiceRate: number;
  continuousListening: boolean;
}

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  durationMinutes: number;
  category: 'shop_service' | 'meeting' | 'portfolio_review' | 'builder_sprint' | 'general';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  completed: boolean;
  sourceModule?: 'phone_secretary' | 'email_triage' | 'portfolio' | 'builder' | 'manual' | 'voice_command' | 'brainstorm';
  relatedEntityId?: string;
  attendeeOrCustomer?: string;
  location?: string;
}

export interface VoiceCommandLog {
  id: string;
  timestamp: string;
  transcript: string;
  intent: string;
  actionTaken: string;
  success: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  conditions: string;
  actions: string[];
  enabled: boolean;
  executionCount: number;
  lastTriggered?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  isRegistered: boolean;
  registeredAt?: string;
}

export interface AntiGravityConfig {
  geminiApiKey: string;
  enableAntiGravitySync: boolean;
  antiGravityEndpoint: string;
  googleOAuthClientId: string;
  companySmtpHost: string;
  companySmtpPort: string;
  companySmtpUser: string;
  companySmtpPass: string;
  phoneWebhookUrl: string;
  stockApiKey: string;
  cryptoApiKey: string;
  windowsInstallerOptions: {
    installPath: string;
    createDesktopShortcut: boolean;
    startWithWindows: boolean;
    allowMultiUserSwitching: boolean;
  };
}

export interface ConnectedEmailAccount {
  id: string;
  type: 'google' | 'company' | 'imap';
  email: string;
  label: string;
  syncIntervalMinutes: number;
  enabled: boolean;
  apiKeyOrSecret?: string;
}

export type GoldColorPalette =
  | 'pure_amber'
  | 'royal_gold'
  | 'champagne'
  | 'cyber_neon_gold'
  | 'solar_bronze';

export type BackgroundAesthetic =
  | 'pure_abyss_black'
  | 'dark_slate_carbon'
  | 'obsidian_titanium'
  | 'midnight_matrix';

export type FontStyleOption =
  | 'tech_mono'
  | 'cyber_sans'
  | 'executive_modern'
  | 'display_orbit';

export type GlowIntensity = 'subtle' | 'balanced' | 'intense' | 'ultra_luminous';

export type PulseSpeed = 'off' | 'slow_breathing' | 'medium_pulse' | 'rapid_cyber';

export interface ThemeConfig {
  goldPalette: GoldColorPalette;
  backgroundAesthetic: BackgroundAesthetic;
  fontStyle: FontStyleOption;
  glowIntensity: GlowIntensity;
  pulseSpeed: PulseSpeed;
  goldAccentBrightness: number; // 50 to 150
  borderSharpness: 'rounded_full' | 'rounded_2xl' | 'rounded_lg' | 'sharp_squircle';
  enableAmbientScanline: boolean;
  enableHologramGrid: boolean;
}

export interface PersonalProfile {
  fullName: string;
  companyName: string;
  ownerEmail: string;
  companyEmail: string;
  telephoneLineStatus: 'online_ai' | 'forward_to_cell' | 'dnd';
  personalTone: 'direct_and_professional' | 'warm_and_consultative' | 'concise_executive';
  aiBuilderStrictness: 'ultra_strict_no_hallucinations' | 'balanced' | 'exploratory';
  notificationChannel: 'sms' | 'email' | 'push_dashboard';
  voiceConfig: VoiceConfig;
  themeConfig?: ThemeConfig;
  activeUser: UserProfile;
  allUsers: UserProfile[];
  antiGravity: AntiGravityConfig;
  hasCompletedOnboarding: boolean;
  visibleModules?: Partial<Record<NavSection, boolean>>;
  connectedEmails?: ConnectedEmailAccount[];
}
