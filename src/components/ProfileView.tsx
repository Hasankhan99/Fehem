import React, { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, Grid3x3, Heart, Music, PanelRight, Users } from 'lucide-react';
import { MicroReel, UserProfile, UserSavedData } from '../types';
import { ReelGrid } from './ReelGrid';
import { getReelCreator } from '../utils/reelMeta';

interface ProfileViewProps {
  reels: MicroReel[];
  userData: UserSavedData;
  userProfile: UserProfile | null;
  onSelectReel: (reel: MicroReel, list: MicroReel[]) => void;
  onOpenAccount: () => void;
  onOpenVault: () => void;
  onOpenSounds: () => void;
  onToggleFollow: (handle: string) => void;
  isStudyPanelOn: boolean;
  onToggleStudyPanel: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  reels,
  userData,
  userProfile,
  onSelectReel,
  onOpenAccount,
  onOpenVault,
  onOpenSounds,
  onToggleFollow,
  isStudyPanelOn,
  onToggleStudyPanel,
}) => {
  const [tab, setTab] = useState<'liked' | 'following'>('liked');
  const following = userData.followedHandles || [];

  const liked = useMemo(() => reels.filter((r) => userData.likedIds.includes(r.id)), [reels, userData.likedIds]);
  const correctQuizzes = Object.values(userData.completedQuizzes).filter((q: { isCorrect: boolean }) => q.isCorrect).length;

  // One representative reel per followed channel, for the avatar + label.
  const followedChannels = useMemo(
    () =>
      following.map((handle) => {
        const sample = reels.find((r) => getReelCreator(r).handle === handle);
        const count = reels.filter((r) => getReelCreator(r).handle === handle).length;
        return { handle, sample, count };
      }),
    [following, reels]
  );

  const name = userProfile?.name || 'Guest learner';
  const username = userProfile?.email?.split('@')[0] || 'guest';

  const stats = [
    { label: 'Day streak', value: userData.streakDays },
    { label: 'Liked', value: userData.likedIds.length },
    { label: 'Quizzes', value: correctQuizzes },
    { label: 'Following', value: following.length },
  ];

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-3xl mx-auto">
        <div className="px-4 pt-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-white">{username}</h1>
          <button type="button" onClick={onOpenSounds} className="p-2 -mr-2 text-white" aria-label="Focus sounds">
            <Music className="w-6 h-6" />
          </button>
        </div>

        {/* Header: avatar + stats */}
        <div className="px-4 pt-4 flex items-center gap-5 sm:gap-10">
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-neutral-900 border-[3px] border-[#07070b] overflow-hidden flex items-center justify-center">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold text-white/90">{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-lg sm:text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-[11px] sm:text-sm text-white/70 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3">
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-sm text-white/80">Learning a little every day from great books, the Quran and Hadith.</p>
        </div>

        <div className="px-4 pt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onOpenAccount} className="h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white">
            {userProfile ? 'Account & sync' : 'Sign in to sync'}
          </button>
          <button type="button" onClick={onOpenVault} className="h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white">
            Study notes
          </button>
          <button
            type="button"
            onClick={onToggleStudyPanel}
            className="hidden lg:flex col-span-2 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white items-center justify-center gap-2"
          >
            <PanelRight className="w-4 h-4" />
            {isStudyPanelOn ? 'Hide study panel beside reels' : 'Show study panel beside reels'}
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 grid grid-cols-2 border-t border-white/10">
          {([
            { id: 'liked', icon: Heart, label: 'Liked' },
            { id: 'following', icon: Users, label: 'Following' },
          ] as const).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-label={t.label}
              className={`h-12 flex items-center justify-center gap-2 border-t-2 -mt-px text-xs font-semibold uppercase tracking-wider ${
                tab === t.id ? 'border-white text-white' : 'border-transparent text-white/50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'liked' ? (
          <ReelGrid
            reels={liked}
            onSelect={(r) => onSelectReel(r, liked)}
            emptyIcon={<Heart className="w-7 h-7" />}
            emptyTitle="No likes yet"
            emptyText="Double-tap a reel to like it. Your liked reels show up here."
          />
        ) : followedChannels.length === 0 ? (
          <ReelGrid
            reels={[]}
            onSelect={() => {}}
            emptyIcon={<Users className="w-7 h-7" />}
            emptyTitle="Not following anyone"
            emptyText="Tap Follow on a reel to see more from that book or channel in your Following feed."
          />
        ) : (
          <ul className="divide-y divide-white/5">
            {followedChannels.map(({ handle, sample, count }) => {
              const creator = sample ? getReelCreator(sample) : null;
              const Icon = creator?.icon || Grid3x3;
              return (
                <li key={handle} className="px-4 py-3 flex items-center gap-3">
                  <div className={`p-[2px] rounded-full bg-gradient-to-tr ${creator?.ring || 'from-white/40 to-white/10'}`}>
                    <div className="w-11 h-11 rounded-full bg-neutral-950 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                    onClick={() => sample && onSelectReel(sample, reels.filter((r) => getReelCreator(r).handle === handle))}
                  >
                    <p className="text-sm font-bold text-white truncate flex items-center gap-1">
                      {handle}
                      {creator?.isOfficial && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400 [&>path]:stroke-white" />}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {sample?.source.name} · {count} reels
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFollow(handle)}
                    className="h-8 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold text-white"
                  >
                    Following
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="h-6" />
      </div>
    </div>
  );
};

interface SavedViewProps {
  reels: MicroReel[];
  userData: UserSavedData;
  onSelectReel: (reel: MicroReel, list: MicroReel[]) => void;
  onOpenVault: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({ reels, userData, onSelectReel, onOpenVault }) => {
  // Most recently saved first.
  const saved = useMemo(
    () =>
      [...userData.bookmarkedIds]
        .reverse()
        .map((id) => reels.find((r) => r.id === id))
        .filter((r): r is MicroReel => Boolean(r)),
    [reels, userData.bookmarkedIds]
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="max-w-3xl mx-auto">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-white">Saved</h1>
          {saved.length > 0 && (
            <button type="button" onClick={onOpenVault} className="text-sm font-semibold text-sky-400 hover:text-sky-300">
              Study notes
            </button>
          )}
        </div>
        <ReelGrid
          reels={saved}
          onSelect={(r) => onSelectReel(r, saved)}
          emptyIcon={<Bookmark className="w-7 h-7" />}
          emptyTitle="Save reels to revisit"
          emptyText="Tap the bookmark on any reel. Saved verses and lessons collect here so you can review them later."
        />
        <div className="h-6" />
      </div>
    </div>
  );
};
