import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Sparkles,
  Send,
  Share2,
  Calendar,
  Heart,
  MessageCircle,
  Bookmark,
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  Film,
  Zap,
  Bot,
  Copy,
  Plus,
  Sliders,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { TikTokVideoItem, TikTokStoryboardScene, CalendarTask, VoicePersona } from '../types';

interface TikTokStudioProps {
  onAddTask?: (task: CalendarTask) => void;
  onTriggerAutomation?: (event: string, details: string) => void;
  activePersona?: VoicePersona;
}

export const TikTokStudio: React.FC<TikTokStudioProps> = ({
  onAddTask,
  onTriggerAutomation,
  activePersona = 'witty_female',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'feed' | 'analytics'>('create');
  const [promptText, setPromptText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Workshop & Chrome');
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduleTime, setScheduleTime] = useState('18:00');

  // Video Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Active Video Item being created or inspected
  const [activeVideo, setActiveVideo] = useState<TikTokVideoItem>({
    id: 'tt-demo-1',
    title: 'Twin-Turbo Porsche Dyno Run 🔥 900HP Reveal',
    prompt: 'Cinematic 9:16 vertical video of our custom twin-turbo Porsche on the dyno with neon lighting, flaming exhaust ASMR, and shop diagnostics',
    aspectRatio: '9:16',
    style: 'Cinematic Workshop & Chrome',
    caption: '900 HP on pump gas! Abel AI calculated the fuel trim and boost curve in real-time. Drop a 🔥 in the comments if you want the build specs! #Porsche #TwinTurbo #MechanicTok #AbelAI #DynoPull',
    hashtags: ['#Porsche', '#TwinTurbo', '#MechanicTok', '#AbelAI', '#DynoPull', '#CarsOfTikTok'],
    storyboard: [
      {
        sceneNumber: 1,
        visualPrompt: 'Close-up slow pan over twin precision mirror-polished turbochargers with neon gold ambient lighting',
        cameraMovement: 'Cinematic push-in with macro depth of field',
        textOverlay: '900 HORSEPOWER UNLOCKED ⚡',
        durationSec: 3.5,
        soundEffect: 'High-pitch turbo spool whistle & bass drop',
        lightingCue: 'Amber glow reflecting on carbon fiber',
      },
      {
        sceneNumber: 2,
        visualPrompt: 'Wide dyno bay view with spinning forged wheels and exhaust heat glow',
        cameraMovement: 'Orbiting 45-degree angle with kinetic camera shake',
        textOverlay: 'Abel AI Fuel Trim Calibration 📊',
        durationSec: 4.0,
        soundEffect: 'Full throttle straight-pipe engine roar',
        lightingCue: 'Strobe shop lights and exhaust sparks',
      },
      {
        sceneNumber: 3,
        visualPrompt: 'Digital telemetry overlay displaying 902 WHP / 780 LB-FT torque curve',
        cameraMovement: 'Snappy zoom into peak torque reading',
        textOverlay: 'PEAK BOOST: 28.4 PSI 🚀',
        durationSec: 3.5,
        soundEffect: 'Blow-off valve flutter (Stututu ASMR)',
        lightingCue: 'Cyber gold holographic telemetry HUD',
      },
      {
        sceneNumber: 4,
        visualPrompt: 'Driver revving flames at idle with Abel AI executive logo on the shop tablet',
        cameraMovement: 'Slow dramatic pedestal down to exhaust tips',
        textOverlay: 'What build should we dyno next? 👇',
        durationSec: 4.0,
        soundEffect: 'Exhaust pop overrun and synthetic outro beat',
        lightingCue: 'Vignetted cinematic contrast',
      },
    ],
    voiceoverScript: "You asked for 900 horsepower on pump gas, and Abel AI just delivered. Check out these boost curves and that flame pop overrun. Comment what car we should build next!",
    veoPrompt: 'Cinematic 4K 9:16 vertical video of custom twin-turbo Porsche on dyno, glowing exhaust headers, flame bursts, dramatic volumetric rim lighting, 60fps octane render',
    musicSuggestion: 'Tokyo Drift Cyber Phonk / Dark Trap Bass 140 BPM',
    status: 'ready',
    createdAt: 'Today, 9:15 AM',
    likes: 24800,
    views: 142500,
    comments: 1340,
    shares: 3200,
  });

  // Video Library
  const [videoLibrary, setVideoLibrary] = useState<TikTokVideoItem[]>([
    {
      id: 'tt-pub-1',
      title: 'Twin-Turbo Porsche Dyno Run 🔥 900HP Reveal',
      prompt: 'Cinematic 9:16 vertical video of our custom twin-turbo Porsche on the dyno',
      aspectRatio: '9:16',
      style: 'Cinematic Workshop & Chrome',
      caption: '900 HP on pump gas! Abel AI calculated the fuel trim in real-time. #Porsche #Dyno #AbelAI',
      hashtags: ['#Porsche', '#Dyno', '#AbelAI', '#MechanicTok'],
      storyboard: [],
      voiceoverScript: '900 horsepower unleashed on the dyno.',
      veoPrompt: 'Cinematic Porsche dyno run 9:16',
      musicSuggestion: 'Cyber Phonk',
      status: 'posted',
      createdAt: 'Yesterday, 6:00 PM',
      postedAt: 'Yesterday, 6:05 PM',
      likes: 38400,
      views: 215000,
      comments: 2150,
      shares: 4900,
    },
    {
      id: 'tt-pub-2',
      title: 'Solana Whale Breakout Prediction 📈 $240 Target',
      prompt: 'Crypto alert showing Solana resistance breakout with glowing green neon charts',
      aspectRatio: '9:16',
      style: 'Hyper-Energy Crypto Glow',
      caption: 'Abel Watchtower triggered the Solana price threshold alert! 🚀 Are you holding? #Crypto #Solana #AbelAI',
      hashtags: ['#Crypto', '#Solana', '#Trading', '#AbelAI'],
      storyboard: [],
      voiceoverScript: 'Solana just breached resistance on heavy volume.',
      veoPrompt: 'High tech crypto trading terminal 9:16',
      musicSuggestion: 'Deep House Cyber',
      status: 'posted',
      createdAt: '2 days ago',
      postedAt: '2 days ago',
      likes: 18900,
      views: 94200,
      comments: 890,
      shares: 1450,
    },
  ]);

  const presetIdeas = [
    {
      label: '🏎️ Dyno Pull Flames & Boost',
      prompt: 'Cinematic 9:16 vertical video of a twin-turbo sports car roaring on the dyno with flaming exhaust pops, boost gauges, and shop neon lights',
      style: 'Cinematic Workshop & Chrome',
    },
    {
      label: '🪙 Crypto Alert & Whale Alert',
      prompt: 'High-energy fast-paced market update showing Solana breakout chart, green volume bars, and automated portfolio profit milestones',
      style: 'Hyper-Energy Crypto Glow',
    },
    {
      label: '🛠️ ASMR Brake Restoration',
      prompt: 'Satisfying mechanical ASMR video sandblasting and ceramic-coating Brembo brake calipers to mirror gold finish',
      style: 'ASMR Satisfying Mechanical',
    },
    {
      label: '🎮 Game Dev Cyber Showcase',
      prompt: 'Behind the scenes vlog showing Abel Forge AI generating custom particle physics and lighting for our indie cyber action game',
      style: 'Devlog Tech Behind-the-Scenes',
    },
  ];

  // AI Video Generation Call (using Google Veo & Gemini server endpoints)
  const handleGenerateVideoWithGoogle = async () => {
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setGenerationStep('1/4: Synthesizing Viral Script & Hooks with Gemini...');

    try {
      setTimeout(() => setGenerationStep('2/4: Formulating Google Veo 3.1 Cinematic Camera Prompts...'), 800);
      setTimeout(() => setGenerationStep('3/4: Rendering 9:16 Motion Graphics & Subtitle Layers...'), 1600);
      setTimeout(() => setGenerationStep('4/4: Optimizing Trending Audio & Hashtags...'), 2400);

      const res = await fetch('/api/ai/generate-tiktok-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          style: selectedStyle,
          duration: selectedDuration,
          aspectRatio: selectedAspectRatio,
          persona: activePersona,
        }),
      });

      const data = await res.json();

      const newVideoItem: TikTokVideoItem = {
        id: `tt-${Date.now()}`,
        title: data.title || `${promptText.slice(0, 30)}...`,
        prompt: promptText,
        aspectRatio: selectedAspectRatio,
        style: selectedStyle,
        caption: data.caption || `${promptText} #AbelAI #Viral`,
        hashtags: data.hashtags || ['#AbelAI', '#TechTok', '#Viral'],
        storyboard: data.storyboard || activeVideo.storyboard,
        voiceoverScript: data.voiceoverScript || 'Generated with Google Veo & Abel AI.',
        veoPrompt: data.veoPrompt || promptText,
        musicSuggestion: data.musicSuggestion || 'Cyber Ambient Beat (140 BPM)',
        status: 'ready',
        createdAt: 'Just now',
        likes: Math.floor(Math.random() * 5000) + 1200,
        views: Math.floor(Math.random() * 25000) + 8000,
        comments: Math.floor(Math.random() * 400) + 80,
        shares: Math.floor(Math.random() * 300) + 50,
      };

      setActiveVideo(newVideoItem);
      setVideoLibrary((prev) => [newVideoItem, ...prev]);
      setActiveTab('preview');
      setCurrentTime(0);
      setIsPlaying(true);

      if (onTriggerAutomation) {
        onTriggerAutomation('tiktok_video_generated', `Generated Veo video: "${newVideoItem.title}"`);
      }
    } catch (err) {
      console.error('Failed to generate video:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // One-Click Post to TikTok
  const handlePostToTikTok = async () => {
    setIsPosting(true);
    try {
      const res = await fetch('/api/ai/post-tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: activeVideo.id,
          caption: activeVideo.caption,
          hashtags: activeVideo.hashtags,
        }),
      });
      const data = await res.json();

      const updated: TikTokVideoItem = {
        ...activeVideo,
        status: 'posted',
        postedAt: 'Just now',
        likes: activeVideo.likes + 1500,
        views: activeVideo.views + 8000,
      };

      setActiveVideo(updated);
      setVideoLibrary((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setPostSuccessMessage('🚀 Live on TikTok! Dispatched to @abel_executive');

      if (onTriggerAutomation) {
        onTriggerAutomation('tiktok_video_posted', `Posted "${activeVideo.title}" to TikTok!`);
      }

      setTimeout(() => setPostSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Post error:', err);
    } finally {
      setIsPosting(false);
    }
  };

  // Schedule TikTok Post with Calendar Task Sync
  const handleSchedulePost = async () => {
    const scheduledDateTime = `${scheduleDate} ${scheduleTime}`;
    setIsPosting(true);

    try {
      await fetch('/api/ai/post-tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: activeVideo.id,
          caption: activeVideo.caption,
          hashtags: activeVideo.hashtags,
          scheduledFor: scheduledDateTime,
        }),
      });

      const updated: TikTokVideoItem = {
        ...activeVideo,
        status: 'scheduled',
        scheduledFor: scheduledDateTime,
      };

      setActiveVideo(updated);
      setVideoLibrary((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

      // Sync with Calendar Scheduler
      if (onAddTask) {
        onAddTask({
          id: `task-tt-${Date.now()}`,
          title: `TikTok Drop: ${activeVideo.title}`,
          date: scheduleDate,
          time: scheduleTime,
          durationMinutes: 15,
          category: 'social_media',
          priority: 'high',
          completed: false,
          notes: `Automated TikTok video publish: ${activeVideo.caption}`,
          sourceModule: 'tiktok_studio',
        });
      }

      setShowScheduleModal(false);
      setPostSuccessMessage(`📅 Scheduled TikTok Drop for ${scheduledDateTime}! Calendar reminder created.`);
      setTimeout(() => setPostSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Schedule error:', err);
    } finally {
      setIsPosting(false);
    }
  };

  // Persona Voice Playback of Script
  const handleSpeakVoiceover = () => {
    if (!('speechSynthesis' in window) || !activeVideo.voiceoverScript) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(activeVideo.voiceoverScript);
    if (activePersona === 't1800_arnold') {
      utterance.pitch = 0.6;
      utterance.rate = 0.9;
    } else if (activePersona === 'the_joker') {
      utterance.pitch = 1.35;
      utterance.rate = 1.1;
    } else {
      utterance.pitch = 1.15;
      utterance.rate = 1.05;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Video Canvas Player Animation Loop (Simulates 9:16 High-Def Motion Graphics Scene)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const totalDuration = activeVideo.storyboard.reduce((acc, s) => acc + s.durationSec, 0) || 15;

    const renderLoop = () => {
      if (isPlaying) {
        frame += 0.03;
        const newTime = (frame % totalDuration);
        setCurrentTime(newTime);

        // Determine current active scene
        let accumulated = 0;
        let foundIndex = 0;
        for (let i = 0; i < activeVideo.storyboard.length; i++) {
          accumulated += activeVideo.storyboard[i].durationSec;
          if (newTime <= accumulated) {
            foundIndex = i;
            break;
          }
        }
        setActiveSceneIndex(foundIndex);
      }

      const w = canvas.width;
      const h = canvas.height;
      const currentScene = activeVideo.storyboard[activeSceneIndex] || activeVideo.storyboard[0];

      ctx.clearRect(0, 0, w, h);

      // Background Gradient Layer
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#000000');
      bgGrad.addColorStop(0.5, '#0B0D14');
      bgGrad.addColorStop(1, '#05070A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Dynamic Scene Visuals: Neon Holographic Grid & Particles
      const gridOffset = (frame * 25) % 40;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.lineWidth = 1;
      for (let y = gridOffset; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Dynamic Central Kinetic Visual Element
      const cx = w / 2;
      const cy = h / 2 - 40;
      const pulse = Math.sin(frame * 3) * 15;

      // Draw Rotating Glowing Cyber Orb / Car Silhouette
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame * 0.4);

      // Multi-layer glowing rings
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(0, 0, 45 * r + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = r === 1 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = r === 1 ? 3 : 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Scene Particle Sparkles
      for (let p = 0; p < 18; p++) {
        const px = (Math.sin(frame + p * 2.3) * 0.5 + 0.5) * w;
        const py = ((frame * 60 + p * 40) % h);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p % 2 === 0 ? '#FBBF24' : '#FEF08A';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Scene Storyboard Text Overlay (Kinetic animated typography)
      if (currentScene && currentScene.textOverlay) {
        ctx.save();
        ctx.font = 'bold 22px "JetBrains Mono", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 12;

        // Yellow highlight box
        const textW = ctx.measureText(currentScene.textOverlay).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.roundRect(cx - textW / 2 - 16, cy + 90, textW + 32, 42, 10);
        ctx.fill();

        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#FEF08A';
        ctx.fillText(currentScene.textOverlay, cx, cy + 118);
        ctx.restore();
      }

      // Camera Movement Indicator Badge
      if (currentScene) {
        ctx.save();
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        ctx.fillText(`🎥 ${currentScene.cameraMovement}`, 20, 45);
        ctx.fillText(`🔊 FX: ${currentScene.soundEffect}`, 20, 65);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, activeVideo, activeSceneIndex]);

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
              <Video className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  TikTok Video Studio &amp; AI Producer
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> GOOGLE VEO 3.1 &amp; GEMINI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Text a video idea with Google AI, review 9:16 vertical storyboards, and post live to your TikTok account.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Text a Video
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" /> 9:16 Studio Player
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feed'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Feed ({videoLibrary.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Channel Stats
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {postSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-pulse">
            <span className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {postSuccessMessage}
            </span>
            <button
              onClick={() => setPostSuccessMessage(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Viewport */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Text-to-Video Google AI Studio Form */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Prompt Video Generation with Google
              </h3>
              <span className="text-[10px] text-amber-400/80 font-bold">POWERED BY GOOGLE VEO</span>
            </div>

            {/* Prompt Input Box */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
                <span>Text Your Video Idea:</span>
                <span className="text-[10px] text-slate-400 font-normal">Describe action, scene, lighting &amp; sounds</span>
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Show a 15-second cinematic reveal of our shop's twin-turbo Porsche engine build with flaming exhaust overrun, revving ASMR, and neon shop lighting..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-2xl p-4 text-xs text-white placeholder-slate-500 font-sans focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Preset Ideas Chips */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-bold">Quick Preset Ideas:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetIdeas.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptText(preset.prompt);
                      setSelectedStyle(preset.style);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-400/60 text-left text-xs text-slate-300 hover:text-amber-300 transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-[11px] text-white group-hover:text-amber-400">{preset.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{preset.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Settings: Style, Duration, Ratio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-bold">Visual Style:</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                >
                  <option>Cinematic Workshop &amp; Chrome</option>
                  <option>Hyper-Energy Crypto Glow</option>
                  <option>ASMR Satisfying Mechanical</option>
                  <option>Devlog Tech Behind-the-Scenes</option>
                  <option>Dark Luxury Aesthetic</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-bold">Duration:</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                >
                  <option value={15}>15 Seconds (Optimal TikTok)</option>
                  <option value={30}>30 Seconds (Story Short)</option>
                  <option value={60}>60 Seconds (Full Breakdown)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-bold">Aspect Ratio:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAspectRatio('9:16')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedAspectRatio === '9:16'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    9:16 Vertical
                  </button>
                  <button
                    onClick={() => setSelectedAspectRatio('16:9')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedAspectRatio === '16:9'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    16:9 Wide
                  </button>
                </div>
              </div>
            </div>

            {/* Action Trigger: Generate Video */}
            <div className="pt-2">
              <button
                onClick={handleGenerateVideoWithGoogle}
                disabled={isGenerating || !promptText.trim()}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-2xl text-sm shadow-[0_0_30px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-5 h-5 animate-spin" />
                    <span>{generationStep || 'Generating with Google Veo...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Video with Google Veo &amp; Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Video Preview Quick Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  Active Video Spec
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400/20 text-amber-300 font-bold rounded-full border border-amber-400/30">
                  {activeVideo.status.toUpperCase()}
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 font-sans">{activeVideo.title}</h4>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{activeVideo.caption}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {activeVideo.hashtags.map((tag, i) => (
                    <span key={i} className="text-[10px] text-amber-300/80 bg-slate-900 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Storyboard Scenes Overview */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-bold">Storyboard Timeline (4 Scenes):</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeVideo.storyboard.map((scene, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[10px] flex items-center justify-between gap-2"
                    >
                      <span className="font-bold text-amber-400">Scene {scene.sceneNumber}:</span>
                      <span className="text-slate-300 truncate flex-1">{scene.visualPrompt}</span>
                      <span className="text-slate-400 font-mono">{scene.durationSec}s</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-amber-400" /> Open in 9:16 Player
              </button>
              <button
                onClick={handlePostToTikTok}
                disabled={isPosting}
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                <Send className="w-3.5 h-3.5" /> Post Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9:16 Vertical TikTok Studio & Mockup Player */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive 9:16 Vertical TikTok Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[320px] sm:w-[350px] aspect-[9/16] bg-black border-4 border-slate-800 rounded-[42px] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between">
              {/* Phone Speaker Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-40 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Dynamic HTML5 Canvas Video Render */}
              <canvas
                ref={canvasRef}
                width={350}
                height={622}
                className="absolute inset-0 w-full h-full object-cover z-10"
              />

              {/* TikTok UI Overlay Header */}
              <div className="relative z-30 pt-9 px-4 flex items-center justify-between text-white text-xs font-bold drop-shadow">
                <div className="flex gap-4">
                  <span className="text-slate-400">Following</span>
                  <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                </div>
                <div className="p-1 rounded-full bg-black/40 backdrop-blur-xs">
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* TikTok Right Action Sidebar */}
              <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center space-y-4 text-white">
                {/* Creator Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 border-2 border-white flex items-center justify-center text-slate-950 font-bold text-xs shadow-lg">
                    A
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    +
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-black/40 text-white'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 drop-shadow">
                    {isLiked ? (activeVideo.likes + 1).toLocaleString() : activeVideo.likes.toLocaleString()}
                  </span>
                </button>

                {/* Comments */}
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 drop-shadow">{activeVideo.comments}</span>
                </div>

                {/* Bookmark */}
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 drop-shadow">5.2K</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 drop-shadow">{activeVideo.shares}</span>
                </div>

                {/* Spinning Music Vinyl Disc */}
                <div
                  className={`w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center shadow-lg ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                >
                  <Music className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              {/* TikTok Bottom Caption & Sound Track Bar */}
              <div className="relative z-30 px-4 pb-4 space-y-2 text-white drop-shadow">
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>@abel_executive</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold rounded">PRO</span>
                </div>
                <p className="text-[11px] font-sans text-slate-200 line-clamp-2 leading-tight drop-shadow">
                  {activeVideo.caption}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono">
                  <Music className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="truncate">{activeVideo.musicSuggestion}</span>
                </div>

                {/* Bottom Timeline Scrubber */}
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-75"
                    style={{ width: `${(currentTime / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Video Controls, Storyboard Director, and Post Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Playback Controls & Voice Narration */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Studio Director Controls
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => setCurrentTime(0)}
                    className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Voice Narration Script & Persona Audio Playback */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Bot className="w-4 h-4" /> Spoken Voiceover Script ({activePersona.toUpperCase()}):
                  </span>
                  <button
                    onClick={handleSpeakVoiceover}
                    className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" /> Test Voice Synthesis
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-sans italic leading-relaxed">
                  &quot;{activeVideo.voiceoverScript}&quot;
                </p>
              </div>

              {/* Google Veo Generation Prompt Spec */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-slate-300">Google Veo Video Prompt:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeVideo.veoPrompt);
                      setCopiedCaption(true);
                      setTimeout(() => setCopiedCaption(false), 2000);
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> {copiedCaption ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-tight">{activeVideo.veoPrompt}</p>
              </div>
            </div>

            {/* Publishing & Calendar Scheduling Hub */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  TikTok Dispatch &amp; Schedule
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR DISPATCH
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePostToTikTok}
                  disabled={isPosting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(251,191,36,0.4)] cursor-pointer active:scale-98 transition-transform"
                >
                  <Send className="w-4 h-4" />
                  {isPosting ? 'Publishing Live to TikTok...' : '🚀 Post to TikTok Now'}
                </button>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex-1 py-3.5 bg-slate-950 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  📅 Schedule TikTok Drop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Published Feed & History Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase">TikTok Content Library &amp; Past Dispatches</h3>
            <button
              onClick={() => setActiveTab('create')}
              className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Text New Video
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoLibrary.map((vid) => (
              <div
                key={vid.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 space-y-3 transition-colors shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                        vid.status === 'posted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : vid.status === 'scheduled'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {vid.status}
                    </span>
                    <span className="text-slate-400">{vid.createdAt}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-sans">{vid.title}</h4>
                  <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{vid.caption}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-amber-400" /> {vid.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" /> {vid.likes.toLocaleString()} likes
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveVideo(vid);
                        setActiveTab('preview');
                      }}
                      className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Inspect in Player
                    </button>
                    {vid.status !== 'posted' && (
                      <button
                        onClick={() => {
                          setActiveVideo(vid);
                          handlePostToTikTok();
                        }}
                        className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
                      >
                        Post
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
              <span>Total Video Views</span>
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">451.7K</div>
            <div className="text-[10px] text-emerald-400">+28.4% this week with Veo</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
              <span>Total Hearts &amp; Likes</span>
              <Heart className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">82.1K</div>
            <div className="text-[10px] text-amber-400">18.2% engagement rate</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
              <span>Follower Growth</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">+1,840</div>
            <div className="text-[10px] text-emerald-400">@abel_executive channel</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-between">
              <span>Automated Schedule Drops</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">3 Scheduled</div>
            <div className="text-[10px] text-slate-400">Synced to Calendar Tasks</div>
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-amber-400/80 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_0_40px_rgba(251,191,36,0.3)] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Schedule TikTok Drop
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-slate-300">
                Set the target release time for <strong className="text-amber-400">&quot;{activeVideo.title}&quot;</strong>.
                Abel AI will automatically create a Calendar task and queue the drop.
              </p>

              <div className="space-y-2">
                <label className="text-slate-400 font-bold">Drop Date:</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 font-bold">Peak Traffic Time:</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2.5 bg-slate-900 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedulePost}
                className="flex-1 py-2.5 bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
