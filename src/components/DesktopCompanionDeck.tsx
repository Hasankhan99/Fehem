import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Brain,
  Zap,
  HelpCircle,
  Code2,
  Bookmark,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Music,
  CheckCircle2,
  Layers,
  Flame,
  X,
  ExternalLink,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroReel } from '../types';
import { CodeViewer } from './CodeViewer';

interface DesktopCompanionDeckProps {
  reel: MicroReel;
  isLiked: boolean;
  isBookmarked: boolean;
  completedActionKeys: string[];
  quizState?: { selectedIndex: number; isCorrect: boolean };
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onToggleActionItem: (key: string) => void;
  onAnswerQuiz: (reelId: string, selectedIndex: number, isCorrect: boolean) => void;
  onOpenShareModal: (reel: MicroReel) => void;
  isSpeechPlaying: boolean;
  onToggleSpeech: (text: string) => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  musicTrackName: string;
  onCloseCompanionDeck: () => void;
}

export const DesktopCompanionDeck: React.FC<DesktopCompanionDeckProps> = ({
  reel,
  isLiked,
  isBookmarked,
  completedActionKeys,
  quizState,
  onToggleLike,
  onToggleBookmark,
  onToggleActionItem,
  onAnswerQuiz,
  onOpenShareModal,
  isSpeechPlaying,
  onToggleSpeech,
  isMusicPlaying,
  onToggleMusic,
  musicTrackName,
  onCloseCompanionDeck,
}) => {
  const [activeTab, setActiveTab] = useState<'takeaways' | 'quiz' | 'model'>('takeaways');

  const handleQuizSelection = (optionIndex: number) => {
    if (quizState !== undefined) return;
    const isCorrect = optionIndex === reel.quiz.correctIndex;
    if (isCorrect) {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.5, x: 0.75 },
        colors: ['#10b981', '#38bdf8', '#f43f5e', '#fbbf24'],
      });
    }
    onAnswerQuiz(reel.id, optionIndex, isCorrect);
  };

  const completedTakeawaysCount = reel.takeaways.filter((_, idx) =>
    completedActionKeys.includes(`${reel.id}-takeaway-${idx}`)
  ).length;

  return (
    <aside
      id="desktop-companion-deck"
      aria-label="Reel Deep Dive Companion"
      className="hidden lg:flex flex-col w-[380px] xl:w-[440px] h-[calc(100dvh-6rem)] max-h-[820px] min-h-[520px] glass-panel bg-neutral-950/70 rounded-3xl border border-white/15 shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Top Header */}
      <div className="p-4 sm:p-4.5 border-b border-white/10 shrink-0 bg-neutral-950/50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>Studio Companion</span>
            </span>
            <span className="text-[10px] font-mono text-white/50">
              {reel.category.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onOpenShareModal(reel)}
              className="p-1.5 rounded-lg glass-pill text-white/70 hover:text-white transition-colors"
              title="Share Reel"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleBookmark(reel.id)}
              className={`p-1.5 rounded-lg glass-pill transition-colors ${
                isBookmarked ? 'text-amber-400 bg-amber-500/20' : 'text-white/70 hover:text-white'
              }`}
              title="Bookmark to Vault"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onCloseCompanionDeck}
              className="p-1.5 rounded-lg glass-pill text-white/50 hover:text-white transition-colors"
              title="Minimize Companion Deck (Focus Reel Mode)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="text-base font-extrabold text-white leading-snug tracking-tight">
          {reel.title}
        </h3>
        <p className="text-xs text-white/70 font-medium truncate mt-0.5">
          {reel.source.name} • {reel.source.authorOrTopic}
        </p>

        {/* Tab switchers */}
        <div className="flex items-center space-x-1.5 mt-3 p-1 rounded-xl bg-neutral-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab('takeaways')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'takeaways'
                ? 'bg-white text-neutral-950 shadow-sm font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>Takeaways</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'takeaways' ? 'bg-neutral-900 text-white' : 'bg-white/15 text-white/80'
              }`}
            >
              {completedTakeawaysCount}/{reel.takeaways.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-neutral-950 shadow-sm font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3 h-3" />
            <span>Quiz</span>
            {quizState && (
              <span
                className={`w-2 h-2 rounded-full ${
                  quizState.isCorrect ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'model'
                ? 'bg-white text-neutral-950 shadow-sm font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Brain className="w-3 h-3" />
            <span>Model</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content (Scrollable with hidden scrollbar) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {activeTab === 'takeaways' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* 2-Minute Action Challenge Highlight Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-amber-100 shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span>2-Minute Immediate Challenge</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300/80 bg-amber-400/15 px-2 py-0.5 rounded-full">
                  Actionable
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {reel.immediateActionChallenge}
              </p>
            </div>

            {/* Checklist of takeaways */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Principles (Click to mark applied)</span>
                </h4>
              </div>

              <div className="space-y-2">
                {reel.takeaways.map((t, idx) => {
                  const key = `${reel.id}-takeaway-${idx}`;
                  const isChecked = completedActionKeys.includes(key);

                  return (
                    <div
                      key={idx}
                      onClick={() => onToggleActionItem(key)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-sm'
                          : 'glass-pill bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-neutral-950">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 fill-emerald-950" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/35 hover:border-white/70" />
                        )}
                      </div>
                      <div className="text-xs leading-relaxed">
                        <strong className="text-white block font-semibold mb-0.5">
                          {t.point}
                        </strong>
                        <span className="text-white/70">{t.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl glass-pill bg-white/5 border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Retention Question</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                  Recall Test
                </span>
              </div>

              <p className="text-xs font-semibold text-white/95 leading-relaxed">
                {reel.quiz.question}
              </p>

              <div className="space-y-2 pt-1">
                {reel.quiz.options.map((opt, optIdx) => {
                  const isSelected = quizState?.selectedIndex === optIdx;
                  const isCorrect = optIdx === reel.quiz.correctIndex;
                  const hasAnswered = quizState !== undefined;

                  let optClass = 'glass-pill text-white/80 hover:bg-white/10 border-white/15';
                  if (hasAnswered) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold shadow-sm';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-rose-500/20 border-rose-500/50 text-rose-200';
                    } else {
                      optClass = 'opacity-40 border-white/10';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleQuizSelection(optIdx)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${optClass}`}
                    >
                      <span className="flex-1 pr-2">{opt}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizState && (
                <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 mt-3 animate-in fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    {quizState.isCorrect ? '✓ Correct Answer' : 'Explanation'}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    {reel.quiz.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'model' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {reel.mentalModel && (
              <div className="p-3.5 rounded-2xl glass-pill bg-white/5 border border-white/15 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wide">
                  <Brain className="w-4 h-4" />
                  <span>{reel.mentalModel.name}</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {reel.mentalModel.description}
                </p>
                {reel.mentalModel.formulaOrRule && (
                  <div className="mt-2 p-2 rounded-xl bg-neutral-900 border border-cyan-500/30 font-mono text-[11px] text-cyan-300">
                    {reel.mentalModel.formulaOrRule}
                  </div>
                )}
              </div>
            )}

            {reel.arabicText && (
              <div className="p-3.5 rounded-2xl glass-pill bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block">
                  Original Reference • {reel.hadithReference}
                </span>
                <p className="text-base font-serif text-emerald-300 leading-relaxed" dir="rtl">
                  {reel.arabicText}
                </p>
                {reel.narrator && (
                  <p className="text-[11px] text-white/60 font-mono">
                    Narrated by: {reel.narrator}
                  </p>
                )}
              </div>
            )}

            {reel.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono uppercase text-cyan-400 font-bold">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{reel.codeSnippet.title}</span>
                </div>
                <CodeViewer snippet={reel.codeSnippet} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer bar with speech & ambient audio preview */}
      <div className="p-3 border-t border-white/10 shrink-0 bg-neutral-950/60 flex items-center justify-between text-xs">
        <button
          onClick={() =>
            onToggleSpeech(`${reel.title}. ${reel.coreIdea}. ${reel.takeaways.map((t) => t.point).join('. ')}`)
          }
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-pill transition-all ${
            isSpeechPlaying ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' : 'text-white/70 hover:text-white'
          }`}
          title="Narrate with AI voice"
        >
          {isSpeechPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-medium">{isSpeechPlaying ? 'Reading...' : 'Voice Narrate'}</span>
        </button>

        <button
          onClick={onToggleMusic}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-pill transition-all ${
            isMusicPlaying ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' : 'text-white/70 hover:text-white'
          }`}
          title="Toggle Background Focus Audio"
        >
          <Music className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium max-w-[110px] truncate">{musicTrackName}</span>
        </button>
      </div>
    </aside>
  );
};
