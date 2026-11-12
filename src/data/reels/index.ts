import { MicroReel } from '../../types';
import { BATCH_1_REELS } from './batch1';
import { BATCH_2_REELS } from './batch2';
import { BATCH_3_REELS } from './batch3';
import { BATCH_4_REELS } from './batch4';
import { BATCH_5_REELS } from './batch5';
import { BATCH_6_REELS } from './booksBatch6';
import { ISLAMIC_REELS_BATCH_1 } from './islamicBatch1';
import { ISLAMIC_REELS_BATCH_2 } from './islamicBatch2';
import { ISLAMIC_REELS_BATCH_3 } from './islamicBatch3';
import { QURAN_REELS_BATCH_1 } from './quranBatch1';

export const ALL_ISLAMIC_REELS: MicroReel[] = [
  ...ISLAMIC_REELS_BATCH_1,
  ...ISLAMIC_REELS_BATCH_2,
  ...ISLAMIC_REELS_BATCH_3,
];

export const ALL_QURAN_REELS: MicroReel[] = [...QURAN_REELS_BATCH_1];

export const ALL_BOOK_REELS: MicroReel[] = [
  ...BATCH_1_REELS, // Reels 1-20 (Atomic Habits, etc.)
  ...BATCH_6_REELS, // Rich Dad Poor Dad, Dopamine Nation
  ...BATCH_2_REELS, // Reels 21-40 (Deep Work, etc.)
  ...BATCH_3_REELS, // Reels 41-60 (7 Habits, etc.)
  ...BATCH_4_REELS, // Reels 61-80 (Eat That Frog, etc.)
  ...BATCH_5_REELS, // Reels 81-100 (Power of Habit, etc.)
];

/**
 * Builds the "For You" feed so it feels like a real social feed instead of
 * long runs of one type: a Quran verse, then a book insight, then a hadith,
 * then another book insight, repeating. Whatever is left over is appended.
 */
function interleaveFeed(quran: MicroReel[], hadith: MicroReel[], books: MicroReel[]): MicroReel[] {
  const pattern: MicroReel[][] = [quran, books, hadith, books];
  const cursors = new Map<MicroReel[], number>([[quran, 0], [hadith, 0], [books, 0]]);
  const feed: MicroReel[] = [];
  const total = quran.length + hadith.length + books.length;
  let step = 0;
  while (feed.length < total) {
    const source = pattern[step % pattern.length];
    step++;
    const i = cursors.get(source)!;
    if (i < source.length) {
      feed.push(source[i]);
      cursors.set(source, i + 1);
    } else if ([quran, hadith, books].every((s) => cursors.get(s)! >= s.length)) {
      break;
    }
  }
  return feed;
}

export const ALL_CURATED_REELS: MicroReel[] = interleaveFeed(ALL_QURAN_REELS, ALL_ISLAMIC_REELS, ALL_BOOK_REELS);

export {
  BATCH_1_REELS,
  BATCH_2_REELS,
  BATCH_3_REELS,
  BATCH_4_REELS,
  BATCH_5_REELS,
  BATCH_6_REELS,
  ISLAMIC_REELS_BATCH_1,
  ISLAMIC_REELS_BATCH_2,
  ISLAMIC_REELS_BATCH_3,
  QURAN_REELS_BATCH_1,
};
