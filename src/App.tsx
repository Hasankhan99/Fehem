import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CURATED_REELS } from './data/curatedReels';
import { MicroReel, UserSavedData, UserProfile } from './types';
import { ReelCard } from './components/ReelCard';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { KnowledgeVaultModal } from './components/KnowledgeVaultModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ShareReelModal } from './components/ShareReelModal';
import { FocusMusicSelector } from './components/FocusMusicSelector';
import { DesktopCompanionDeck } from './components/DesktopCompanionDeck';
import { AppNav, AppTab } from './components/AppNav';
import { ExploreView } from './components/ExploreView';
import { ProfileView, SavedView } from './components/ProfileView';
import { useSpeech } from './utils/useSpeech';
import { focusMusic } from './utils/focusMusicEngine';
import { getReelCreator, getReelSoundtrack, isScriptureReel } from './utils/reelMeta';
import { ChevronUp, ChevronDown, ChevronLeft, Music, Search, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

const STORAGE_KEY_USER_DATA = 'fehem_reels_user_data_v1';
const STORAGE_KEY_CUSTOM_REELS = 'fehem_reels_custom_v1';
const STORAGE_KEY_USER_PROFILE = 'fehem_reels_google_profile_v1';

type FeedTab = 'all' | 'following' | 'quran' | 'islamic' | 'books';

const FEED_TABS: Array<{ id: FeedTab; label: string }> = [
  { id: 'all', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'quran', label: 'Quran' },
  { id: 'islamic', label: 'Hadith' },
  { id: 'books', label: 'Books' },
];

/** A list opened from a grid (Explore, Saved, Profile), shown full-screen like Instagram's reel viewer. */
interface OpenedList {
  title: string;
  reels: MicroReel[];
  returnTo: AppTab;
}

// Vertical reel swipe animation
const reelVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0.9,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: { y: { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }, opacity: { duration: 0.2 } },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0.6,
    transition: { y: { type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }, opacity: { duration: 0.18 } },
  }),
};

