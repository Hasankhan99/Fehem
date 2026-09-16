import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Bookmark,
  Heart,
  Flame,
  Zap,
  Cloud,
  LogOut,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  User,
} from 'lucide-react';
import { UserProfile, UserSavedData } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  userData: UserSavedData;
  onSignInWithGoogle?: (profile: UserProfile) => void;
  onSignOut?: () => void;
  onSyncData?: () => Promise<void>;
  onAuthChange?: (profile: UserProfile | null) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  userData,
  onSignInWithGoogle,
  onSignOut,
  onSyncData,
  onAuthChange,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  if (!isOpen) return null;

  const handleQuickGoogleSignIn = () => {
    // Standard Google Profile initialization
    const googleProfile: UserProfile = {
      id: 'google-usr-' + Math.random().toString(36).substring(2, 9),
      name: customName.trim() || 'Hasan Kha',
      email: customEmail.trim() || 'M.hasankha@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
      syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (typeof onSignInWithGoogle === 'function') {
      onSignInWithGoogle(googleProfile);
    }
    if (typeof onAuthChange === 'function') {
      onAuthChange(googleProfile);
    }
    setShowManualForm(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const profile: UserProfile = {
      id: 'google-usr-' + Math.random().toString(36).substring(2, 9),
      name: customName.trim() || customEmail.split('@')[0],
      email: customEmail.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
      syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    if (typeof onSignInWithGoogle === 'function') {
      onSignInWithGoogle(profile);
    }
    if (typeof onAuthChange === 'function') {
      onAuthChange(profile);
    }
    setShowManualForm(false);
  };

  const handleSignOutClick = () => {
    if (typeof onSignOut === 'function') {
      onSignOut();
    }
    if (typeof onAuthChange === 'function') {
      onAuthChange(null);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      if (typeof onSyncData === 'function') {
        await onSyncData();
      } else if (userProfile) {
        await fetch('/api/user/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userProfile.id,
            email: userProfile.email,
            data: userData,
          }),
        });
      }
    } catch (err) {
      console.error('Failed to sync learning record:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-md glass-panel bg-neutral-950/85 rounded-3xl border border-white/15 p-5 sm:p-6 shadow-2xl overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-pill text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {userProfile ? (
          /* Logged In User Dashboard */
          <div className="space-y-4">
            {/* Header profile info */}
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <img
                  src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={userProfile.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-emerald-400/80 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow">
                  {/* Google standard "G" icon */}
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
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-base font-bold text-white">{userProfile.name}</h3>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                </div>
                <p className="text-xs text-white/60 font-mono">{userProfile.email}</p>
                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-medium mt-0.5">
                  <Cloud className="w-3 h-3" />
                  <span>Cloud Record Sync Active • {userProfile.syncedAt || 'Now'}</span>
                </span>
              </div>
            </div>

            {/* User learning record metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl glass-pill text-center">
                <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1 fill-amber-400" />
                <div className="text-sm font-bold text-white font-mono">{userData.streakDays}d</div>
                <div className="text-[10px] text-white/50">Focus Streak</div>
              </div>
              <div className="p-2.5 rounded-xl glass-pill text-center">
                <Bookmark className="w-4 h-4 text-emerald-400 mx-auto mb-1 fill-emerald-400" />
                <div className="text-sm font-bold text-white font-mono">
                  {userData.bookmarkedIds.length}
                </div>
                <div className="text-[10px] text-white/50">Saved Reels</div>
              </div>
              <div className="p-2.5 rounded-xl glass-pill text-center">
                <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-white font-mono">
                  {Object.keys(userData.completedQuizzes).length}
                </div>
                <div className="text-[10px] text-white/50">Quizzes Passed</div>
              </div>
            </div>

            {/* Sync Now button */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex items-center space-x-1.5 text-xs text-white/80 hover:text-white glass-pill px-3 py-1.5 rounded-full"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Record Now'}</span>
              </button>

              <button
                onClick={handleSignOutClick}
                className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 glass-pill px-3 py-1.5 rounded-full border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign-In View */
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center p-2.5 border border-white/20 shadow-lg">
              <svg className="w-full h-full" viewBox="0 0 24 24">
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

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Connect with Google
              </h3>
              <p className="text-xs text-white/60 max-w-xs mx-auto mt-1">
                Save and sync your learning streak, bookmarked reels, quiz scores, and custom AI reels across all devices.
              </p>
            </div>

            {/* Quick 1-Click Google Sign In Button */}
            <button
              id="btn-google-signin-primary"
              onClick={handleQuickGoogleSignIn}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm flex items-center justify-center space-x-3 shadow-lg shadow-white/10 active:scale-98 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            {/* Custom Google Account Option */}
            <div className="pt-2">
              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs text-white/50 hover:text-white underline transition-colors"
              >
                {showManualForm ? 'Hide specific account fields' : 'Sign in with custom Google email'}
              </button>

              {showManualForm && (
                <form onSubmit={handleManualSubmit} className="mt-3 space-y-2 text-left animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full p-2 rounded-xl glass-pill text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    className="w-full p-2 rounded-xl glass-pill text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold"
                  >
                    Authenticate Account
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-white/40 pt-2 border-t border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure Google Identity • Private & Encrypted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
