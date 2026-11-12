import React from 'react';
import { Bookmark, Compass, Home, PlusSquare, UserCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

export type AppTab = 'home' | 'explore' | 'saved' | 'profile';

interface AppNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  onCreate: () => void;
  userProfile: UserProfile | null;
  savedCount: number;
}

const ITEMS: Array<{ id: AppTab | 'create'; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'create', label: 'Create', icon: PlusSquare },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'profile', label: 'Profile', icon: UserCircle2 },
];

const Avatar: React.FC<{ userProfile: UserProfile | null; active: boolean }> = ({ userProfile, active }) =>
  userProfile?.avatarUrl ? (
    <img
      src={userProfile.avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      className={`w-6 h-6 rounded-full object-cover ${active ? 'ring-2 ring-white ring-offset-1 ring-offset-black' : ''}`}
    />
  ) : (
    <UserCircle2 className="w-6 h-6" strokeWidth={active ? 2.6 : 1.8} />
  );

/** Instagram-style navigation: bottom tab bar on phones, left sidebar on tablets and desktop. */
export const AppNav: React.FC<AppNavProps> = ({ active, onChange, onCreate, userProfile, savedCount }) => {
  const handle = (id: AppTab | 'create') => (id === 'create' ? onCreate() : onChange(id));

  return (
    <>
      {/* Phone: bottom tab bar */}
      <nav
        aria-label="Main"
        className="md:hidden shrink-0 z-40 bg-black border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="h-12 grid grid-cols-5">
          {ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <li key={id} className="flex">
                <button
                  id={`nav-${id}`}
                  type="button"
                  onClick={() => handle(id)}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative flex-1 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                  {id === 'profile' ? (
                    <Avatar userProfile={userProfile} active={isActive} />
                  ) : (
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.6 : 1.8} fill={isActive && (id === 'home' || id === 'saved') ? 'currentColor' : 'none'} />
                  )}
                  {id === 'saved' && savedCount > 0 && !isActive && (
                    <span className="absolute top-2.5 right-[calc(50%-14px)] w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tablet & desktop: left sidebar */}
      <nav
        aria-label="Main"
        className="hidden md:flex order-first shrink-0 z-40 flex-col w-[72px] xl:w-60 h-full border-r border-white/10 bg-black px-3 py-6"
      >
        <div className="px-3 mb-8 h-10 flex items-center">
          <span className="hidden xl:block text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            Fehem
          </span>
          <span className="xl:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white font-extrabold">
            F
          </span>
        </div>
        <ul className="space-y-1">
          {ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => handle(id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={label}
                  className="w-full flex items-center gap-4 px-3 h-12 rounded-lg text-white hover:bg-white/10 transition-colors group"
                >
                  <span className="group-hover:scale-105 transition-transform">
                    {id === 'profile' ? (
                      <Avatar userProfile={userProfile} active={isActive} />
                    ) : (
                      <Icon className="w-6 h-6" strokeWidth={isActive ? 2.6 : 1.8} fill={isActive && (id === 'home' || id === 'saved') ? 'currentColor' : 'none'} />
                    )}
                  </span>
                  <span className={`hidden xl:inline text-[15px] ${isActive ? 'font-extrabold' : 'font-normal'}`}>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
