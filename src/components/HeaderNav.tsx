import React from 'react';
import {
  Sparkles,
  BookOpen,
  Brain,
  Flame,
  Zap,
  Heart,
  Search,
  Bookmark,
  Music,
  Plus,
  Sliders,
  UserCheck,
  Layers,
} from 'lucide-react';
import { Category, UserProfile } from '../types';

interface HeaderNavProps {
  currentCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onOpenAIGenerator: () => void;
  onOpenVault: () => void;
  onOpenSearch: () => void;
  vaultCount: number;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onOpenMusicSelector: () => void;
  currentTrackName: string;
  userProfile: UserProfile | null;
  onOpenAuthModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenAIGenerator,
  onOpenVault,
  onOpenSearch,
  vaultCount,
  isMusicPlaying,
  onToggleMusic,
  onOpenMusicSelector,
  currentTrackName,
  userProfile,
  onOpenAuthModal,
}) => {
  const categories: Array<{ id: Category; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'islamic', label: 'Islamic Wisdom', icon: BookOpen },
    { id: 'psychology', label: 'Psychology', icon: Brain },
    { id: 'habits', label: 'Habits', icon: Zap },
    { id: 'mindset', label: 'Mindset', icon: Flame },
    { id: 'productivity', label: 'Focus', icon: Layers },
    { id: 'communication', label: 'Influence', icon: Heart },
  ];

  return (
    <header className="w-full z-40 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto glass-panel rounded-2xl px-3.5 sm:px-5 py-2 flex items-center justify-between gap-2 shadow-xl border border-white/10">
        {/* Left: Minimal Instagram-style Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white flex items-center">
            Fehem
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </span>
        </div>

        {/* Center: Clean Category Glass Pills (Minimal & Simple) */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-neutral-950 shadow-md font-bold'
                    : 'text-white/60 hover:text-white glass-pill border-transparent hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right: Clean Actions (Focus Music, Search, AI, Vault, Google Auth) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Focus Soundscapes Button */}
          <button
            id="btn-nav-focus-sound"
            onClick={onOpenMusicSelector}
            className={`px-2.5 py-1 rounded-full glass-pill transition-all text-xs flex items-center space-x-1.5 border ${
              isMusicPlaying
                ? 'text-rose-400 bg-rose-500/20 border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'text-white/70 hover:text-white border-white/15'
            }`}
            title="Focus Soundscapes (Procedural vocal & binaural audio)"
          >
            {isMusicPlaying ? (
              <div className="flex items-end space-x-0.5 h-3 w-3">
                <span className="w-0.5 bg-rose-400 animate-eq-1 rounded-full" />
                <span className="w-0.5 bg-rose-400 animate-eq-2 rounded-full" />
                <span className="w-0.5 bg-rose-400 animate-eq-3 rounded-full" />
              </div>
            ) : (
              <Music className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline text-[11px] font-medium max-w-[85px] truncate">
              {currentTrackName}
            </span>
          </button>

          {/* Search */}
          <button
            id="btn-nav-search"
            onClick={onOpenSearch}
            className="p-2 rounded-full glass-pill text-white/70 hover:text-white transition-all"
            title="Search reels"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* AI Generator */}
          <button
            id="btn-nav-ai"
            onClick={onOpenAIGenerator}
            className="p-2 rounded-full glass-pill text-white/70 hover:text-white transition-all"
            title="Generate custom micro-reel"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Saved Vault */}
          <button
            id="btn-nav-vault"
            onClick={onOpenVault}
            className="p-2 rounded-full glass-pill text-white/70 hover:text-white transition-all relative"
            title="Saved Vault"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {vaultCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 text-neutral-950 rounded-full text-[8px] font-bold flex items-center justify-center">
                {vaultCount}
              </span>
            )}
          </button>

          {/* Google Auth & User Record Tracking Pill */}
          <button
            id="btn-nav-google-auth"
            onClick={onOpenAuthModal}
            className={`p-1 pl-1.5 pr-2 rounded-full glass-pill flex items-center space-x-1.5 transition-all border ${
              userProfile
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-white/15 text-white/80 hover:text-white hover:border-white/30'
            }`}
            title={userProfile ? `Signed in as ${userProfile.name} • Learning Record Synced` : 'Sign in with Google to track progress'}
          >
            {userProfile?.avatarUrl ? (
              <div className="relative">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-neutral-900" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
            )}
            <span className="text-[11px] font-semibold tracking-tight hidden sm:inline">
              {userProfile ? userProfile.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
