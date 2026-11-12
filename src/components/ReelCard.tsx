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
  Send,
  Headphones,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroReel } from '../types';
import { CodeViewer } from './CodeViewer';
import { ConceptVisualizer, AVAILABLE_ANIMATION_TYPES } from './ConceptVisualizer';
import { formatCount, getReelCreator } from '../utils/reelMeta';

/** Plain Instagram-style action icon with a small label underneath. */
const ActionButton: React.FC<{ id?: string; label: string; title: string; onClick: () => void; children: React.ReactNode }> = ({ id, label, title, onClick, children }) => (
  <button
    id={id}
    type="button"
    title={title}
    aria-label={title}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="flex flex-col items-center gap-1 touch-manipulation active:scale-90 transition-transform drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
  >
    {children}
    <span className="text-[12px] font-semibold leading-none">{label}</span>
  </button>
);

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
  onToggleAutoPlay: () => void;
  // Share modal trigger
  onOpenShareModal: (reel: MicroReel) => void;
  // Follow the reel's channel (book / Quran / Hadith)
  isFollowing: boolean;
  onToggleFollow: (handle: string) => void;
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
  onToggleAutoPlay,
  isFollowing,
  onToggleFollow,
}) => {
  const [captionExpanded, setCaptionExpanded] = useState(false);
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
    setCaptionExpanded(false);
    setViewMode('visual');
  }, [reel.id]);

  // Instagram-style taps: one tap pauses/resumes, two quick taps like the reel.
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pauseFlash, setPauseFlash] = useState<'pause' | 'play' | null>(null);
  useEffect(() => () => { if (tapTimerRef.current) clearTimeout(tapTimerRef.current); }, []);

  const handleCardTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a') || showDeepDive) {
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      if (!isLiked) onToggleLike(reel.id);
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null;
      setPauseFlash(isAutoPlay ? 'pause' : 'play');
      setTimeout(() => setPauseFlash(null), 700);
      onToggleAutoPlay();
    }, 280);
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

  const creator = getReelCreator(reel);
  const CategoryIcon = creator.icon;
  const likeCount = reel.likesCount + (isLiked ? 1 : 0);
  const captionTags = reel.tags.slice(0, 4).map((t) => `#${t.replace(/[^\p{L}\p{N}]+/gu, '').toLowerCase()}`);
  const openMusic = () => (onOpenMusicSelector ? onOpenMusicSelector() : onToggleMusic());

  return (
    <div
      id={`reel-card-${reel.id}`}
      onClick={handleCardTap}
      className="relative w-full h-full bg-[#0b0b10] rounded-none md:rounded-lg overflow-hidden flex flex-col select-none"
    >
      {/* Background tint per channel */}
      <div className={`absolute inset-0 bg-gradient-to-b ${creator.tint} to-[#0b0b10] pointer-events-none`} />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: reel.accentColor || creator.accent }}
      />

      {/* Double-tap heart */}
      {showHeartAnim && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <Heart className="w-28 h-28 text-white fill-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] animate-heart-pop" />
        </div>
      )}

      {/* Single-tap pause / play indicator */}
      {pauseFlash && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center animate-heart-pop">
            {pauseFlash === 'pause' ? <Pause className="w-7 h-7 text-white fill-white" /> : <Play className="w-7 h-7 text-white fill-white ml-1" />}
          </div>
        </div>
      )}

      {/* Room for the transparent feed tabs that overlay the top of the reel */}
      <div className="h-14 shrink-0" />

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

      </div>

      {/* RIGHT: Instagram action column (plain icons, counts underneath) */}
      <div className="absolute right-2 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
        <ActionButton
          id={`btn-like-${reel.id}`}
          label={formatCount(likeCount)}
          title="Like (L)"
          onClick={() => onToggleLike(reel.id)}
        >
          <Heart className={`w-7 h-7 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
        </ActionButton>

        <ActionButton id={`btn-details-${reel.id}`} label="Learn" title="Takeaways & quiz" onClick={() => setShowDeepDive(true)}>
          <MessageCircle className="w-7 h-7 -scale-x-100" />
        </ActionButton>

        <ActionButton id={`btn-share-${reel.id}`} label="Share" title="Share (S)" onClick={() => onOpenShareModal(reel)}>
          <Send className="w-7 h-7" />
        </ActionButton>

        <ActionButton
          id={`btn-bookmark-${reel.id}`}
          label={isBookmarked ? 'Saved' : 'Save'}
          title="Save (B)"
          onClick={() => onToggleBookmark(reel.id)}
        >
          <Bookmark className={`w-7 h-7 ${isBookmarked ? 'fill-white' : ''}`} />
        </ActionButton>

        <ActionButton
          id="btn-reel-tts-toggle"
          label={isSpeechPlaying ? 'Stop' : 'Listen'}
          title="Read aloud"
          onClick={() => onToggleSpeech(`${reel.title}. ${reel.coreIdea}. ${reel.takeaways.map((t) => t.point).join('. ')}`)}
        >
          <Headphones className={`w-7 h-7 ${isSpeechPlaying ? 'text-sky-400' : ''}`} />
        </ActionButton>

        {/* Audio thumbnail (opens focus sounds) */}
        <button
          id="btn-spinning-disc"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openMusic();
          }}
          title="Focus sounds"
          className={`mt-1 w-8 h-8 rounded-lg border-2 border-white overflow-hidden bg-gradient-to-tr ${creator.ring} flex items-center justify-center ${
            isMusicPlaying ? 'animate-spin-slow rounded-full' : ''
          }`}
        >
          <Music className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* BOTTOM: creator row, caption, audio line */}
      <div className="relative z-10 px-3 pb-4 pt-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="pr-14 space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${creator.ring} shrink-0`}>
              <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center">
                <CategoryIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-sm font-bold text-white truncate">{creator.handle}</span>
            {creator.isOfficial && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-sky-400 fill-sky-400 [&>path]:stroke-white" />}
            <button
              id={`btn-follow-${reel.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow(creator.handle);
              }}
              className={`shrink-0 h-7 px-3 rounded-lg text-[13px] font-semibold transition-colors ${
                isFollowing ? 'bg-white/15 text-white' : 'border border-white/70 text-white hover:bg-white/10'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCaptionExpanded((v) => !v);
            }}
            className={`w-full text-left text-[13px] text-white/95 leading-snug ${captionExpanded ? 'block' : 'flex items-baseline gap-1'}`}
          >
            <span className={captionExpanded ? '' : 'truncate min-w-0'}>
              <span className="font-semibold">{reel.title}</span> · {reel.subtitle}
            </span>
            {captionExpanded ? (
              <>
                <span className="block mt-1 text-white/85">{reel.coreIdea}</span>
                <span className="block mt-1 text-sky-300">{captionTags.join(' ')}</span>
              </>
            ) : (
              <span className="shrink-0 text-white/60">more</span>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeepDive(true);
            }}
            className="block text-[13px] text-white/60 hover:text-white/80"
          >
            View {reel.takeaways.length} takeaways, challenge & quiz
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMusic();
            }}
            className="flex items-center gap-1.5 text-[12px] text-white/90 max-w-full"
          >
            <Music className="w-3 h-3 shrink-0" />
            <span className="overflow-hidden whitespace-nowrap max-w-[220px]">
              <span className={`inline-block ${isMusicPlaying ? 'animate-marquee' : ''}`}>
                {musicTrackName} · Focus sounds
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Thin playback progress line, like Instagram Reels */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15 z-20 pointer-events-none">
        <div className="h-full bg-white/90 transition-[width] duration-100 ease-linear" style={{ width: `${autoPlayProgress}%` }} />
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
