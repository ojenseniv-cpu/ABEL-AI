import React from 'react';
import {
  Palette,
  Sparkles,
  Zap,
  Sliders,
  Type,
  Layers,
  Activity,
  Maximize2,
  Check,
  RotateCcw,
  Eye,
  Sun,
  Shield,
  Clock,
  Flame,
  Grid,
  Radio,
} from 'lucide-react';
import {
  ThemeConfig,
  GoldColorPalette,
  BackgroundAesthetic,
  FontStyleOption,
  GlowIntensity,
  PulseSpeed,
} from '../types';
import { defaultThemeConfig } from '../data/mockData';

interface ThemeEditorProps {
  themeConfig: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ themeConfig, onChange }) => {
  const currentTheme = themeConfig || defaultThemeConfig;

  const update = (partial: Partial<ThemeConfig>) => {
    onChange({
      ...currentTheme,
      ...partial,
    });
  };

  const presets: {
    id: string;
    name: string;
    desc: string;
    config: ThemeConfig;
    accentColor: string;
  }[] = [
    {
      id: 'royal_gold',
      name: '👑 24K Royal Gold',
      desc: 'Deep obsidian titanium canvas paired with luminous 24-karat gold accents.',
      accentColor: 'from-amber-300 via-yellow-400 to-amber-600',
      config: {
        goldPalette: 'royal_gold',
        backgroundAesthetic: 'obsidian_titanium',
        fontStyle: 'executive_modern',
        glowIntensity: 'intense',
        pulseSpeed: 'medium_pulse',
        goldAccentBrightness: 110,
        borderSharpness: 'rounded_2xl',
        enableAmbientScanline: false,
        enableHologramGrid: true,
      },
    },
    {
      id: 'cyber_matrix',
      name: '⚡ Cyber Matrix Neon',
      desc: 'High-voltage electric gold on pure abyss black with rapid pulse dynamics.',
      accentColor: 'from-yellow-200 via-yellow-400 to-amber-400',
      config: {
        goldPalette: 'cyber_neon_gold',
        backgroundAesthetic: 'pure_abyss_black',
        fontStyle: 'tech_mono',
        glowIntensity: 'ultra_luminous',
        pulseSpeed: 'rapid_cyber',
        goldAccentBrightness: 135,
        borderSharpness: 'sharp_squircle',
        enableAmbientScanline: true,
        enableHologramGrid: true,
      },
    },
    {
      id: 'champagne_stealth',
      name: '🥂 Champagne Luxury',
      desc: 'Subtle platinum champagne gold over dark slate carbon with serene breathing rhythm.',
      accentColor: 'from-amber-200 via-yellow-200 to-amber-400',
      config: {
        goldPalette: 'champagne',
        backgroundAesthetic: 'dark_slate_carbon',
        fontStyle: 'cyber_sans',
        glowIntensity: 'subtle',
        pulseSpeed: 'slow_breathing',
        goldAccentBrightness: 95,
        borderSharpness: 'rounded_full',
        enableAmbientScanline: false,
        enableHologramGrid: false,
      },
    },
    {
      id: 'solar_bronze',
      name: '☀️ Solar Sentinel Bronze',
      desc: 'Heavy industrial bronze-gold on midnight matrix with balanced tactical clarity.',
      accentColor: 'from-amber-500 via-yellow-600 to-amber-700',
      config: {
        goldPalette: 'solar_bronze',
        backgroundAesthetic: 'midnight_matrix',
        fontStyle: 'tech_mono',
        glowIntensity: 'balanced',
        pulseSpeed: 'medium_pulse',
        goldAccentBrightness: 105,
        borderSharpness: 'rounded_lg',
        enableAmbientScanline: false,
        enableHologramGrid: true,
      },
    },
    {
      id: 'abel_classic',
      name: '🔶 Abel Classic Amber',
      desc: 'The original Abel AI high-contrast amber gold on dark slate matrix.',
      accentColor: 'from-amber-400 to-yellow-500',
      config: {
        goldPalette: 'pure_amber',
        backgroundAesthetic: 'pure_abyss_black',
        fontStyle: 'tech_mono',
        glowIntensity: 'balanced',
        pulseSpeed: 'medium_pulse',
        goldAccentBrightness: 100,
        borderSharpness: 'rounded_2xl',
        enableAmbientScanline: false,
        enableHologramGrid: true,
      },
    },
  ];

  const goldPalettes: {
    id: GoldColorPalette;
    label: string;
    previewHex: string;
    desc: string;
  }[] = [
    { id: 'royal_gold', label: 'Royal 24K Gold', previewHex: '#F59E0B', desc: 'Warm, rich metallic gold with high prestige.' },
    { id: 'cyber_neon_gold', label: 'Cyber Neon Gold', previewHex: '#FDE047', desc: 'Vibrant, high-voltage electric yellow-gold.' },
    { id: 'champagne', label: 'Champagne Gold', previewHex: '#FCD34D', desc: 'Pale luxury champagne tone with soft shimmer.' },
    { id: 'pure_amber', label: 'Pure Amber', previewHex: '#FBBC04', desc: 'The signature Abel AI high-visibility gold.' },
    { id: 'solar_bronze', label: 'Solar Bronze', previewHex: '#D97706', desc: 'Deep warm burnished metallic bronze-gold.' },
  ];

  const backgroundOptions: {
    id: BackgroundAesthetic;
    label: string;
    bgClass: string;
    desc: string;
  }[] = [
    { id: 'pure_abyss_black', label: 'Pure Abyss Black', bgClass: 'bg-black', desc: '#000000 True Pitch Black (Maximum OLED contrast)' },
    { id: 'obsidian_titanium', label: 'Obsidian Titanium', bgClass: 'bg-[#0B0D14]', desc: '#0B0D14 High-Tech Deep Dark Titanium' },
    { id: 'dark_slate_carbon', label: 'Dark Slate Carbon', bgClass: 'bg-slate-950', desc: '#020617 Refined Executive Slate Carbon' },
    { id: 'midnight_matrix', label: 'Midnight Matrix', bgClass: 'bg-[#030712]', desc: '#030712 Cybernetic Deep Midnight Navy' },
  ];

  const fontOptions: {
    id: FontStyleOption;
    label: string;
    fontClass: string;
    sample: string;
    desc: string;
  }[] = [
    { id: 'tech_mono', label: 'Tech Monospace', fontClass: 'font-tech-mono', sample: '0101 ABEL_AI_OS > EXEC', desc: 'Tactical command-line & terminal monospace' },
    { id: 'cyber_sans', label: 'Cyber Sans-Serif', fontClass: 'font-cyber-sans', sample: 'Abel Autonomous Intelligence', desc: 'Crisp, ultra-clean modern sans geometry' },
    { id: 'executive_modern', label: 'Executive Modern', fontClass: 'font-executive-modern', sample: 'Executive Systems & Dispatch', desc: 'High-end corporate luxury typography' },
    { id: 'display_orbit', label: 'Display Orbit', fontClass: 'font-display-orbit', sample: 'QUANTUM WATCHTOWER v5.0', desc: 'Futuristic wide-aperture display font' },
  ];

  const pulseSpeeds: {
    id: PulseSpeed;
    label: string;
    desc: string;
    speedClass: string;
  }[] = [
    { id: 'off', label: 'Solid / Off', desc: 'Static indicators with zero animation', speedClass: '' },
    { id: 'slow_breathing', label: 'Slow Breathing (4.0s)', desc: 'Serene, rhythmic relaxation loop', speedClass: 'duration-1000' },
    { id: 'medium_pulse', label: 'Medium Pulse (2.0s)', desc: 'Standard executive system heartbeat', speedClass: 'duration-500' },
    { id: 'rapid_cyber', label: 'Rapid Cyber (0.8s)', desc: 'High-frequency telemetry scan', speedClass: 'duration-200' },
  ];

  const glowLevels: {
    id: GlowIntensity;
    label: string;
    desc: string;
    glowClass: string;
  }[] = [
    { id: 'subtle', label: 'Subtle (30%)', desc: 'Minimal clean edge definition', glowClass: 'shadow-[0_0_8px_rgba(251,191,36,0.2)]' },
    { id: 'balanced', label: 'Balanced (60%)', desc: 'Standard golden rim lighting', glowClass: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]' },
    { id: 'intense', label: 'Intense (90%)', desc: 'Rich glowing atmospheric halo', glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.65)]' },
    { id: 'ultra_luminous', label: 'Ultra Luminous (120%)', desc: 'Cyberpunk neon light emission', glowClass: 'shadow-[0_0_35px_rgba(251,191,36,0.9)]' },
  ];

  const borderRadii: {
    id: 'rounded_full' | 'rounded_2xl' | 'rounded_lg' | 'sharp_squircle';
    label: string;
    desc: string;
  }[] = [
    { id: 'rounded_full', label: 'Curved Pill (24px)', desc: 'Organic, ultra-smooth corners' },
    { id: 'rounded_2xl', label: 'Modern Rounded (16px)', desc: 'Standard luxury iOS/macOS curvature' },
    { id: 'rounded_lg', label: 'Compact Rounded (10px)', desc: 'Dense, clean executive radius' },
    { id: 'sharp_squircle', label: 'Sharp Squircle (4px)', desc: 'Tactical cyber military precision' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Top Header & 1-Click Aesthetic Presets */}
      <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              Black &amp; Gold Aesthetic Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fine-tune the visual DNA of Abel AI: choose gold shades, OLED pitch blacks, pulse speeds, typography, and glow intensity.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(defaultThemeConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 rounded-xl text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
        </div>

        {/* 1-Click Presets Grid */}
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            1-Click Curated Luxury Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {presets.map((preset) => {
              const isMatch =
                currentTheme.goldPalette === preset.config.goldPalette &&
                currentTheme.backgroundAesthetic === preset.config.backgroundAesthetic;
              return (
                <div
                  key={preset.id}
                  onClick={() => onChange(preset.config)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                    isMatch
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400/60 hover:text-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{preset.name}</span>
                      {isMatch && <Check className="w-4 h-4 text-slate-950" />}
                    </div>
                    <div className={`text-[10px] leading-relaxed ${isMatch ? 'text-slate-900' : 'text-slate-400'}`}>
                      {preset.desc}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className={`h-2.5 flex-1 rounded-full bg-gradient-to-r ${preset.accentColor}`} />
                    <span className="w-2.5 h-2.5 rounded-full bg-black border border-amber-400/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Interactive Live Preview Sandbox */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Aesthetic Preview Sandbox
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-lg">
            INSTANT REAL-TIME RENDERING
          </span>
        </div>

        {/* Live Simulation Card */}
        <div
          className={`p-6 rounded-2xl border border-amber-500/40 space-y-4 relative overflow-hidden transition-all ${
            currentTheme.backgroundAesthetic === 'pure_abyss_black'
              ? 'bg-black'
              : currentTheme.backgroundAesthetic === 'obsidian_titanium'
              ? 'bg-[#0B0D14]'
              : currentTheme.backgroundAesthetic === 'midnight_matrix'
              ? 'bg-[#030712]'
              : 'bg-slate-950'
          } ${currentTheme.enableHologramGrid ? 'hologram-grid-bg' : ''}`}
        >
          {currentTheme.enableAmbientScanline && <div className="absolute inset-0 scanline-overlay" />}

          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-bold ${
                  currentTheme.pulseSpeed !== 'off' ? 'theme-pulse' : ''
                }`}
                style={{
                  boxShadow:
                    currentTheme.glowIntensity === 'ultra_luminous'
                      ? '0 0 25px #fbbf24'
                      : currentTheme.glowIntensity === 'intense'
                      ? '0 0 16px #fbbf24'
                      : currentTheme.glowIntensity === 'balanced'
                      ? '0 0 10px rgba(251,191,36,0.5)'
                      : 'none',
                }}
              >
                <Zap className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div
                  className={`text-sm font-bold text-white tracking-wide ${
                    currentTheme.fontStyle === 'tech_mono'
                      ? 'font-tech-mono'
                      : currentTheme.fontStyle === 'cyber_sans'
                      ? 'font-cyber-sans'
                      : currentTheme.fontStyle === 'executive_modern'
                      ? 'font-executive-modern'
                      : 'font-display-orbit'
                  }`}
                >
                  Abel AI Autonomous Command
                </div>
                <div className="text-[11px] text-amber-400/90 flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Telemetry: Active • Palette: {currentTheme.goldPalette.toUpperCase()} • Glow: {currentTheme.glowIntensity.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md">
                VOICE ONLINE
              </span>
              <span className="text-[10px] px-2.5 py-1 bg-slate-900 border border-amber-400/40 text-amber-300 font-bold rounded-xl">
                HOTKEY [Ctrl + Space]
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 text-xs">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Executive Gold Luminance</div>
              <div className="text-sm font-bold text-amber-300">{currentTheme.goldAccentBrightness}% Brightness</div>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Active Pulse Duration</div>
              <div className="text-sm font-bold text-amber-300">{currentTheme.pulseSpeed.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Typography Engine</div>
              <div className="text-sm font-bold text-amber-300">{currentTheme.fontStyle.replace('_', ' ').toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Left Column: Gold Palette & Background Blacks */}
        <div className="space-y-6">
          {/* Gold Tone Selector */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Gold Color Palette Tone
            </label>
            <div className="space-y-2">
              {goldPalettes.map((palette) => {
                const isSelected = currentTheme.goldPalette === palette.id;
                return (
                  <div
                    key={palette.id}
                    onClick={() => update({ goldPalette: palette.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border border-black/40 shadow-sm shrink-0"
                        style={{ backgroundColor: palette.previewHex }}
                      />
                      <div>
                        <div className="text-xs font-bold">{palette.label}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                          {palette.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background Black Atmosphere */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Black &amp; Dark Base Atmosphere
            </label>
            <div className="space-y-2">
              {backgroundOptions.map((bg) => {
                const isSelected = currentTheme.backgroundAesthetic === bg.id;
                return (
                  <div
                    key={bg.id}
                    onClick={() => update({ backgroundAesthetic: bg.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full border border-amber-400/50 shrink-0 ${bg.bgClass}`} />
                      <div>
                        <div className="text-xs font-bold">{bg.label}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                          {bg.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gold Intensity & Brightness Slider */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Gold Accent Intensity &amp; Brightness
              </label>
              <span className="text-amber-400 font-bold font-mono">{currentTheme.goldAccentBrightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={currentTheme.goldAccentBrightness}
              onChange={(e) => update({ goldAccentBrightness: parseInt(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50% (Muted Matte)</span>
              <span>100% (Balanced)</span>
              <span>150% (High Dynamic Range)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Pulse Speed, Typography, Glow & Visual FX */}
        <div className="space-y-6">
          {/* Typography Engine */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Application Typography &amp; Font Style
            </label>
            <div className="space-y-2">
              {fontOptions.map((font) => {
                const isSelected = currentTheme.fontStyle === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => update({ fontStyle: font.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className={`text-xs ${font.fontClass}`}>{font.label} • {font.sample}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {font.desc}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pulse Animation Speed */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Pulse Animation Speed &amp; Dynamics
            </label>
            <div className="grid grid-cols-2 gap-2">
              {pulseSpeeds.map((pulse) => {
                const isSelected = currentTheme.pulseSpeed === pulse.id;
                return (
                  <div
                    key={pulse.id}
                    onClick={() => update({ pulseSpeed: pulse.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{pulse.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                      {pulse.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glow & Halo Intensity */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Glow, Halo &amp; Bloom Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {glowLevels.map((glow) => {
                const isSelected = currentTheme.glowIntensity === glow.id;
                return (
                  <div
                    key={glow.id}
                    onClick={() => update({ glowIntensity: glow.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{glow.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                      {glow.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hologram Grid & Scanline Ambience Toggles */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Cybernetic Background Textures
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => update({ enableHologramGrid: !currentTheme.enableHologramGrid })}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentTheme.enableHologramGrid
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <div className="text-xs">Hologram Grid</div>
                  <div className="text-[10px] text-slate-400">Subtle 32px gold matrix</div>
                </div>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentTheme.enableHologramGrid ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {currentTheme.enableHologramGrid ? '✓' : ''}
                </div>
              </div>

              <div
                onClick={() => update({ enableAmbientScanline: !currentTheme.enableAmbientScanline })}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentTheme.enableAmbientScanline
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <div className="text-xs">Cyber Scanlines</div>
                  <div className="text-[10px] text-slate-400">Tactical CRT line texture</div>
                </div>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentTheme.enableAmbientScanline ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {currentTheme.enableAmbientScanline ? '✓' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
