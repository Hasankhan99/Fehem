import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Quote,
  Flame,
  Brain,
  Compass,
  TrendingUp,
  Shield,
  Volume2,
  Filter,
  CheckCircle2,
  Target,
  Clock,
  Heart,
  Eye,
  Sliders,
  Award,
  Zap,
} from 'lucide-react';
import { ConceptVisualType, QuotePhase } from '../types';

export const AVAILABLE_ANIMATION_TYPES: ConceptVisualType[] = [
  'stimulus-response-gap',
  'system1-system2',
  'habit-loop',
  'compounding-curve',
  'eisenhower-matrix',
  'growth-mindset',
  'dichotomy-of-control',
  'tactical-empathy',
  'deep-work-funnel',
  'eat-that-frog',
  'grit-equation',
  'essentialism-filter',
  'psychology-money',
  'power-of-now',
];

interface ConceptVisualizerProps {
  type?: ConceptVisualType;
  title: string;
  category: string;
  accentColor?: string;
  quote?: string;
  quoteAuthor?: string;
  quotePhases?: QuotePhase[];
  isAutoPlay?: boolean;
  autoPlayProgress?: number;
  hadithReference?: string;
  arabicText?: string;
  narrator?: string;
}

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({
  type,
  title,
  category,
  accentColor = '#10b981',
  quote,
  quoteAuthor,
  quotePhases,
  isAutoPlay = true,
  autoPlayProgress = 0,
  hadithReference,
  arabicText,
  narrator,
}) => {
  const [animStep, setAnimStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullQuote, setShowFullQuote] = useState(false);

  // Cycling animation tick
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 100);
    }, 110);
    return () => clearInterval(timer);
  }, []);

  // Check if a specific animation is genuinely available for this quote
  const hasAnimation = Boolean(
    type && type !== 'none' && AVAILABLE_ANIMATION_TYPES.includes(type)
  );

  // Compute active phase (0, 1, or 2) based on either external autoPlayProgress or local animStep
  const effectiveProgress = isAutoPlay ? autoPlayProgress : animStep;
  const currentPhaseIndex = effectiveProgress < 34 ? 0 : effectiveProgress < 67 ? 1 : 2;

  // Derive active synchronized quote text
  const activeQuotePhase: QuotePhase | null = useMemo(() => {
    if (quotePhases && quotePhases.length >= 3) {
      return quotePhases[currentPhaseIndex] || quotePhases[0];
    }
    return null;
  }, [quotePhases, currentPhaseIndex]);

  // If NO animation is available for this quote, DO NOT repeat an animation or show equalizer bars.
  // Directly render the dedicated, dignified Quote Display!
  if (!hasAnimation) {
    return (
      <div
        id="quote-presentation-card"
        className={`relative w-full rounded-2xl overflow-hidden glass-pill border border-white/20 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-xl h-[210px] sm:h-[240px] md:h-[250px] ${
          isExpanded ? '!h-[300px] sm:!h-[330px]' : ''
        }`}
        style={{
          background:
            category === 'islamic'
              ? 'linear-gradient(145deg, rgba(6, 78, 59, 0.4), rgba(15, 23, 42, 0.9))'
              : 'linear-gradient(145deg, rgba(30, 27, 75, 0.35), rgba(15, 23, 42, 0.9))',
        }}
      >
        {/* Quote Header */}
        <div className="flex items-center justify-between z-10 text-[11px] font-mono mb-1 shrink-0">
          <div className="flex items-center space-x-1.5 text-white/90 truncate max-w-[82%]">
            <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold tracking-wide uppercase text-[10px] text-white/90 truncate">
              {hadithReference ? `Hadith • ${hadithReference}` : title}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded-md glass-pill text-white/60 hover:text-white transition-colors"
            title={isExpanded ? 'Compact View' : 'Expand Visual'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Central Dedicated Quote Stage (No repeated animations) */}
        <div className="relative flex-1 w-full flex flex-col items-center justify-center my-auto px-2 overflow-y-auto no-scrollbar text-center">
          {arabicText && (
            <p
              className="text-base sm:text-lg font-serif text-emerald-300 mb-2 leading-relaxed tracking-wide font-medium"
              dir="rtl"
            >
              {arabicText}
            </p>
          )}

          <p className="text-xs sm:text-[13px] font-medium text-white/95 leading-relaxed italic drop-shadow-sm">
            &quot;{quote}&quot;
          </p>

          {(quoteAuthor || narrator || hadithReference) && (
            <span className="text-[10px] font-mono text-amber-300/90 font-semibold mt-2.5 block">
              — {narrator ? `Narrated by ${narrator}` : quoteAuthor}
              {hadithReference && ` • ${hadithReference}`}
            </span>
          )}
        </div>

        {/* Bottom Phase / Reflection Insight */}
        {activeQuotePhase ? (
          <div className="mt-1 pt-2 border-t border-white/10 z-10 shrink-0 text-left">
            <div className="flex items-center justify-between text-[9px] font-mono text-white/60 mb-0.5">
              <span className="text-amber-300 font-bold flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 inline mr-1 text-amber-400" />
                {activeQuotePhase.stepLabel || `Reflection Phase ${currentPhaseIndex + 1}`}
              </span>
              <div className="flex items-center space-x-1">
                {[0, 1, 2].map((pIdx) => (
                  <span
                    key={pIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      pIdx === currentPhaseIndex ? 'w-3.5 bg-amber-400' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10.5px] font-semibold text-white/95 leading-snug truncate">
              {activeQuotePhase.text}
              {activeQuotePhase.emphasis && (
                <span className="ml-1 text-amber-300 font-bold underline decoration-amber-400/60">
                  {activeQuotePhase.emphasis}
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="text-[9px] font-mono text-white/40 text-center pt-1 border-t border-white/10">
            {category === 'islamic' ? 'Authentic Prophetic Wisdom' : 'Core Book Insight'}
          </div>
        )}
      </div>
    );
  }

  const resolvedType = type!;

  return (
    <div
      id={`concept-visualizer-${resolvedType}`}
      className={`relative w-full rounded-2xl overflow-hidden glass-pill border border-white/20 p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-xl h-[210px] sm:h-[240px] md:h-[250px] ${
        isExpanded ? '!h-[300px] sm:!h-[330px]' : ''
      }`}
    >
      {/* Visual Header */}
      <div className="flex items-center justify-between z-10 text-[11px] font-mono mb-1 shrink-0">
        <div className="flex items-center space-x-1.5 text-white/90">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span className="font-bold tracking-wide uppercase text-[10px] text-white/85">
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Phase dots indicator */}
          <div className="flex items-center space-x-1 mr-1">
            {[0, 1, 2].map((pIdx) => (
              <span
                key={pIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  pIdx === currentPhaseIndex
                    ? 'w-4 bg-white shadow-sm'
                    : 'w-1.5 bg-white/30'
                }`}
                style={pIdx === currentPhaseIndex ? { backgroundColor: accentColor } : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded-md glass-pill text-white/60 hover:text-white transition-colors"
            title={isExpanded ? 'Compact View' : 'Expand Visual'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC ANIMATED PSYCHOLOGY CONCEPT (STAGE) */}
      <div className="relative flex-1 w-full flex items-center justify-center my-0.5 overflow-hidden">
        {/* 1. STIMULUS-RESPONSE GAP (Man's Search for Meaning - Viktor Frankl) */}
        {resolvedType === 'stimulus-response-gap' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="flex items-center justify-between w-full max-w-[280px] px-1">
              {/* Stimulus Pulse */}
              <div
                className={`px-2 py-1 rounded-xl text-center border transition-all duration-300 ${
                  currentPhaseIndex === 0
                    ? 'bg-rose-500/30 border-rose-400 text-rose-200 scale-105 shadow-md shadow-rose-500/20'
                    : 'bg-rose-950/20 border-rose-500/20 text-rose-300/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 mx-auto mb-0.5 text-rose-400" />
                <span className="text-[9px] font-bold block uppercase font-mono">Stimulus</span>
                <span className="text-[7px] text-white/50">Trigger / Event</span>
              </div>

              {/* Connecting Flow Arrow 1 */}
              <div className="flex-1 mx-1.5 flex items-center justify-center">
                <span className="h-[2px] w-full bg-gradient-to-r from-rose-500 to-amber-400" />
              </div>

              {/* Glowing Center: The Space of Freedom */}
              <div
                className={`px-3 py-1.5 rounded-2xl text-center border-2 transition-all duration-300 ${
                  currentPhaseIndex === 1
                    ? 'bg-amber-500/30 border-amber-300 text-white scale-110 shadow-lg shadow-amber-500/30'
                    : 'bg-amber-950/20 border-amber-400/40 text-amber-200'
                }`}
              >
                <Compass className="w-4 h-4 mx-auto mb-0.5 text-amber-300 animate-spin-slow" />
                <span className="text-[10px] font-extrabold uppercase font-mono text-amber-300">
                  The Space
                </span>
                <span className="text-[8px] font-semibold text-white/90 block">Freedom to Choose</span>
              </div>

              {/* Connecting Flow Arrow 2 */}
              <div className="flex-1 mx-1.5 flex items-center justify-center">
                <span className="h-[2px] w-full bg-gradient-to-r from-amber-400 to-emerald-400" />
              </div>

              {/* Response Node */}
              <div
                className={`px-2 py-1 rounded-xl text-center border transition-all duration-300 ${
                  currentPhaseIndex === 2
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 scale-105 shadow-md shadow-emerald-500/20'
                    : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-400" />
                <span className="text-[9px] font-bold block uppercase font-mono">Response</span>
                <span className="text-[7px] text-white/50">Growth & Peace</span>
              </div>
            </div>

            <span className="text-[9px] font-mono text-amber-300/90 font-medium mt-2">
              Between stimulus and response lies our ultimate freedom
            </span>
          </div>
        )}

        {/* 2. SYSTEM 1 vs SYSTEM 2 (Thinking, Fast and Slow - Daniel Kahneman) */}
        {resolvedType === 'system1-system2' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="grid grid-cols-2 gap-3 w-full max-w-[270px]">
              {/* System 1: Fast, Intuitive */}
              <div
                className={`p-2 rounded-xl border text-center transition-all duration-300 ${
                  currentPhaseIndex === 0
                    ? 'bg-amber-500/25 border-amber-400 scale-102 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-900/40 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300 font-mono">SYSTEM 1</span>
                </div>
                <span className="text-[8px] text-white/90 block font-medium">Fast • Automatic • Biased</span>
                <span className="text-[7px] text-amber-200/60 font-mono mt-0.5 block">95% of Daily Choices</span>
              </div>

              {/* System 2: Slow, Deliberate */}
              <div
                className={`p-2 rounded-xl border text-center transition-all duration-300 ${
                  currentPhaseIndex >= 1
                    ? 'bg-cyan-500/25 border-cyan-400 scale-102 shadow-md shadow-cyan-500/20'
                    : 'bg-neutral-900/40 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-300 font-mono">SYSTEM 2</span>
                </div>
                <span className="text-[8px] text-white/90 block font-medium">Slow • Analytical • Lazy</span>
                <span className="text-[7px] text-cyan-200/60 font-mono mt-0.5 block">Requires Conscious Energy</span>
              </div>
            </div>

            <div className="mt-2 flex items-center space-x-2 text-[9px] font-mono text-cyan-300">
              <span className="px-2 py-0.5 rounded-full bg-white/10">Cognitive Switch: Pause & Check</span>
            </div>
          </div>
        )}

        {/* 3. THE 4-STAGE HABIT LOOP (The Power of Habit & Atomic Habits) */}
        {resolvedType === 'habit-loop' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="grid grid-cols-4 gap-1.5 w-full max-w-[280px]">
              {[
                { name: '1. Cue', sub: 'Make Obvious', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/20' },
                { name: '2. Craving', sub: 'Make Attractive', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/20' },
                { name: '3. Routine', sub: 'Make Easy', color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/20' },
                { name: '4. Reward', sub: 'Make Satisfying', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/20' },
              ].map((stage, sIdx) => {
                const isActive = Math.floor((animStep % 100) / 25) === sIdx;
                return (
                  <div
                    key={sIdx}
                    className={`p-1.5 rounded-xl border text-center transition-all duration-300 ${
                      isActive
                        ? `${stage.bg} ${stage.border} scale-105 shadow-md shadow-emerald-500/20`
                        : 'bg-neutral-900/30 border-white/10 opacity-70'
                    }`}
                  >
                    <span className={`text-[9px] font-bold block font-mono ${stage.color}`}>
                      {stage.name}
                    </span>
                    <span className="text-[7px] text-white/70 block whitespace-nowrap mt-0.5">
                      {stage.sub}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-center space-x-1.5 text-[9px] font-mono text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dopamine Spike Peaks at Craving, Not Reward!</span>
            </div>
          </div>
        )}

        {/* 4. 1% COMPOUNDING CURVE (Atomic Habits - James Clear) */}
        {resolvedType === 'compounding-curve' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center">
            <svg viewBox="0 0 280 90" className="w-full h-full max-h-24 overflow-visible">
              <defs>
                <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#34d399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
                </linearGradient>
              </defs>

              <line x1="20" y1="75" x2="260" y2="75" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
              <line x1="20" y1="15" x2="20" y2="75" stroke="rgba(255,255,255,0.15)" />

              {/* Decay (0.99)^365 */}
              <path d="M 20 65 Q 120 72, 260 74" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="180" y="86" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                (0.99)³⁶⁵ = 0.03x
              </text>

              {/* Exponential (1.01)^365 */}
              <path d="M 20 65 Q 130 63, 200 38 T 260 12" fill="none" stroke="url(#curveGrad)" strokeWidth="3" strokeLinecap="round" />

              {/* Moving Milestone Dot */}
              {(() => {
                const t = (animStep % 50) / 50;
                const cx = 20 + t * 240;
                const cy = 65 - Math.pow(t, 2.5) * 53;
                return (
                  <g transform={`translate(${cx}, ${cy})`}>
                    <circle r="4.5" fill="#f43f5e" className="animate-pulse" />
                    <circle r="8" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" />
                  </g>
                );
              })()}
            </svg>

            <div className="flex items-center space-x-2 text-[10px] font-mono mt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                1% Better Daily = 37.78x
              </span>
              <span className="text-white/50 text-[9px]">Habits Compound Like Interest</span>
            </div>
          </div>
        )}

        {/* 5. EISENHOWER 4-QUADRANT MATRIX (The 7 Habits - Stephen Covey) */}
        {resolvedType === 'eisenhower-matrix' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="grid grid-cols-2 gap-1.5 w-full max-w-[260px] text-[8px] font-mono">
              <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
                <span className="font-bold block text-[9px]">Q1: Urgent & Important</span>
                <span className="text-white/50 text-[7px]">Crises • Deadlines</span>
              </div>
              <div
                className={`p-1.5 rounded-lg border text-emerald-300 transition-all duration-300 ${
                  currentPhaseIndex >= 1
                    ? 'bg-emerald-500/30 border-emerald-400 scale-105 shadow-md shadow-emerald-500/30 font-bold'
                    : 'bg-emerald-950/40 border-emerald-500/40'
                }`}
              >
                <span className="font-bold block text-[9px] text-emerald-300">★ Q2: Important, Not Urgent</span>
                <span className="text-emerald-200 text-[7px]">Deep Strategy • Health • Learning</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
                <span className="font-bold block text-[9px]">Q3: Urgent, Not Important</span>
                <span className="text-white/50 text-[7px]">Interruptions • Meetings</span>
              </div>
              <div className="p-1.5 rounded-lg bg-neutral-900/60 border border-white/10 text-neutral-400">
                <span className="font-bold block text-[9px]">Q4: Neither</span>
                <span className="text-white/40 text-[7px]">Mindless Scrolling</span>
              </div>
            </div>

            <span className="text-[9px] font-mono text-emerald-300 font-semibold mt-1">
              Live in Quadrant II: Prevention Over Firefighting
            </span>
          </div>
        )}

        {/* 6. GROWTH MINDSET & THE POWER OF YET (Carol S. Dweck) */}
        {resolvedType === 'growth-mindset' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="flex items-center justify-center space-x-2.5 w-full max-w-[270px]">
              <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center flex-1">
                <span className="text-[9px] font-bold text-rose-300 font-mono block">Fixed Mindset</span>
                <span className="text-[8px] text-white/70 block mt-0.5">&quot;I cannot do this.&quot;</span>
                <span className="text-[7px] text-rose-400/80 font-mono mt-0.5 block">Plateau / Avoid Risk</span>
              </div>

              <span className="text-sm font-bold text-amber-400 animate-pulse">➔</span>

              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-950/40 to-cyan-950/40 border border-emerald-400/50 text-center flex-1 shadow-md shadow-emerald-500/15">
                <span className="text-[9px] font-bold text-emerald-300 font-mono block">Growth Mindset</span>
                <span className="text-[8px] text-white font-bold block mt-0.5">&quot;I cannot do this YET.&quot;</span>
                <span className="text-[7px] text-cyan-300 font-mono mt-0.5 block">Effort Rewires Brain</span>
              </div>
            </div>

            <span className="text-[9px] font-mono text-amber-300 font-medium mt-2">
              The Power of &apos;Yet&apos;: Failure is information, not identity
            </span>
          </div>
        )}

        {/* 7. DICHOTOMY OF CONTROL (The Daily Stoic - Ryan Holiday / Epictetus) */}
        {resolvedType === 'dichotomy-of-control' && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer circle: What I cannot control */}
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20 bg-neutral-900/30 flex items-start justify-center pt-1.5">
                <span className="text-[7px] text-white/40 font-mono uppercase tracking-wider">
                  Out of Control: Weather • Others • Past
                </span>
              </div>

              {/* Inner glowing circle: What I CAN control */}
              <div
                className={`relative w-20 h-20 rounded-full border-2 transition-all duration-300 flex flex-col items-center justify-center text-center p-1 ${
                  currentPhaseIndex >= 1
                    ? 'border-emerald-400 bg-emerald-500/25 shadow-lg shadow-emerald-500/30 scale-105'
                    : 'border-emerald-500/40 bg-emerald-950/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-300 mb-0.5" />
                <span className="text-[8px] font-bold text-white uppercase font-mono">In My Control</span>
                <span className="text-[7px] text-emerald-200 font-mono">Actions • Beliefs</span>
              </div>
            </div>
          </div>
        )}

        {/* 8. TACTICAL EMPATHY & MIRRORING (Never Split the Difference - Chris Voss) */}
        {resolvedType === 'tactical-empathy' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="flex items-center space-x-2 w-full max-w-[270px]">
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center flex-1">
                <Volume2 className="w-3.5 h-3.5 text-purple-400 mx-auto mb-0.5" />
                <span className="text-[9px] font-bold text-purple-300 font-mono block">Mirroring</span>
                <span className="text-[7px] text-white/70 block mt-0.5">Repeat Last 3 Words</span>
              </div>

              <span className="text-xs font-bold text-cyan-400 font-mono">➔</span>

              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center flex-1">
                <Heart className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                <span className="text-[9px] font-bold text-cyan-300 font-mono block">Labeling</span>
                <span className="text-[7px] text-white/70 block mt-0.5">&quot;It seems like you feel...&quot;</span>
              </div>
            </div>

            <span className="text-[9px] font-mono text-cyan-300 font-semibold mt-2">
              Goal: Trigger &quot;That&apos;s Right&quot; (Never push for &quot;Yes&quot;)
            </span>
          </div>
        )}

        {/* 9. DEEP WORK FOCUS FUNNEL (Cal Newport) */}
        {resolvedType === 'deep-work-funnel' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[270px] flex items-center justify-between px-1">
              <div className="space-y-1 text-[7px] font-mono text-rose-400/80">
                <div className="px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 -rotate-3">
                  ✕ Slack Ding
                </div>
                <div className="px-1 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 rotate-2">
                  ✕ Quick Email
                </div>
              </div>

              <div className="w-16 h-16 rounded-full border-2 border-purple-400/70 bg-purple-600/25 shadow-lg shadow-purple-500/30 flex flex-col items-center justify-center text-center p-1">
                <Flame className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span className="text-[7px] font-bold text-white uppercase font-mono">Deep Focus</span>
                <span className="text-[6px] text-purple-200 font-mono">Zero Residue</span>
              </div>

              <div className="space-y-1 text-[7px] font-mono text-emerald-300">
                <div className="px-1 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                  ✓ High-Leverage
                </div>
                <div className="px-1 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                  ✓ Flow State
                </div>
              </div>
            </div>

            <span className="text-[9px] font-mono text-purple-300 font-bold mt-1">
              High-Value Output = Time × Intensity of Focus
            </span>
          </div>
        )}

        {/* 10. EAT THAT FROG (Brian Tracy) */}
        {resolvedType === 'eat-that-frog' && (
          <div className="w-full h-full flex flex-col items-center justify-center py-1">
            <div className="flex items-center space-x-2 w-full max-w-[270px]">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-400/40 text-center flex-1 shadow-md">
                <span className="text-base block mb-0.5">🐸</span>
                <span className="text-[9px] font-bold text-emerald-300 font-mono block">The Big Frog</span>
                <span className="text-[7px] text-white/70 block">Tackle 1st thing in morning</span>
              </div>
              <span className="text-xs font-bold text-white/50">➔</span>
              <div className="p-2 rounded-xl bg-neutral-900/40 border border-white/10 text-center flex-1 opacity-70">
                <span className="text-xs block mb-0.5">📋</span>
                <span className="text-[9px] font-bold text-neutral-300 font-mono block">Trivial Tasks</span>
                <span className="text-[7px] text-white/50 block">Afternoon low-energy slots</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-300 font-medium mt-1">
              If you have to eat a live frog, do not look at it for long
            </span>
          </div>
        )}

        {/* 11. GRIT EQUATION (Angela Duckworth) */}
        {resolvedType === 'grit-equation' && (
          <div className="w-full h-full flex flex-col items-center justify-center py-1 text-[8px] font-mono">
            <div className="space-y-1.5 w-full max-w-[270px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-900/50 border border-white/10">
                <span className="text-white/70">Talent × <strong className="text-amber-300">Effort</strong></span>
                <span className="text-emerald-400 font-bold">= Skill</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-white/70">Skill × <strong className="text-amber-300 underline decoration-2">Effort</strong></span>
                <span className="text-emerald-300 font-bold">= Achievement</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-amber-300 font-bold mt-1.5">
              Effort Counts Twice! Passion + Long-Term Perseverance
            </span>
          </div>
        )}

        {/* 12. ESSENTIALISM FILTER (Greg McKeown) */}
        {resolvedType === 'essentialism-filter' && (
          <div className="w-full h-full flex flex-col items-center justify-center py-1">
            <div className="flex items-center space-x-2 w-full max-w-[270px]">
              <div className="p-2 rounded-xl bg-neutral-900/40 border border-white/10 text-center flex-1">
                <span className="text-[9px] font-bold text-rose-400 font-mono block">Non-Essentialist</span>
                <span className="text-[7px] text-white/60 block mt-0.5">A millimeter in 1M directions</span>
              </div>
              <span className="text-xs font-bold text-amber-400 font-mono">➔</span>
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-400/40 text-center flex-1 shadow-md">
                <span className="text-[9px] font-bold text-amber-300 font-mono block">Essentialist</span>
                <span className="text-[7px] text-white/90 block mt-0.5">Momentum on Vital Few</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-amber-300 font-bold mt-1">
              The 90% Rule: If it is not a clear YES, it is a clear NO
            </span>
          </div>
        )}

        {/* 13. PSYCHOLOGY OF MONEY (Morgan Housel) */}
        {resolvedType === 'psychology-money' && (
          <div className="w-full h-full flex flex-col items-center justify-center py-1">
            <div className="flex items-center space-x-2 w-full max-w-[270px] text-[8px] font-mono">
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center flex-1">
                <span className="font-bold text-cyan-300 block text-[9px]">Getting Wealthy</span>
                <span className="text-white/60 text-[7px]">Risk • Optimism • Offense</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex-1 shadow-md">
                <span className="font-bold text-emerald-300 block text-[9px]">Staying Wealthy</span>
                <span className="text-white/80 text-[7px]">Frugality • Room for Error</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-300 font-medium mt-1">
              Survival &gt; Maximization: Plan for your plan not going to plan
            </span>
          </div>
        )}

        {/* 14. THE POWER OF NOW (Eckhart Tolle) */}
        {resolvedType === 'power-of-now' && (
          <div className="relative w-full h-full flex flex-col justify-center items-center py-1">
            <div className="flex items-center justify-center space-x-3 w-full max-w-[270px]">
              <span className="text-[8px] font-mono text-white/40 line-through">Past Regret</span>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 shadow-lg shadow-amber-500/40 flex flex-col items-center justify-center text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">NOW</span>
              </div>
              <span className="text-[8px] font-mono text-white/40 line-through">Future Anxiety</span>
            </div>
            <span className="text-[9px] font-mono text-amber-300 font-medium mt-2">
              Life is only ever unfolding in this exact moment
            </span>
          </div>
        )}
      </div>

      {/* SYNCHRONIZED QUOTE & INSIGHT DOCK (Seamlessly Aligned with Animation) */}
      <div className="mt-1 pt-1.5 border-t border-white/10 z-10 shrink-0">
        {activeQuotePhase ? (
          <div className="flex flex-col text-left">
            <div className="flex items-center justify-between text-[9px] font-mono text-white/60 mb-0.5">
              <span className="text-amber-300 font-bold flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 inline mr-1 text-amber-400" />
                {activeQuotePhase.stepLabel || `Phase ${currentPhaseIndex + 1}`}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullQuote(!showFullQuote);
                }}
                className="hover:text-white transition-colors flex items-center space-x-0.5 text-[8px]"
              >
                <span>{showFullQuote ? 'Hide Full' : 'Full Quote'}</span>
              </button>
            </div>

            {showFullQuote ? (
              <p className="text-[10px] text-white/95 italic leading-relaxed bg-black/40 p-1.5 rounded-lg border border-white/10 max-h-16 overflow-y-auto">
                &quot;{quote}&quot;
                {quoteAuthor && <span className="block not-italic text-[8px] text-white/50 mt-0.5">— {quoteAuthor}</span>}
              </p>
            ) : (
              <div className="flex items-start space-x-1.5">
                <Quote className="w-3 h-3 text-white/40 shrink-0 mt-0.5" />
                <p className="text-[10.5px] font-semibold text-white/95 leading-snug truncate">
                  &quot;{activeQuotePhase.text}&quot;
                  {activeQuotePhase.emphasis && (
                    <span className="ml-1 text-amber-300 font-bold underline decoration-amber-400/60">
                      {activeQuotePhase.emphasis}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        ) : quote ? (
          <div className="flex items-start space-x-1 text-left">
            <Quote className="w-3 h-3 text-white/40 shrink-0 mt-0.5" />
            <p className="text-[10.5px] font-medium text-white/95 leading-snug line-clamp-2 italic">
              &quot;{quote}&quot;
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
