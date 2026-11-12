import { BookOpen, Brain, Flame, Heart, Layers, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import { MicroReel } from '../types';

export interface ReelCreator {
  /** Channel handle shown like an Instagram username (without the @). */
  handle: string;
  /** Short category label, e.g. "Quran" or "Habits". */
  label: string;
  icon: LucideIcon;
  /** Tailwind gradient stops for the story-style avatar ring. */
  ring: string;
  /** Tailwind gradient stops for the reel background tint. */
  tint: string;
  /** Solid accent used for grid tiles. */
  accent: string;
  /** Fehem's own channels (Quran, Hadith) get a verified tick. */
  isOfficial: boolean;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'!?,]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const CATEGORY_STYLE: Record<string, Omit<ReelCreator, 'handle' | 'isOfficial'>> = {
  quran: { label: 'Quran', icon: BookOpen, ring: 'from-amber-300 via-emerald-400 to-teal-500', tint: 'from-teal-950/80 via-emerald-950/50', accent: '#0f766e' },
  islamic: { label: 'Hadith', icon: BookOpen, ring: 'from-emerald-400 via-teal-400 to-amber-300', tint: 'from-emerald-950/80 via-teal-950/40', accent: '#047857' },
  psychology: { label: 'Psychology', icon: Brain, ring: 'from-amber-400 via-rose-500 to-purple-600', tint: 'from-amber-900/40 via-rose-950/30', accent: '#b45309' },
  habits: { label: 'Habits', icon: Zap, ring: 'from-emerald-400 via-teal-500 to-cyan-600', tint: 'from-emerald-900/40 via-teal-950/30', accent: '#0e7490' },
  mindset: { label: 'Mindset', icon: Flame, ring: 'from-purple-400 via-pink-500 to-rose-600', tint: 'from-purple-900/40 via-pink-950/30', accent: '#7e22ce' },
  productivity: { label: 'Focus', icon: Layers, ring: 'from-cyan-400 via-blue-500 to-indigo-600', tint: 'from-cyan-900/40 via-blue-950/30', accent: '#1d4ed8' },
  communication: { label: 'Influence', icon: Heart, ring: 'from-rose-400 via-orange-500 to-amber-600', tint: 'from-rose-900/40 via-orange-950/30', accent: '#be123c' },
};

const FALLBACK_STYLE = { label: 'Insight', icon: Sparkles, ring: 'from-blue-400 via-cyan-500 to-emerald-600', tint: 'from-blue-900/40 via-cyan-950/30', accent: '#0369a1' };

export function getReelCreator(reel: MicroReel): ReelCreator {
  const style = CATEGORY_STYLE[reel.category] || FALLBACK_STYLE;
  if (reel.category === 'quran') return { ...style, handle: 'quran.daily', isOfficial: true };
  if (reel.category === 'islamic') return { ...style, handle: 'hadith.daily', isOfficial: true };
  // Book reels are grouped into one channel per book, so following a book
  // brings its reels into the Following tab.
  return { ...style, handle: slug(reel.source.name) || 'fehem', isOfficial: false };
}

export const isScriptureReel = (reel: MicroReel) => reel.category === 'quran' || reel.category === 'islamic';

/** Instagram-style compact counts: 950, 1.2K, 3.4M. */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, '')}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}
