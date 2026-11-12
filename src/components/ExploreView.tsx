import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { MicroReel } from '../types';
import { ReelGrid } from './ReelGrid';

interface ExploreViewProps {
  reels: MicroReel[];
  onSelectReel: (reel: MicroReel, list: MicroReel[]) => void;
}

const TOPICS: Array<{ id: string; label: string; match: (r: MicroReel) => boolean }> = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'quran', label: 'Quran', match: (r) => r.category === 'quran' },
  { id: 'hadith', label: 'Hadith', match: (r) => r.category === 'islamic' },
  { id: 'habits', label: 'Habits', match: (r) => r.category === 'habits' },
  { id: 'mindset', label: 'Mindset', match: (r) => r.category === 'mindset' },
  { id: 'money', label: 'Money', match: (r) => r.tags.some((t) => /money|wealth|financ/i.test(t)) },
  { id: 'psychology', label: 'Psychology', match: (r) => r.category === 'psychology' },
  { id: 'focus', label: 'Focus', match: (r) => r.category === 'productivity' },
  { id: 'influence', label: 'Influence', match: (r) => r.category === 'communication' },
];

export const ExploreView: React.FC<ExploreViewProps> = ({ reels, onSelectReel }) => {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');

  const books = useMemo(() => {
    const seen = new Map<string, number>();
    reels.forEach((r) => {
      if (r.category !== 'quran' && r.category !== 'islamic') seen.set(r.source.name, (seen.get(r.source.name) || 0) + 1);
    });
    return [...seen.entries()].filter(([, n]) => n >= 2).map(([name]) => name);
  }, [reels]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const topicDef = TOPICS.find((t) => t.id === topic) || TOPICS[0];
    return reels.filter((r) => {
      if (!topicDef.match(r)) return false;
      if (!q) return true;
      return [r.title, r.source.name, r.source.authorOrTopic, r.coreIdea, r.quranReference, r.hadithReference, ...r.tags]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [reels, query, topic]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-10 bg-[#07070b]/95 backdrop-blur-md px-3 pt-3 pb-2 space-y-2.5">
        <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white/10 focus-within:bg-white/15 transition-colors">
          <Search className="w-4 h-4 text-white/60 shrink-0" />
          <input
            id="explore-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, verses, hadith, topics"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none min-w-0"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </label>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={`shrink-0 px-3.5 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
                topic === t.id ? 'bg-white text-neutral-950' : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!query && topic === 'all' && books.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
            {books.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setQuery(b)}
                className="shrink-0 px-3 h-7 rounded-full border border-white/20 text-[12px] text-white/80 hover:text-white hover:border-white/40"
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      <ReelGrid
        reels={results}
        onSelect={(r) => onSelectReel(r, results)}
        emptyIcon={<Search className="w-7 h-7" />}
        emptyTitle="No results"
        emptyText={`Nothing matches "${query}". Try a book title, a surah name, or a topic like patience.`}
      />
      <div className="h-6" />
    </div>
  );
};
