import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Code2, Layers, Flame, ArrowRight } from 'lucide-react';
import { MicroReel } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: MicroReel[];
  onSelectReel: (reelId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  reels,
  onSelectReel,
}) => {
  const [query, setQuery] = useState('');

  const filteredReels = useMemo(() => {
    if (!query.trim()) return reels;
    const q = query.toLowerCase();

    return reels.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.source.name.toLowerCase().includes(q) ||
        r.source.authorOrTopic.toLowerCase().includes(q) ||
        r.coreIdea.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        (r.codeSnippet && r.codeSnippet.title.toLowerCase().includes(q))
    );
  }, [query, reels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-xl glass-panel bg-neutral-950/85 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center space-x-3 bg-neutral-950/60">
          <Search className="w-4 h-4 text-rose-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books (Atomic Habits, The One Thing...), coding snippets, or topics..."
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-white/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-white/60 hover:text-white text-xs px-2 py-0.5 rounded-full glass-pill"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full glass-pill text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2">
          {filteredReels.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No micro-reels found matching &quot;{query}&quot;. Try &quot;Atomic Habits&quot;, &quot;Event Loop&quot;, or &quot;Ikigai&quot;.
            </div>
          ) : (
            filteredReels.map((reel) => {
              const CategoryIcon =
                reel.category === 'books'
                  ? BookOpen
                  : reel.category === 'programming'
                  ? Code2
                  : reel.category === 'system-design'
                  ? Layers
                  : Flame;

              return (
                <div
                  key={reel.id}
                  onClick={() => {
                    onSelectReel(reel.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-950 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 flex items-center space-x-1">
                        <CategoryIcon className="w-3 h-3 text-emerald-400" />
                        <span>{reel.source.name}</span>
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {reel.estimatedReadSeconds}s read
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {reel.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {reel.coreIdea}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Quick shortcut footer */}
        <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-500 flex items-center justify-between">
          <span>{filteredReels.length} reels available</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
