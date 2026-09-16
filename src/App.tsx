import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CURATED_REELS } from './data/curatedReels';
import { MicroReel, Category, UserSavedData, UserProfile } from './types';
import { HeaderNav } from './components/HeaderNav';
import { ReelCard } from './components/ReelCard';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { KnowledgeVaultModal } from './components/KnowledgeVaultModal';
import { SearchModal } from './components/SearchModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ShareReelModal } from './components/ShareReelModal';
import { FocusMusicSelector } from './components/FocusMusicSelector';
import { DesktopCompanionDeck } from './components/DesktopCompanionDeck';
import { useSpeech } from './utils/useSpeech';
import { focusMusic } from './utils/focusMusicEngine';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY_USER_DATA = 'fehem_reels_user_data_v1';
const STORAGE_KEY_CUSTOM_REELS = 'fehem_reels_custom_v1';
const STORAGE_KEY_USER_PROFILE = 'fehem_reels_google_profile_v1';

// Vertical scroll animation variants (Instagram Reels Clone)
const reelVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0.85,
    scale: 0.97,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      y: { type: 'spring', stiffness: 350, damping: 32, mass: 0.8 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.22 },
    },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0.4,
    scale: 0.95,
    transition: {
      y: { type: 'spring', stiffness: 350, damping: 32, mass: 0.8 },
      opacity: { duration: 0.18 },
      scale: { duration: 0.22 },
    },
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
      bookmarkedIds: ['reel-atomic-habits', 'reel-js-event-loop', 'reel-ikigai'],
      likedIds: [],
      completedActionIds: [],
      completedQuizzes: {},
      streakDays: 3,
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

  // Navigation & Filter state
  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [sharingReel, setSharingReel] = useState<MicroReel | null>(null);

  // Focus background music state (Web Audio API synthesis)
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => focusMusic.getIsPlaying());
  const [musicTrackName, setMusicTrackName] = useState<string>(() => focusMusic.getCurrentTrack().title);

  // Auto-play state
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);

  // Desktop Studio Companion Mode (Split view on large screens)
  const [isDesktopStudioMode, setIsDesktopStudioMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Speech narration
  const speech = useSpeech();

  // Subscribe to Focus Music Engine changes
  useEffect(() => {
    const unsubscribe = focusMusic.subscribe((track, playing) => {
      setIsMusicPlaying(playing);
      setMusicTrackName(track.title);
    });
    return unsubscribe;
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

  // Filtered Reels based on selected category
  const filteredReels = useMemo(() => {
    if (currentCategory === 'all') return allReels;
    return allReels.filter((r) => r.category === currentCategory);
  }, [allReels, currentCategory]);

  // Ensure currentIndex stays within bounds
  useEffect(() => {
    if (currentIndex >= filteredReels.length) {
      setCurrentIndex(Math.max(0, filteredReels.length - 1));
    }
  }, [filteredReels.length, currentIndex]);

  const currentReel = filteredReels[currentIndex] || filteredReels[0];

  // Scroll transition direction: 1 = next (slide up), -1 = prev (slide down)
  const [scrollDirection, setScrollDirection] = useState<number>(1);

  // Navigation Handlers
  const handleNext = useCallback(() => {
    if (currentIndex < filteredReels.length - 1) {
      setScrollDirection(1);
      setCurrentIndex((prev) => prev + 1);
      speech.stop();
      setAutoPlayProgress(0);
    }
  }, [currentIndex, filteredReels.length, speech]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setScrollDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      speech.stop();
      setAutoPlayProgress(0);
    }
  }, [currentIndex, speech]);

  // Handle interactive vertical drag gestures (Instagram Reels drag flick)
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const { offset, velocity } = info;
    const swipeThreshold = 45;
    const velocityThreshold = 220;

    if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
      if (currentIndex < filteredReels.length - 1) {
        handleNext();
      }
    } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
      if (currentIndex > 0) {
        handlePrev();
      }
    }
  };

  // Toggle Focus Background Music
  const handleToggleMusic = () => {
    focusMusic.toggle();
  };

  // Random focus track selection
  const handleShuffleMusic = () => {
    focusMusic.selectRandomTrack();
  };

  // Auto-play timer effect (segmented reel progress)
  useEffect(() => {
    if (!isAutoPlay) {
      setAutoPlayProgress(0);
      return;
    }

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
  }, [isAutoPlay, currentReel, handleNext]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAIModalOpen || isVaultOpen || isSearchOpen || isAuthModalOpen || isMusicSelectorOpen || sharingReel) {
        return;
      }
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
        e.preventDefault();
        handleToggleMusic();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleShuffleMusic();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsDesktopStudioMode((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentReel) {
          e.preventDefault();
          handleToggleLike(currentReel.id);
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (currentReel) {
          e.preventDefault();
          setSharingReel(currentReel);
        }
      } else if (e.key === 'b' || e.key === 'B') {
        if (currentReel) {
          handleToggleBookmark(currentReel.id);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isAIModalOpen, isVaultOpen, isSearchOpen, isAuthModalOpen, isMusicSelectorOpen, sharingReel, currentReel]);

  // Wheel debounce for vertical trackpad/mouse swipe
  const lastWheelTimeRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
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

  // Interactions: Like, Bookmark, Action Items, Quizzes
  const handleToggleLike = (id: string) => {
    setUserData((prev) => {
      const isLiked = prev.likedIds.includes(id);
      return {
        ...prev,
        likedIds: isLiked ? prev.likedIds.filter((i) => i !== id) : [...prev.likedIds, id],
      };
    });
  };

  const handleToggleBookmark = (id: string) => {
    setUserData((prev) => {
      const isBookmarked = prev.bookmarkedIds.includes(id);
      return {
        ...prev,
        bookmarkedIds: isBookmarked ? prev.bookmarkedIds.filter((i) => i !== id) : [...prev.bookmarkedIds, id],
      };
    });
  };

  const handleToggleActionItem = (actionKey: string) => {
    setUserData((prev) => {
      const isCompleted = prev.completedActionIds.includes(actionKey);
      return {
        ...prev,
        completedActionIds: isCompleted
          ? prev.completedActionIds.filter((k) => k !== actionKey)
          : [...prev.completedActionIds, actionKey],
      };
    });
  };

  const handleAnswerQuiz = (reelId: string, selectedIndex: number, isCorrect: boolean) => {
    setUserData((prev) => ({
      ...prev,
      completedQuizzes: {
        ...prev.completedQuizzes,
        [reelId]: { selectedIndex, isCorrect },
      },
    }));
  };

  // When AI generates a new reel
  const handleReelGenerated = (newReel: MicroReel) => {
    setAllReels((prev) => {
      const updated = [newReel, ...prev];
      try {
        const customOnly = updated.filter((r) => r.isUserGenerated);
        localStorage.setItem(STORAGE_KEY_CUSTOM_REELS, JSON.stringify(customOnly));
      } catch {
        // fallback
      }
      return updated;
    });

    setCurrentCategory('all');
    setCurrentIndex(0);
  };

  const handleSelectReelById = (reelId: string) => {
    setCurrentCategory('all');
    const targetIdx = allReels.findIndex((r) => r.id === reelId);
    if (targetIdx !== -1) {
      setScrollDirection(targetIdx >= currentIndex ? 1 : -1);
      setCurrentIndex(targetIdx);
      speech.stop();
      setAutoPlayProgress(0);
    }
  };

  return (
    <div
      id="fehem-app-root"
      onWheel={handleWheel}
      className="w-full h-[100dvh] max-h-[100dvh] bg-[#07070b] text-neutral-100 flex flex-col justify-between overflow-hidden relative selection:bg-rose-500/30 safe-top safe-bottom"
    >
      {/* Atmospheric lighting mesh in background (Instagram aura + glass gradient) */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[550px] bg-gradient-to-tr from-purple-700/15 via-rose-600/15 to-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-10 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Sleek, Simplified Instagram-style Glass Header */}
      <HeaderNav
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setScrollDirection(1);
          setCurrentCategory(cat);
          setCurrentIndex(0);
          speech.stop();
          setAutoPlayProgress(0);
        }}
        onOpenAIGenerator={() => setIsAIModalOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        vaultCount={userData.bookmarkedIds.length}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
        onOpenMusicSelector={() => setIsMusicSelectorOpen(true)}
        currentTrackName={musicTrackName}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isDesktopStudioMode={isDesktopStudioMode}
        onToggleDesktopStudioMode={() => setIsDesktopStudioMode((prev) => !prev)}
      />

      {/* Center Reel Canvas & Desktop Studio Deck */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center p-0 sm:px-4 sm:py-2 overflow-hidden relative h-[100dvh] sm:h-auto">
        <div className="w-full flex items-center justify-center h-full relative">
          {filteredReels.length === 0 ? (
            <div className="p-8 rounded-3xl glass-panel text-center max-w-sm space-y-3">
              <Sparkles className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No reels here yet</h3>
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs shadow-lg"
              >
                Generate with AI
              </button>
            </div>
          ) : (
            currentReel && (
              <div className="relative flex items-center justify-center w-full h-full sm:h-auto max-w-full">
                {/* Reels Stage with Vertical Slide Animation & Drag Gestures */}
                <div
                  className={`relative w-full h-full sm:h-[calc(100dvh-4.2rem)] sm:max-h-[940px] flex items-center justify-center overflow-hidden transition-all duration-300 ${
                    isDesktopStudioMode
                      ? 'sm:max-w-[480px] md:max-w-[500px] lg:max-w-[520px] xl:max-w-[540px]'
                      : 'sm:max-w-[520px] md:max-w-[580px] lg:max-w-[640px] xl:max-w-[680px]'
                  }`}
                >
                  <AnimatePresence custom={scrollDirection} initial={false} mode="popLayout">
                    <motion.div
                      key={currentReel.id}
                      custom={scrollDirection}
                      variants={reelVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={0.25}
                      onDragEnd={handleDragEnd}
                      className="w-full h-full absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y select-none"
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
                        onToggleMusic={handleToggleMusic}
                        onShuffleMusic={handleShuffleMusic}
                        onOpenMusicSelector={() => setIsMusicSelectorOpen(true)}
                        musicTrackName={musicTrackName}
                        isSpeechPlaying={speech.isPlaying}
                        speechRate={speech.rate}
                        onToggleSpeech={(text) => {
                          if (speech.isPlaying) {
                            speech.stop();
                          } else {
                            speech.speak(text);
                          }
                        }}
                        onChangeSpeechRate={speech.toggleRate}
                        isAutoPlay={isAutoPlay}
                        autoPlayProgress={autoPlayProgress}
                        onOpenShareModal={(reel) => setSharingReel(reel)}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Minimal desktop navigation buttons on right */}
                <div className="hidden md:flex flex-col items-center space-y-2 ml-3 xl:ml-4 shrink-0">
                  <button
                    id="btn-desktop-prev"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 shadow-md"
                    title="Previous Reel (Up Arrow / k)"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>

                  <div className="text-[10px] font-mono text-white/50 font-bold py-1">
                    {currentIndex + 1}/{filteredReels.length}
                  </div>

                  <button
                    id="btn-desktop-next"
                    disabled={currentIndex === filteredReels.length - 1}
                    onClick={handleNext}
                    className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all active:scale-90 shadow-md"
                    title="Next Reel (Down Arrow / j)"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Desktop Studio Companion Deck (Split View for large screens) */}
                {isDesktopStudioMode && currentReel && (
                  <div className="hidden lg:block ml-4 xl:ml-6 shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
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
                      onToggleSpeech={(text) => {
                        if (speech.isPlaying) {
                          speech.stop();
                        } else {
                          speech.speak(text);
                        }
                      }}
                      isMusicPlaying={isMusicPlaying}
                      onToggleMusic={handleToggleMusic}
                      musicTrackName={musicTrackName}
                      onCloseCompanionDeck={() => setIsDesktopStudioMode(false)}
                    />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>

      {/* Desktop Keyboard Shortcuts Helper Footer */}
      <footer className="hidden md:flex items-center justify-center space-x-3 text-[10px] font-mono text-white/40 pb-1.5 shrink-0 z-10 select-none">
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">↓</kbd> Scroll</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Space</kbd> {isAutoPlay ? 'Pause' : 'Play'}</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">L</kbd> Like</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">B</kbd> Vault</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">M</kbd> Audio</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">S</kbd> Share</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">D</kbd> Studio</span>
      </footer>

      {/* Mobile Swipe / Index Indicator */}
      <div className="sm:hidden fixed bottom-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-2.5 py-0.5 rounded-full glass-pill bg-neutral-950/80 border border-white/15 text-[9px] font-mono text-white/60 flex items-center space-x-1.5 shadow-lg">
        <span>Reel {currentIndex + 1}/{filteredReels.length}</span>
        <span className="text-white/30">•</span>
        <span>Swipe ↑ / ↓</span>
      </div>

      {/* Focus Music Soundscape Selector Drawer Modal */}
      <FocusMusicSelector
        isOpen={isMusicSelectorOpen}
        onClose={() => setIsMusicSelectorOpen(false)}
      />

      {/* Google Authentication & Progress Tracking Modal */}
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

      {/* Instagram-Style Reel Share Modal */}
      <ShareReelModal
        isOpen={Boolean(sharingReel)}
        reel={sharingReel}
        onClose={() => setSharingReel(null)}
      />

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onReelGenerated={handleReelGenerated}
      />

      {/* Saved Knowledge Vault Modal */}
      <KnowledgeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        allReels={allReels}
        userData={userData}
        onSelectReel={handleSelectReelById}
        onRemoveBookmark={handleToggleBookmark}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        reels={allReels}
        onSelectReel={handleSelectReelById}
      />
    </div>
  );
}
