import { FocusTrack } from '../types';

const DB_NAME = 'devmind_audio_db';
const STORE_NAME = 'custom_soundtracks';
const DB_VERSION = 1;

interface StoredAudioRecord {
  id: string;
  title: string;
  category: string;
  bpm: number;
  description: string;
  mood: string;
  isCustomUploaded: boolean;
  fileSize: number;
  uploadedAt: number;
  blob: Blob;
  mimeType: string;
}

// In-memory cache of object URLs so we don't leak URLs or recreate constantly
const objectUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save user uploaded audio file to IndexedDB
 */
export async function saveCustomTrack(file: File): Promise<FocusTrack> {
  const db = await openDatabase();
  const id = `custom-track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  // Clean title from filename
  const cleanTitle = file.name
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/[-_]/g, ' ')
    .trim() || 'Custom Soundtrack';

  const record: StoredAudioRecord = {
    id,
    title: cleanTitle,
    category: 'My Uploads',
    bpm: 0,
    description: `Uploaded audio: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    mood: 'User Uploaded Ambient',
    isCustomUploaded: true,
    fileSize: file.size,
    uploadedAt: Date.now(),
    blob: file,
    mimeType: file.type || 'audio/mpeg',
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const audioUrl = URL.createObjectURL(file);
  objectUrlCache.set(id, audioUrl);

  return {
    id: record.id,
    title: record.title,
    category: record.category,
    bpm: record.bpm,
    description: record.description,
    mood: record.mood,
    isCustomUploaded: true,
    audioUrl,
    fileSize: record.fileSize,
    uploadedAt: record.uploadedAt,
  };
}

/**
 * Load all custom tracks from IndexedDB
 */
export async function loadCustomTracks(): Promise<FocusTrack[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result as StoredAudioRecord[];
        const tracks: FocusTrack[] = records.map((rec) => {
          let audioUrl = objectUrlCache.get(rec.id);
          if (!audioUrl) {
            audioUrl = URL.createObjectURL(rec.blob);
            objectUrlCache.set(rec.id, audioUrl);
          }
          return {
            id: rec.id,
            title: rec.title,
            category: rec.category,
            bpm: rec.bpm,
            description: rec.description,
            mood: rec.mood,
            isCustomUploaded: true,
            audioUrl,
            fileSize: rec.fileSize,
            uploadedAt: rec.uploadedAt,
          };
        });
        resolve(tracks);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not load custom tracks from IndexedDB:', err);
    return [];
  }
}

/**
 * Delete a custom track by ID
 */
export async function deleteCustomTrack(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const existingUrl = objectUrlCache.get(id);
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      objectUrlCache.delete(id);
    }
  } catch (err) {
    console.error('Failed to delete custom track:', err);
  }
}
