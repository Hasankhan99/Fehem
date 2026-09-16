import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, Brain, Flame, Layers, Heart, Zap, CheckCircle2 } from 'lucide-react';
import { MicroReel, Category } from '../types';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReelGenerated: (reel: MicroReel) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onReelGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [categoryType, setCategoryType] = useState<Category>('psychology');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const suggestionChips: Array<{ label: string; book: string; type: Category }> = [
    { label: 'Stimulus vs Response Gap', book: 'Viktor Frankl (Man’s Search for Meaning)', type: 'psychology' },
    { label: 'System 1 vs System 2 Thinking', book: 'Daniel Kahneman (Thinking, Fast and Slow)', type: 'psychology' },
    { label: 'The 2-Minute Rule', book: 'James Clear (Atomic Habits)', type: 'habits' },
    { label: 'Quadrant II Focus Matrix', book: 'Stephen Covey (7 Habits)', type: 'productivity' },
    { label: 'Attention Residue & Shielding', book: 'Cal Newport (Deep Work)', type: 'productivity' },
    { label: 'Tactical Empathy & Mirroring', book: 'Chris Voss (Never Split the Difference)', type: 'communication' },
    { label: 'The Power of "Yet"', book: 'Carol S. Dweck (Mindset)', type: 'mindset' },
    { label: 'The Dichotomy of Control', book: 'Ryan Holiday (The Daily Stoic)', type: 'mindset' },
    { label: 'Eat That Frog First', book: 'Brian Tracy (Eat That Frog!)', type: 'productivity' },
    { label: 'Room for Error & Compounding', book: 'Morgan Housel (Psychology of Money)', type: 'psychology' },
    { label: 'The 90% Rule of Essentialism', book: 'Greg McKeown (Essentialism)', type: 'productivity' },
    { label: 'The Arena of Vulnerability', book: 'Brené Brown (Daring Greatly)', type: 'mindset' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          type: categoryType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate reel');
      }

      const data = await response.json();
      if (data.reel) {
        onReelGenerated(data.reel);
        setTopic('');
        onClose();
      } else {
        throw new Error('Malformed response from generation service');
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the reel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel bg-neutral-950/90 rounded-3xl p-5 sm:p-6 overflow-hidden relative shadow-2xl border border-white/15">
        {/* Close Button */}
        <button
          id="btn-close-ai-modal"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full glass-pill text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Brain className="w-4 h-4 text-white font-bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Create Psychology Micro-Reel
            </h2>
            <p className="text-xs text-white/60">
              Distill single high-leverage concepts from world-class psychology literature
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Behavioral Domain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategoryType('psychology')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  categoryType === 'psychology'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Psychology</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryType('habits')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  categoryType === 'habits'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Habits</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryType('mindset')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  categoryType === 'mindset'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Mindset</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryType('productivity')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  categoryType === 'productivity'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Focus & Flow</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryType('communication')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  categoryType === 'communication'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Influence</span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryType('books')}
                className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                  categoryType === 'books'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>All Books</span>
              </button>
            </div>
          </div>

          {/* Topic / Concept Input */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Specific Concept or Book Title
            </label>
            <input
              id="input-ai-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Viktor Frankl space between stimulus and response, or The 2-Minute Rule..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-400 focus:outline-none text-white text-sm placeholder-neutral-500"
            />
          </div>

          {/* Inspiration Chips */}
          <div>
            <span className="text-[11px] text-neutral-400 font-mono block mb-1.5">
              Single-concept book ideas:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTopic(`${chip.label} — ${chip.book}`);
                    setCategoryType(chip.type);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors flex items-center space-x-1"
                >
                  <span className="font-semibold text-white/90">{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-submit-ai-reel"
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-rose-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Distilling Psychology Insight with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Single-Concept Reel</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
