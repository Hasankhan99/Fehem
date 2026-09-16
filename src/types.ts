export type Category =
  | 'all'
  | 'islamic'
  | 'psychology'
  | 'habits'
  | 'mindset'
  | 'productivity'
  | 'communication'
  | 'books'
  | 'programming'
  | 'system-design'
  | 'habits-mindset';

export interface CodeSnippet {
  language: string;
  title: string;
  code: string;
  explanation: string;
  badCode?: string;
}

export interface MentalModel {
  name: string;
  description: string;
  formulaOrRule?: string;
}

export interface TakeawayItem {
  point: string;
  detail: string;
  isActionable: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReelSource {
  name: string;
  authorOrTopic: string;
  tag: string;
}

export interface QuotePhase {
  phase: number; // 0, 1, 2
  text: string;
  emphasis?: string;
  stepLabel?: string;
}

export type ConceptVisualType =
  | 'compounding-curve'
  | 'habit-loop'
  | 'system1-system2'
  | 'stimulus-response-gap'
  | 'eisenhower-matrix'
  | 'growth-mindset'
  | 'deep-work-funnel'
  | 'tactical-empathy'
  | 'dichotomy-of-control'
  | 'eat-that-frog'
  | 'grit-equation'
  | 'crucial-conversations'
  | 'domino-effect'
  | 'ikigai'
  | 'essentialism-filter'
  | 'psychology-money'
  | 'power-of-now'
  | 'mountain-is-you'
  | 'daring-greatly'
  | 'subtle-art-values'
  | 'win-friends'
  | 'gtd-workflow'
  | 'event-loop'
  | 'btree-index'
  | 'cap-theorem'
  | 'clean-code-modular'
  | 'docker-containers'
  | 'default-soundwave-zen'
  | 'none';

export interface MicroReel {
  id: string;
  title: string;
  subtitle: string;
  category: 'islamic' | 'psychology' | 'habits' | 'mindset' | 'productivity' | 'communication' | 'books' | 'programming' | 'system-design' | 'habits-mindset';
  source: ReelSource;
  coreIdea: string;
  quoteAuthor?: string;
  quotePhases?: QuotePhase[];
  estimatedReadSeconds: number;
  takeaways: TakeawayItem[];
  codeSnippet?: CodeSnippet;
  mentalModel?: MentalModel;
  immediateActionChallenge: string;
  quiz: QuizQuestion;
  tags: string[];
  likesCount: number;
  audioScript: string;
  isUserGenerated?: boolean;
  accentColor?: string;
  visualConceptType?: ConceptVisualType;
  conceptAnimationLabel?: string;
  hadithReference?: string;
  arabicText?: string;
  narrator?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'guest';
  syncedAt?: string;
}

export interface UserSavedData {
  bookmarkedIds: string[];
  likedIds: string[];
  completedActionIds: string[]; // `${reelId}-${takeawayIndex}`
  completedQuizzes: Record<string, { selectedIndex: number; isCorrect: boolean }>;
  streakDays: number;
  lastActiveDate: string;
  userProfile?: UserProfile;
}

export interface FocusTrack {
  id: string;
  title: string;
  category: string;
  bpm: number;
  description: string;
  mood: string;
  isCustomUploaded?: boolean;
  audioUrl?: string;
  fileSize?: number;
  duration?: number;
  uploadedAt?: number;
}
