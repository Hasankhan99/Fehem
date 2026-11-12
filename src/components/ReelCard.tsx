import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Code2,
  Layers,
  Flame,
  CheckCircle2,
  X,
  Music,
  Check,
  Zap,
  HelpCircle,
  Brain,
  Disc3,
  Play,
  Pause,
  ChevronDown,
  Film,
  Quote,
  Shuffle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroReel } from '../types';
import { CodeViewer } from './CodeViewer';
import { ConceptVisualizer, AVAILABLE_ANIMATION_TYPES } from './ConceptVisualizer';

interface ReelCardProps {
  reel: MicroReel;
  index: number;
  totalReels: number;
  isLiked: boolean;
  isBookmarked: boolean;
  completedActionKeys: string[];
  quizState?: { selectedIndex: number; isCorrect: boolean };
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onToggleActionItem: (key: string) => void;
  onAnswerQuiz: (reelId: string, selectedIndex: number, isCorrect: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  // Vocal / Focus background music
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onShuffleMusic?: () => void;
  onOpenMusicSelector?: () => void;
  musicTrackName: string;
  // Speech narration
  isSpeechPlaying: boolean;
  speechRate: number;
  onToggleSpeech: (text: string) => void;
  onChangeSpeechRate: () => void;
  // Auto-play progress
  isAutoPlay: boolean;
  autoPlayProgress: number;
  // Share modal trigger
  onOpenShareModal: (reel: MicroReel) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  index,
  totalReels,
  isLiked,
  isBookmarked,
  completedActionKeys,
  quizState,
  onToggleLike,
  onToggleBookmark,
  onToggleActionItem,
  onAnswerQuiz,
  onNext,
  onPrev,
  isMusicPlaying,
  onToggleMusic,
  onShuffleMusic,
  onOpenMusicSelector,
  musicTrackName,
  isSpeechPlaying,
  speechRate,
  onToggleSpeech,
  onChangeSpeechRate,
  isAutoPlay,
  autoPlayProgress,
  onOpenShareModal,
}) => {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'quote'>('visual');
  const lastTapRef = useRef<number>(0);

  // Check if reel has a genuinely available animation type
  const hasAnimation = Boolean(
    reel.visualConceptType &&
    reel.visualConceptType !== 'none' &&
    AVAILABLE_ANIMATION_TYPES.includes(reel.visualConceptType)
  );

  // Reset view & deep dive when reel changes
  useEffect(() => {
    setShowDeepDive(false);
    setViewMode('visual');
  }, [reel.id]);

  // Double tap to like (Instagram style)
  const handleCardTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        onToggleLike(reel.id);
      }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleQuizSelection = (optionIndex: number) => {
    if (quizState !== undefined) return;
    const isCorrect = optionIndex === reel.quiz.correctIndex;
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#ec4899'],
      });
    }
    onAnswerQuiz(reel.id, optionIndex, isCorrect);
  };

  // Category styling
  const categoryConfig = {
    islamic: {
      label: 'Islamic Wisdom',
      icon: BookOpen,
      gradient: 'from-emerald-950/70 via-teal-950/40 to-neutral-950',
      avatarBorder: 'from-emerald-400 via-teal-400 to-amber-300',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      authorHandle: 'hadith.wisdom',
    },
    psychology: {
      label: 'Psychology',
      icon: Brain,
      gradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
      avatarBorder: 'from-amber-400 via-rose-500 to-purple-600',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      authorHandle: 'psychology.daily',
    },
    habits: {
      label: 'Habits',
      icon: Zap,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      avatarBorder: 'from-emerald-400 via-teal-500 to-cyan-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      authorHandle: 'atomic.habits',
    },
    mindset: {
      label: 'Mindset',
      icon: Flame,
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      avatarBorder: 'from-purple-400 via-pink-500 to-rose-600',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      authorHandle: 'growth.mindset',
    },
    productivity: {
      label: 'Productivity',
      icon: Layers,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      avatarBorder: 'from-cyan-400 via-blue-500 to-indigo-600',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      authorHandle: 'deepwork.focus',
    },
    communication: {
      label: 'Influence',
      icon: Heart,
      gradient: 'from-rose-500/20 via-orange-500/10 to-transparent',
      avatarBorder: 'from-rose-400 via-orange-500 to-amber-600',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      authorHandle: 'tactical.empathy',
    },
    books: {
      label: 'Book Insight',
      icon: BookOpen,
      gradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
      avatarBorder: 'from-amber-400 via-rose-500 to-pink-600',
      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      authorHandle: reel.source.authorOrTopic.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    },
    programming: {
      label: 'Mental Model',
      icon: Brain,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      avatarBorder: 'from-cyan-400 via-blue-500 to-indigo-600',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      authorHandle: reel.source.authorOrTopic.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    },
    'system-design': {
      label: 'System Design',
      icon: Layers,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      avatarBorder: 'from-emerald-400 via-teal-500 to-cyan-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      authorHandle: reel.source.authorOrTopic.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    },
    'habits-mindset': {
      label: 'Habits & Mindset',
      icon: Flame,
      gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
      avatarBorder: 'from-purple-400 via-fuchsia-500 to-pink-600',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      authorHandle: 'mindset.habits',
    },
    quran: {
      label: 'Quran',
      icon: BookOpen,
      gradient: 'from-teal-950/70 via-emerald-950/40 to-neutral-950',
      avatarBorder: 'from-amber-300 via-emerald-400 to-teal-500',
      badgeColor: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
      authorHandle: 'quran.daily',
    },
  }[reel.category] || {
    label: 'Psychology',
    icon: Sparkles,
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    avatarBorder: 'from-blue-400 via-cyan-500 to-emerald-600',
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    authorHandle: 'psychology.hq',
  };

  const CategoryIcon = categoryConfig.icon;
  const simulatedLikes = 1420 + index * 137 + (isLiked ? 1 : 0);
  const simulatedComments = 28 + index * 7;

  return (
    <div
      id={`reel-card-${reel.id}`}
      onClick={handleCardTap}
      className="relative w-full h-full glass-panel rounded-none sm:rounded-[32px] overflow-hidden flex flex-col justify-between select-none shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-0 sm:border sm:border-white/15 transition-all"
    >
      {/* Dynamic atmospheric background glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${categoryConfig.gradient} pointer-events-none opacity-80`}
      />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Double tap heart animation pop */}
      {showHeartAnim && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-200">
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-bounce" />
        </div>
      )}

      {/* TOP: Segmented Story / Reel Progress Bar */}
      <div className="relative z-20 px-4 pt-14 sm:pt-3.5 pb-2">
        <div className="flex items-center space-x-1.5 w-full">
          {Array.from({ length: Math.min(totalReels, 8) }).map((_, barIdx) => {
            const isCurrent = barIdx === index % 8;
            const isPast = barIdx < index % 8;
            return (
              <div
                key={barIdx}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className={`h-full transition-all duration-200 ${
                    isPast ? 'bg-white w-full' : isCurrent ? 'bg-white' : 'w-0'
                  }`}
                  style={isCurrent ? { width: isAutoPlay ? `${autoPlayProgress}%` : '100%' } : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Author / Creator Profile Row (Instagram Reels Style) */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2.5">
            {/* Instagram Story Gradient Ring Avatar */}
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${categoryConfig.avatarBorder} shadow-md`}>
              <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center text-white">
                <CategoryIcon className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-white tracking-tight">
                  @{categoryConfig.authorHandle}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                <span className="text-[10px] text-white/60 font-medium">• {reel.source.name}</span>
              </div>
              <span className="text-[10px] text-white/50 font-mono">
                {reel.estimatedReadSeconds}s read • Reel #{index + 1}
              </span>
            </div>
          </div>

          {/* Quick Controls: Focus Music & Narration */}
          <div className="flex items-center space-x-1.5">
            {/* Focus Soundscape Selector / Toggle */}
            <button
              id="btn-reel-music-toggle"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenMusicSelector) {
                  onOpenMusicSelector();
                } else {
                  onToggleMusic();
                }
              }}
              className={`p-2 rounded-full glass-pill text-xs transition-all ${
                isMusicPlaying
                  ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                  : 'text-white/60 hover:text-white'
              }`}
              title={isMusicPlaying ? 'Focus Music Playing (Click for Soundscapes)' : 'Play Focus Soundscape'}
            >
              {isMusicPlaying ? (
                <div className="flex items-end space-x-0.5 h-3 w-3.5">
                  <span className="w-0.5 bg-rose-400 animate-eq-1 rounded-full" />
                  <span className="w-0.5 bg-rose-400 animate-eq-2 rounded-full" />
                  <span className="w-0.5 bg-rose-400 animate-eq-3 rounded-full" />
                  <span className="w-0.5 bg-rose-400 animate-eq-4 rounded-full" />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Narration voice */}
            <button
              id="btn-reel-tts-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSpeech(`${reel.title}. ${reel.coreIdea}. ${reel.takeaways.map((t) => t.point).join('. ')}`);
              }}
              className={`p-2 rounded-full glass-pill text-xs transition-all ${
                isSpeechPlaying ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' : 'text-white/60 hover:text-white'
              }`}
              title="Read aloud with AI voice"
            >
              {isSpeechPlaying ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Main Instagram Visual Reel Content with Safe Margins from Floating Action Column */}
      <div className="relative z-10 flex-1 px-4 sm:px-6 md:px-8 pr-14 sm:pr-18 md:pr-20 flex flex-col justify-center items-center text-center my-auto w-full py-2 overflow-hidden">
        {/* View Mode Toggle Switch (When Animation is Available) OR Pure Quote Reflection Badge */}
        {hasAnimation ? (
          <div className="flex items-center space-x-1.5 p-1 rounded-full glass-pill border border-white/15 mb-2.5 shadow-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('visual');
              }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all ${
                viewMode === 'visual'
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3 text-rose-500" />
              <span>Synchronized Reel</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('quote');
              }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all ${
                viewMode === 'quote'
                  ? 'bg-white text-neutral-950 shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Quote className="w-3 h-3 text-cyan-400" />
              <span>Full Quote</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full glass-pill border border-white/15 mb-2.5 shadow-sm text-[10px] sm:text-[11px] font-bold text-white/80">
            <Quote className="w-3 h-3 text-amber-400" />
            <span>{reel.category === 'quran' ? 'Quran Verse' : reel.category === 'islamic' ? 'Hadith Wisdom' : 'Quote Reflection'}</span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md mb-1 max-w-md sm:max-w-lg md:max-w-xl">
          {reel.title}
        </h2>

        {/* Subtitle / Book Attribution */}
        <p className="text-xs sm:text-sm text-white/75 font-medium max-w-md sm:max-w-lg md:max-w-xl mb-3 truncate">
          {reel.subtitle}
        </p>

        {/* Content View: Animated Concept Visualizer with Synced Quote OR Full Typographic Quote */}
        <div className="w-full">
          {viewMode === 'visual' ? (
            <ConceptVisualizer
              type={reel.visualConceptType}
              title={reel.conceptAnimationLabel || reel.title}
              category={reel.category}
              accentColor={reel.accentColor}
              quote={reel.coreIdea}
              quoteAuthor={reel.quoteAuthor || reel.source.authorOrTopic}
              quotePhases={reel.quotePhases}
              isAutoPlay={isAutoPlay}
              autoPlayProgress={autoPlayProgress}
              hadithReference={reel.hadithReference}
              quranReference={reel.quranReference}
              arabicText={reel.arabicText}
              narrator={reel.narrator}
            />
          ) : (
            <div className="w-full glass-pill p-4 sm:p-5 md:p-6 rounded-2xl text-left border border-white/20 relative overflow-hidden shadow-xl backdrop-blur-xl">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-rose-500 to-purple-500" />
              <div className="flex items-start space-x-3 pl-1">
                <Quote className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold block mb-1.5">
                    {reel.quranReference ? `Quran • ${reel.quranReference}` : reel.hadithReference ? `Hadith Reference • ${reel.hadithReference}` : `Direct Insight • ${reel.source.name}`}
                  </span>
                  {reel.arabicText && (
                    <p className="text-base sm:text-lg md:text-xl font-serif text-emerald-300 mb-2 leading-relaxed font-medium" dir="rtl">
                      {reel.arabicText}
                    </p>
                  )}
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-white/95 leading-relaxed italic">
                    &quot;{reel.coreIdea}&quot;
                  </p>
                  <span className="text-[11px] text-white/60 font-mono block mt-2 font-medium">
                    — {reel.narrator ? `Narrated by ${reel.narrator}` : (reel.quoteAuthor || reel.source.authorOrTopic)}
                    {reel.hadithReference && ` (${reel.hadithReference})`}
                    {reel.quranReference && ` • ${reel.quranReference}`}
                  </span>
                </div>
              </div>

              {reel.mentalModel && (
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center space-x-2 text-xs text-white/80">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-amber-300 font-bold">
                    {reel.mentalModel.name}:
                  </span>
                  <span className="truncate text-white/85">
                    {reel.mentalModel.formulaOrRule || reel.mentalModel.description}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clean "View Breakdown & Mental Model" Action Pill */}
        <button
          id="btn-expand-breakdown"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeepDive(true);
          }}
          className="mt-3.5 px-4 py-2 rounded-full glass-pill bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Deep Dive & Takeaways</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-mono">
            {reel.takeaways.length}
          </span>
        </button>
      </div>

      {/* RIGHT: Floating Instagram Action Column */}
      <div className="absolute right-2.5 sm:right-4 bottom-14 sm:bottom-18 z-20 flex flex-col items-center space-y-2.5 sm:space-y-3.5">
        {/* Like Button */}
        <button
          id={`btn-like-${reel.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(reel.id);
          }}
          className="flex flex-col items-center group touch-manipulation"
          title="Like (L)"
        >
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center transition-transform active:scale-125 ${
              isLiked ? 'text-rose-500 bg-rose-500/20 border-rose-500/40' : 'text-white hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white/80 mt-0.5 font-mono">{simulatedLikes}</span>
        </button>

        {/* Deep Dive / Details Button */}
        <button
          id={`btn-details-${reel.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowDeepDive(true);
          }}
          className="flex flex-col items-center group touch-manipulation"
          title="View Takeaways & Code"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center text-white hover:text-cyan-400 transition-transform active:scale-110">
            <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white/80 mt-0.5 font-mono">{simulatedComments}</span>
        </button>

        {/* Bookmark Button */}
        <button
          id={`btn-bookmark-${reel.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(reel.id);
          }}
          className="flex flex-col items-center group touch-manipulation"
          title="Save to Vault (B)"
        >
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center transition-transform active:scale-110 ${
              isBookmarked ? 'text-amber-400 bg-amber-500/20 border-amber-500/40' : 'text-white hover:text-amber-300'
            }`}
          >
            <Bookmark className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white/80 mt-0.5 font-mono">Save</span>
        </button>

        {/* Share Button (Opens Instagram-Style Share Sheet Modal) */}
        <button
          id={`btn-share-${reel.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenShareModal(reel);
          }}
          className="flex flex-col items-center group touch-manipulation"
          title="Share Reel (S)"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center text-white hover:text-emerald-400 transition-transform active:scale-110">
            <Share2 className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white/80 mt-0.5 font-mono">Share</span>
        </button>

        {/* Spinning Vinyl Record Disc (Click opens Soundscapes / Shuffle) */}
        <button
          id="btn-spinning-disc"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenMusicSelector) {
              onOpenMusicSelector();
            } else {
              onToggleMusic();
            }
          }}
          className="relative mt-0.5 flex flex-col items-center touch-manipulation"
          title="Focus Soundscapes & Music (Click to Open/Shuffle)"
        >
          {isMusicPlaying && (
            <div className="absolute -top-3 -left-2 text-rose-400 text-xs font-bold pointer-events-none animate-music-note">
              ♪
            </div>
          )}

          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-950 border-2 border-neutral-700 p-1 flex items-center justify-center shadow-lg transition-transform ${
              isMusicPlaying ? 'animate-spin-slow border-rose-500/60' : 'opacity-80'
            }`}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center">
              <Disc3 className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* BOTTOM: Instagram Caption & Scrolling Music Track Bar */}
      <div className="relative z-10 px-4 sm:px-5 pb-safe pb-4 sm:pb-3 pt-2 bg-gradient-to-t from-neutral-950/95 via-neutral-950/50 to-transparent">
        <div className="pr-14">
          <p className="text-xs font-semibold text-white/90 line-clamp-1">
            <span className="font-bold text-white mr-1.5">@{categoryConfig.authorHandle}</span>
            {reel.subtitle}
          </p>

          {/* Audio Ticker Marquee */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenMusicSelector) {
                onOpenMusicSelector();
              } else {
                onToggleMusic();
              }
            }}
            className="flex items-center space-x-2 mt-1 text-[11px] text-white/75 cursor-pointer hover:text-white transition-colors"
          >
            <Music className="w-3 h-3 text-rose-400 shrink-0" />
            <div className="overflow-hidden whitespace-nowrap">
              <span className="font-mono text-[10px] tracking-wide inline-block">
                ♫ {musicTrackName} • Focus Soundscape (Tap for tracks)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE-UP INSTAGRAM GLASS BOTTOM SHEET: Deep Dive Breakdown */}
      {showDeepDive && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 top-16 z-40 glass-panel bg-neutral-950/95 backdrop-blur-2xl rounded-t-[32px] border-t border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        >
          {/* Drawer Drag Bar & Header */}
          <div className="px-5 pt-3 pb-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-neutral-950/40">
            <div className="w-10 h-1 bg-white/25 rounded-full mx-auto absolute top-2 inset-x-0" />
            <div className="flex items-center space-x-2 mt-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Reel Deep Dive</h3>
            </div>
            <button
              id="btn-close-deep-dive"
              onClick={() => setShowDeepDive(false)}
              className="p-1 rounded-full glass-pill text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sheet Scrollable Content */}
          <div className="flex-1 p-5 overflow-y-auto no-scrollbar space-y-4">
            {/* Takeaways */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-2">
                Key Actionable Takeaways
              </h4>
              <div className="space-y-2">
                {reel.takeaways.map((t, i) => {
                  const key = `${reel.id}-takeaway-${i}`;
                  const isChecked = completedActionKeys.includes(key);

                  return (
                    <div
                      key={i}
                      onClick={() => onToggleActionItem(key)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'glass-pill text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/40" />
                        )}
                      </div>
                      <div className="text-xs leading-relaxed">
                        <strong className="text-white block font-semibold">{t.point}</strong>
                        <span className="text-white/70">{t.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code Snippet (if available) */}
            {reel.codeSnippet && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2 flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code Snippet</span>
                </h4>
                <CodeViewer snippet={reel.codeSnippet} />
              </div>
            )}

            {/* 2-Minute Action Challenge */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <div className="flex items-center space-x-2 mb-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wide">2-Minute Challenge</span>
              </div>
              <p className="text-xs leading-relaxed">{reel.immediateActionChallenge}</p>
            </div>

            {/* Retention Quiz */}
            <div className="p-3.5 rounded-xl glass-pill border border-white/15">
              <div className="flex items-center space-x-2 mb-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Quick Retention Check
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mb-3">{reel.quiz.question}</p>

              <div className="space-y-1.5">
                {reel.quiz.options.map((opt, optIdx) => {
                  const isSelected = quizState?.selectedIndex === optIdx;
                  const isCorrect = optIdx === reel.quiz.correctIndex;
                  const hasAnswered = quizState !== undefined;

                  let optClass = 'glass-pill text-white/80 hover:bg-white/10';
                  if (hasAnswered) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-rose-500/20 border-rose-500/50 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleQuizSelection(optIdx)}
                      className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizState && (
                <p className="text-[11px] text-white/60 mt-2.5 pt-2 border-t border-white/10 italic">
                  {reel.quiz.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
