import { MicroReel } from '../../types';
import { BATCH_1_REELS } from './batch1';
import { BATCH_2_REELS } from './batch2';
import { BATCH_3_REELS } from './batch3';
import { BATCH_4_REELS } from './batch4';
import { BATCH_5_REELS } from './batch5';
import { ISLAMIC_REELS_BATCH_1 } from './islamicBatch1';
import { ISLAMIC_REELS_BATCH_2 } from './islamicBatch2';
import { ISLAMIC_REELS_BATCH_3 } from './islamicBatch3';

export const ALL_ISLAMIC_REELS: MicroReel[] = [
  ...ISLAMIC_REELS_BATCH_1,
  ...ISLAMIC_REELS_BATCH_2,
  ...ISLAMIC_REELS_BATCH_3,
];

export const ALL_CURATED_REELS: MicroReel[] = [
  ...ALL_ISLAMIC_REELS, // 55 authentic Hadith quotes with references
  ...BATCH_1_REELS, // Reels 1-20 (Atomic Habits, etc.)
  ...BATCH_2_REELS, // Reels 21-40 (Deep Work, etc.)
  ...BATCH_3_REELS, // Reels 41-60 (7 Habits, etc.)
  ...BATCH_4_REELS, // Reels 61-80 (Eat That Frog, etc.)
  ...BATCH_5_REELS, // Reels 81-100 (Power of Habit, etc.)
];

export {
  BATCH_1_REELS,
  BATCH_2_REELS,
  BATCH_3_REELS,
  BATCH_4_REELS,
  BATCH_5_REELS,
  ISLAMIC_REELS_BATCH_1,
  ISLAMIC_REELS_BATCH_2,
  ISLAMIC_REELS_BATCH_3,
};

