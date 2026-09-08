import { AboutCard, GalleryPhoto, MomTreasuresData, WordFromAlphaData, MomFavorite, TimelineEvent } from '../types';
import { DEFAULT_ABOUT_CARDS, DEFAULT_PHOTOS, DEFAULT_TREASURES, DEFAULT_ALPHA_LETTER, DEFAULT_FAVORITES, DEFAULT_TIMELINE_EVENTS } from '../data/defaultData';

const STORAGE_KEYS = {
  ABOUT_CARDS: 'bday_about_cards_v1',
  FAVORITES: 'bday_favorites_v1',
  TIMELINE: 'bday_timeline_v1',
  PHOTOS: 'bday_photos_v1',
  TREASURES: 'bday_treasures_v1',
  ALPHA_LETTER: 'bday_alpha_letter_v1',
  ADMIN_PASSWORD: 'bday_admin_password_v1',
  IS_ADMIN: 'bday_is_admin_v1',
  MUSIC_VOLUME: 'bday_music_volume_v1',
  MUSIC_TRACK_ID: 'bday_music_track_id_v1',
};

const DEFAULT_PASSWORD = 'alpha';

// Resilient memory cache fallback if localStorage is disabled or throws SecurityError
const memoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // fallback to memoryStore
  }
  return memoryStore.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // fallback to memoryStore
  }
  memoryStore.set(key, value);
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // fallback to memoryStore
  }
  memoryStore.delete(key);
}

export const storage = {
  getAboutCards(): AboutCard[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.ABOUT_CARDS);
      return data ? JSON.parse(data) : DEFAULT_ABOUT_CARDS;
    } catch {
      return DEFAULT_ABOUT_CARDS;
    }
  },
  saveAboutCards(cards: AboutCard[]): void {
    try {
      safeSetItem(STORAGE_KEYS.ABOUT_CARDS, JSON.stringify(cards));
    } catch {
      // ignore
    }
  },

  getFavorites(): MomFavorite[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : DEFAULT_FAVORITES;
    } catch {
      return DEFAULT_FAVORITES;
    }
  },
  saveFavorites(favorites: MomFavorite[]): void {
    try {
      safeSetItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  },

  getTimelineEvents(): TimelineEvent[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.TIMELINE);
      return data ? JSON.parse(data) : DEFAULT_TIMELINE_EVENTS;
    } catch {
      return DEFAULT_TIMELINE_EVENTS;
    }
  },
  saveTimelineEvents(events: TimelineEvent[]): void {
    try {
      safeSetItem(STORAGE_KEYS.TIMELINE, JSON.stringify(events));
    } catch {
      // ignore
    }
  },

  getPhotos(): GalleryPhoto[] {
    try {
      const data = safeGetItem(STORAGE_KEYS.PHOTOS);
      return data ? JSON.parse(data) : DEFAULT_PHOTOS;
    } catch {
      return DEFAULT_PHOTOS;
    }
  },
  savePhotos(photos: GalleryPhoto[]): void {
    try {
      safeSetItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    } catch {
      // ignore
    }
  },

  getTreasures(): MomTreasuresData {
    try {
      const data = safeGetItem(STORAGE_KEYS.TREASURES);
      return data ? JSON.parse(data) : DEFAULT_TREASURES;
    } catch {
      return DEFAULT_TREASURES;
    }
  },
  saveTreasures(treasures: MomTreasuresData): void {
    try {
      safeSetItem(STORAGE_KEYS.TREASURES, JSON.stringify(treasures));
    } catch {
      // ignore
    }
  },

  getAlphaLetter(): WordFromAlphaData {
    try {
      const data = safeGetItem(STORAGE_KEYS.ALPHA_LETTER);
      return data ? JSON.parse(data) : DEFAULT_ALPHA_LETTER;
    } catch {
      return DEFAULT_ALPHA_LETTER;
    }
  },
  saveAlphaLetter(letter: WordFromAlphaData): void {
    try {
      safeSetItem(STORAGE_KEYS.ALPHA_LETTER, JSON.stringify(letter));
    } catch {
      // ignore
    }
  },

  getAdminPassword(): string {
    try {
      return safeGetItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_PASSWORD;
    } catch {
      return DEFAULT_PASSWORD;
    }
  },
  saveAdminPassword(password: string): void {
    try {
      safeSetItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
    } catch {
      // ignore
    }
  },

  getMusicVolume(): number {
    try {
      const val = safeGetItem(STORAGE_KEYS.MUSIC_VOLUME);
      if (val !== null) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
      return 0.6; // default 60% volume
    } catch {
      return 0.6;
    }
  },
  saveMusicVolume(volume: number): void {
    try {
      const clamped = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0.6));
      safeSetItem(STORAGE_KEYS.MUSIC_VOLUME, clamped.toString());
    } catch {
      // ignore
    }
  },

  getMusicTrackId(): string {
    try {
      return safeGetItem(STORAGE_KEYS.MUSIC_TRACK_ID) || 'chopin-nocturne';
    } catch {
      return 'chopin-nocturne';
    }
  },
  saveMusicTrackId(id: string): void {
    try {
      safeSetItem(STORAGE_KEYS.MUSIC_TRACK_ID, id);
    } catch {
      // ignore
    }
  },

  resetAllToDefault(): void {
    try {
      safeRemoveItem(STORAGE_KEYS.ABOUT_CARDS);
      safeRemoveItem(STORAGE_KEYS.FAVORITES);
      safeRemoveItem(STORAGE_KEYS.TIMELINE);
      safeRemoveItem(STORAGE_KEYS.PHOTOS);
      safeRemoveItem(STORAGE_KEYS.TREASURES);
      safeRemoveItem(STORAGE_KEYS.ALPHA_LETTER);
      safeRemoveItem(STORAGE_KEYS.ADMIN_PASSWORD);
    } catch {
      // ignore
    }
  }
};
