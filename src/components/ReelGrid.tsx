import React from 'react';
import { Heart, Play } from 'lucide-react';
import { MicroReel } from '../types';
import { formatCount, getReelCreator, isScriptureReel } from '../utils/reelMeta';

interface ReelGridProps {
  reels: MicroReel[];
  onSelect: (reel: MicroReel) => void;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyText?: string;
}

/** Three-column, edge-to-edge grid of reel thumbnails, like an Instagram profile or Explore page. */
export const ReelGrid: React.FC<ReelGridProps> = ({ reels, onSelect, emptyIcon, emptyTitle, emptyText }) => {
  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-8">
        {emptyIcon && (
          <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center mb-4 text-white">
            {emptyIcon}
          </div>
        )}
        {emptyTitle && <h3 className="text-xl font-extrabold text-white mb-1">{emptyTitle}</h3>}
        {emptyText && <p className="text-sm text-white/60 max-w-xs">{emptyText}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {reels.map((reel) => (
        <ReelTile key={reel.id} reel={reel} onSelect={onSelect} />
      ))}
    </div>
  );
};

const ReelTile: React.FC<{ reel: MicroReel; onSelect: (reel: MicroReel) => void }> = ({ reel, onSelect }) => {
  const creator = getReelCreator(reel);
  const Icon = creator.icon;
  const scripture = isScriptureReel(reel);

  return (
    <button
      type="button"
      onClick={() => onSelect(reel)}
      className="group relative aspect-[3/4] overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-white"
      style={{ background: `linear-gradient(160deg, ${reel.accentColor || creator.accent}cc 0%, #0b0b10 85%)` }}
      aria-label={`${reel.title} — ${reel.source.name}`}
    >
      <div className="absolute inset-0 p-2 sm:p-3 flex flex-col">
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/75">
          <Icon className="w-3 h-3 shrink-0" />
          <span className="truncate">{creator.label}</span>
        </div>

        {scripture && reel.arabicText ? (
          <p dir="rtl" className="mt-auto text-[13px] sm:text-base text-white line-clamp-3 leading-relaxed">
            {reel.arabicText}
          </p>
        ) : null}

        <h4
          className={`${scripture && reel.arabicText ? 'mt-1' : 'mt-auto'} text-[11px] sm:text-sm font-extrabold text-white leading-tight line-clamp-3 drop-shadow`}
        >
          {reel.title}
        </h4>
        <p className="mt-0.5 text-[9px] sm:text-[11px] text-white/60 truncate">{reel.source.name}</p>
      </div>

      <div className="absolute bottom-1.5 right-2 flex items-center gap-0.5 text-[10px] font-bold text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="w-3 h-3 fill-white" />
        {formatCount(reel.likesCount)}
      </div>
      <Play className="absolute top-2 right-2 w-3.5 h-3.5 text-white/80 fill-white/80" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </button>
  );
};