export default function App() {
  // All Reels state (Curated + User Generated)
  const [allReels, setAllReels] = useState<MicroReel[]>(() => {
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_REELS) || localStorage.getItem('devmind_reels_custom_v1');
      if (savedCustom) {
        const custom = JSON.parse(savedCustom);
        return [...custom, ...CURATED_REELS];
      }
    } catch {
      // fallback
    }
    return CURATED_REELS;
  });

  // User persistent progress & interactions
  const [userData, setUserData] = useState<UserSavedData>(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_DATA) || localStorage.getItem('devmind_reels_user_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastActiveDate !== today) {
          const lastDate = new Date(parsed.lastActiveDate);
          const currentDate = new Date(today);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          const newStreak = diffDays === 1 ? (parsed.streakDays || 1) + 1 : diffDays === 0 ? parsed.streakDays : 1;
          return {
            ...parsed,
            streakDays: newStreak,
            lastActiveDate: today,
          };
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      bookmarkedIds: [],
      likedIds: [],
      completedActionIds: [],
      completedQuizzes: {},
      streakDays: 1,
      followedHandles: [],
      lastActiveDate: today,
    };
  });

  // Google User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE) || localStorage.getItem('devmind_reels_google_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [openedList, setOpenedList] = useState<OpenedList | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [sharingReel, setSharingReel] = useState<MicroReel | null>(null);

  // Focus background music state (Web Audio API synthesis)
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => focusMusic.getIsPlaying());
  const [musicTrackName, setMusicTrackName] = useState<string>(() => focusMusic.getCurrentTrack().title);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(() => focusMusic.getSoundOn());

  // Auto-play state
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  // Study panel beside the reel on large screens
  const [isDesktopStudioMode, setIsDesktopStudioMode] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : false
  );

  // Speech narration
  const speech = useSpeech();

  useEffect(() => {
    const unsubscribe = focusMusic.subscribe((track, playing) => {
      setIsMusicPlaying(playing);
      setMusicTrackName(track.title);
      setIsSoundOn(focusMusic.getSoundOn());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Save userData to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_DATA, JSON.stringify(userData));
    } catch {
      // fallback
    }
  }, [userData]);

  // Sync with backend /api/user/record when user profile is active
  const handleSyncWithServer = useCallback(async () => {
    if (!userProfile) return;
    try {
      await fetch('/api/user/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          email: userProfile.email,
          data: userData,
        }),
      });
    } catch {
      // silent sync failure
    }
  }, [userData, userProfile]);

  useEffect(() => {
    if (userProfile) {
      handleSyncWithServer();
    }
  }, [userData, userProfile, handleSyncWithServer]);

  // Handle Google Auth state changes
  const handleAuthChange = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER_PROFILE);
    }
  };

  const followedHandles = userData.followedHandles || [];

  // Reels shown in the vertical viewer: either a list opened from a grid, or the selected feed tab.
  const filteredReels = useMemo(() => {
    if (openedList) return openedList.reels;
    switch (feedTab) {
      case 'following':
        return allReels.filter((r) => followedHandles.includes(getReelCreator(r).handle));
      case 'quran':
      case 'islamic':
        return allReels.filter((r) => r.category === feedTab);
      case 'books':
        return allReels.filter((r) => !isScriptureReel(r));
      default:
        return allReels;
    }
  }, [allReels, feedTab, openedList, followedHandles]);

  // Ensure currentIndex stays within bounds
  useEffect(() => {
    if (currentIndex >= filteredReels.length) {
      setCurrentIndex(Math.max(0, filteredReels.length - 1));
    }
  }, [filteredReels.length, currentIndex]);

  const currentReel = filteredReels[currentIndex] || filteredReels[0];
  const isFeedVisible = activeTab === 'home';

  // Scroll transition direction: 1 = next (slide up), -1 = prev (slide down)
  const [scrollDirection, setScrollDirection] = useState<number>(1);

  const resetPlayback = useCallback(() => {
    speech.stop();
    setAutoPlayProgress(0);
  }, [speech]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredReels.length - 1) {
      setScrollDirection(1);
      setCurrentIndex((prev) => prev + 1);
      resetPlayback();
    }
  }, [currentIndex, filteredReels.length, resetPlayback]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setScrollDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      resetPlayback();
    }
  }, [currentIndex, resetPlayback]);

  // Vertical drag/flick between reels
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const { offset, velocity } = info;
    if (offset.y < -45 || velocity.y < -220) handleNext();
    else if (offset.y > 45 || velocity.y > 220) handlePrev();
  };

  const handleToggleMusic = () => focusMusic.toggle();

  // Each reel brings its own background sound, like the audio on an Instagram reel.
  useEffect(() => {
    if (currentReel) focusMusic.playForReel(getReelSoundtrack(currentReel));
  }, [currentReel]);

  // Sound follows the video: it pauses with the reel and when you leave the Home tab.
  useEffect(() => {
    focusMusic.setHold(!(isFeedVisible && isAutoPlay && Boolean(currentReel)));
  }, [isFeedVisible, isAutoPlay, currentReel]);
  const handleShuffleMusic = () => focusMusic.selectRandomTrack();

  // Auto-play timer: advances to the next reel when the progress line fills.
  // Pausing keeps the progress where it is, like pausing a video.
  useEffect(() => {
    if (!isAutoPlay || !isFeedVisible) return;

    const duration = (currentReel?.estimatedReadSeconds || 25) * 1000;
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setAutoPlayProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlay, isFeedVisible, currentReel, handleNext]);

  // Interactions: Like, Bookmark, Follow, Action Items, Quizzes
  const toggleInList = (list: string[], id: string) => (list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);

  const handleToggleLike = (id: string) => setUserData((prev) => ({ ...prev, likedIds: toggleInList(prev.likedIds, id) }));
  const handleToggleBookmark = (id: string) =>
    setUserData((prev) => ({ ...prev, bookmarkedIds: toggleInList(prev.bookmarkedIds, id) }));
  const handleToggleFollow = (handle: string) =>
    setUserData((prev) => ({ ...prev, followedHandles: toggleInList(prev.followedHandles || [], handle) }));
  const handleToggleActionItem = (actionKey: string) =>
    setUserData((prev) => ({ ...prev, completedActionIds: toggleInList(prev.completedActionIds, actionKey) }));
  const handleAnswerQuiz = (reelId: string, selectedIndex: number, isCorrect: boolean) => {
    setUserData((prev) => ({
      ...prev,
      completedQuizzes: { ...prev.completedQuizzes, [reelId]: { selectedIndex, isCorrect } },
    }));
  };

  // Keyboard navigation & shortcuts (feed only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFeedVisible || isAIModalOpen || isVaultOpen || isAuthModalOpen || isMusicSelectorOpen || sharingReel) return;
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMusic();
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDesktopStudioMode((prev) => !prev);
      } else if ((e.key === 'l' || e.key === 'L') && currentReel) {
        handleToggleLike(currentReel.id);
      } else if ((e.key === 's' || e.key === 'S') && currentReel) {
        setSharingReel(currentReel);
      } else if ((e.key === 'b' || e.key === 'B') && currentReel) {
        handleToggleBookmark(currentReel.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFeedVisible, isAIModalOpen, isVaultOpen, isAuthModalOpen, isMusicSelectorOpen, sharingReel, currentReel]);

  // Wheel / trackpad: one reel per gesture
  const lastWheelTimeRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    if (!isFeedVisible) return;
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 550) return;
    if (e.deltaY > 45) {
      lastWheelTimeRef.current = now;
      handleNext();
    } else if (e.deltaY < -45) {
      lastWheelTimeRef.current = now;
      handlePrev();
    }
  };

  // Navigation helpers
  const goToTab = (tab: AppTab) => {
    resetPlayback();
    if (tab === 'home' && activeTab === 'home' && !openedList) {
      // Tapping Home again jumps back to the top of the feed, like Instagram.
      setScrollDirection(-1);
      setCurrentIndex(0);
    }
    if (tab === 'home') setOpenedList(null);
    setActiveTab(tab);
  };

  const selectFeedTab = (tab: FeedTab) => {
    setScrollDirection(1);
    setFeedTab(tab);
    setOpenedList(null);
    setCurrentIndex(0);
    resetPlayback();
  };

  const openReelInList = (reel: MicroReel, list: MicroReel[], title: string) => {
    const idx = Math.max(0, list.findIndex((r) => r.id === reel.id));
    setOpenedList({ title, reels: list, returnTo: activeTab });
    setScrollDirection(1);
    setCurrentIndex(idx);
    resetPlayback();
    setIsAutoPlay(true);
    setActiveTab('home');
  };

  const closeOpenedList = () => {
    const back = openedList?.returnTo || 'home';
    setOpenedList(null);
    setCurrentIndex(0);
    resetPlayback();
    setActiveTab(back);
  };

  // When AI generates a new reel
  const handleReelGenerated = (newReel: MicroReel) => {
    setAllReels((prev) => {
      const updated = [newReel, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_REELS, JSON.stringify(updated.filter((r) => r.isUserGenerated)));
      } catch {
        // fallback
      }
      return updated;
    });
    setOpenedList(null);
    setFeedTab('all');
    setCurrentIndex(0);
    setActiveTab('home');
  };

  const handleSelectReelById = (reelId: string) => {
    const saved = allReels.filter((r) => userData.bookmarkedIds.includes(r.id));
    const reel = saved.find((r) => r.id === reelId) || allReels.find((r) => r.id === reelId);
    if (reel) openReelInList(reel, saved.includes(reel) ? saved : [reel], 'Saved');
  };

  const toggleSpeech = (text: string) => (speech.isPlaying ? speech.stop() : speech.speak(text));

  return (
    <div
      id="fehem-app-root"
      onWheel={handleWheel}
      className="w-full h-[100dvh] bg-black text-neutral-100 flex flex-col md:flex-row overflow-hidden relative selection:bg-rose-500/30"
    >
      <main className="flex-1 min-h-0 min-w-0 relative bg-[#07070b]">
        {/* HOME: full-screen vertical reels */}
        {activeTab === 'home' && (
          <div className="h-full w-full flex items-center justify-center md:gap-4 md:py-4">
            <div className="relative h-full w-full md:w-auto md:aspect-[9/16] md:max-w-[min(480px,100%)]">
              {/* Feed tabs overlay (For You / Following / Quran / Hadith / Books) */}
              <div className="absolute top-0 inset-x-0 z-30 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-black/60 to-transparent md:rounded-t-lg">
                <div className="h-14 flex items-center gap-1 px-2">
                  {openedList ? (
                    <>
                      <button
                        id="btn-close-opened-list"
                        type="button"
                        onClick={closeOpenedList}
                        className="p-2 text-white"
                        aria-label="Back"
                      >
                        <ChevronLeft className="w-7 h-7" />
                      </button>
                      <h1 className="text-lg font-extrabold text-white">{openedList.title}</h1>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 flex items-center gap-3.5 overflow-x-auto no-scrollbar px-2">
                        {FEED_TABS.map((t) => (
                          <button
                            key={t.id}
                            id={`feed-tab-${t.id}`}
                            type="button"
                            onClick={() => selectFeedTab(t.id)}
                            className={`shrink-0 text-[15px] transition-colors drop-shadow ${
                              feedTab === t.id ? 'text-white font-extrabold' : 'text-white/60 font-semibold hover:text-white/80'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMusicSelectorOpen(true)}
                        className={`hidden md:block p-2 shrink-0 ${isMusicPlaying ? 'text-rose-400' : 'text-white'}`}
                        aria-label="Focus sounds"
                        title="Focus sounds (M)"
                      >
                        <Music className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToTab('explore')}
                        className="p-2 shrink-0 text-white md:hidden"
                        aria-label="Search"
                      >
                        <Search className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {filteredReels.length === 0 || !currentReel ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8 md:rounded-lg bg-[#0b0b10]">
                  <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center mb-4">
                    {feedTab === 'following' ? <Users className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
                  </div>
                  <h2 className="text-xl font-extrabold text-white mb-1">
                    {feedTab === 'following' ? 'Follow books and channels' : 'No reels here yet'}
                  </h2>
                  <p className="text-sm text-white/60 max-w-xs mb-5">
                    {feedTab === 'following'
                      ? 'Tap Follow on any reel, for example a book you love or quran.daily, and their reels show up here.'
                      : 'Try another tab or explore topics.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => (feedTab === 'following' ? selectFeedTab('all') : goToTab('explore'))}
                    className="h-9 px-5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold"
                  >
                    {feedTab === 'following' ? 'Browse For You' : 'Explore'}
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden md:rounded-lg">
                  <AnimatePresence custom={scrollDirection} initial={false} mode="popLayout">
                    <motion.div
                      key={`${openedList?.title || feedTab}-${currentReel.id}`}
                      custom={scrollDirection}
                      variants={reelVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={0.25}
                      onDragEnd={handleDragEnd}
                      className="w-full h-full absolute inset-0 touch-pan-y select-none"
                    >
                      <ReelCard
                        reel={currentReel}
                        index={currentIndex}
                        totalReels={filteredReels.length}
                        isLiked={userData.likedIds.includes(currentReel.id)}
                        isBookmarked={userData.bookmarkedIds.includes(currentReel.id)}
                        completedActionKeys={userData.completedActionIds}
                        quizState={userData.completedQuizzes[currentReel.id]}
                        onToggleLike={handleToggleLike}
                        onToggleBookmark={handleToggleBookmark}
                        onToggleActionItem={handleToggleActionItem}
                        onAnswerQuiz={handleAnswerQuiz}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        isMusicPlaying={isMusicPlaying}
                        isSoundOn={isSoundOn}
                        onToggleMusic={handleToggleMusic}
                        onShuffleMusic={handleShuffleMusic}
                        onOpenMusicSelector={() => setIsMusicSelectorOpen(true)}
                        musicTrackName={musicTrackName}
                        isSpeechPlaying={speech.isPlaying}
                        speechRate={speech.rate}
                        onToggleSpeech={toggleSpeech}
                        onChangeSpeechRate={speech.toggleRate}
                        isAutoPlay={isAutoPlay}
                        autoPlayProgress={autoPlayProgress}
                        onToggleAutoPlay={() => setIsAutoPlay((p) => !p)}
                        onOpenShareModal={(reel) => setSharingReel(reel)}
                        isFollowing={followedHandles.includes(getReelCreator(currentReel).handle)}
                        onToggleFollow={handleToggleFollow}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Desktop: up/down arrows beside the reel, like Instagram on the web */}
            {filteredReels.length > 0 && (
              <div className="hidden md:flex flex-col gap-3 shrink-0">
                <button
                  id="btn-desktop-prev"
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-0 transition"
                  title="Previous (↑)"
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <button
                  id="btn-desktop-next"
                  type="button"
                  disabled={currentIndex === filteredReels.length - 1}
                  onClick={handleNext}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-0 transition"
                  title="Next (↓)"
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Large screens: optional study panel next to the reel */}
            {isDesktopStudioMode && currentReel && (
              <div className="hidden lg:block shrink-0 h-full overflow-y-auto no-scrollbar">
                <DesktopCompanionDeck
                  reel={currentReel}
                  isLiked={userData.likedIds.includes(currentReel.id)}
                  isBookmarked={userData.bookmarkedIds.includes(currentReel.id)}
                  completedActionKeys={userData.completedActionIds}
                  quizState={userData.completedQuizzes[currentReel.id]}
                  onToggleLike={handleToggleLike}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleActionItem={handleToggleActionItem}
                  onAnswerQuiz={handleAnswerQuiz}
                  onOpenShareModal={(reel) => setSharingReel(reel)}
                  isSpeechPlaying={speech.isPlaying}
                  onToggleSpeech={toggleSpeech}
                  isMusicPlaying={isMusicPlaying}
                  onToggleMusic={handleToggleMusic}
                  musicTrackName={musicTrackName}
                  onCloseCompanionDeck={() => setIsDesktopStudioMode(false)}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="h-full max-w-4xl mx-auto">
            <ExploreView reels={allReels} onSelectReel={(r, list) => openReelInList(r, list, 'Explore')} />
          </div>
        )}

        {activeTab === 'saved' && (
          <SavedView
            reels={allReels}
            userData={userData}
            onSelectReel={(r, list) => openReelInList(r, list, 'Saved')}
            onOpenVault={() => setIsVaultOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            reels={allReels}
            userData={userData}
            userProfile={userProfile}
            onSelectReel={(r, list) => openReelInList(r, list, 'Profile')}
            onOpenAccount={() => setIsAuthModalOpen(true)}
            onOpenVault={() => setIsVaultOpen(true)}
            onOpenSounds={() => setIsMusicSelectorOpen(true)}
            onToggleFollow={handleToggleFollow}
            isStudyPanelOn={isDesktopStudioMode}
            onToggleStudyPanel={() => setIsDesktopStudioMode((p) => !p)}
          />
        )}
      </main>

      <AppNav
        active={activeTab}
        onChange={goToTab}
        onCreate={() => setIsAIModalOpen(true)}
        userProfile={userProfile}
        savedCount={userData.bookmarkedIds.length}
      />

      <FocusMusicSelector isOpen={isMusicSelectorOpen} onClose={() => setIsMusicSelectorOpen(false)} />

      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        userData={userData}
        onSignInWithGoogle={(profile) => handleAuthChange(profile)}
        onSignOut={() => handleAuthChange(null)}
        onSyncData={handleSyncWithServer}
        onAuthChange={handleAuthChange}
      />

      <ShareReelModal isOpen={Boolean(sharingReel)} reel={sharingReel} onClose={() => setSharingReel(null)} />

      <AIGeneratorModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onReelGenerated={handleReelGenerated} />

      <KnowledgeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        allReels={allReels}
        userData={userData}
        onSelectReel={(id) => {
          setIsVaultOpen(false);
          handleSelectReelById(id);
        }}
        onRemoveBookmark={handleToggleBookmark}
      />
    </div>
  );
}
