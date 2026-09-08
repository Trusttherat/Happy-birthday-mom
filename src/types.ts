export type PageId = 'landing' | 'about' | 'timeline' | 'gallery' | 'treasures' | 'alpha';

export interface AboutCard {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  iconName: string;
  tag: string;
}

export interface MomFavorite {
  id: string;
  title: string;
  category: string;
  iconName: string;
  shortDescription: string;
  revealedDetail: string;
  revealedImageUrl?: string;
  funFact?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl?: string;
  tag?: string;
  quote?: string;
}

export interface GalleryPhoto {
  id: string;
  category: 'past' | 'today';
  url: string;
  title: string;
  caption: string;
  year?: string;
}

export interface TreasureItem {
  id: string;
  title: string;
  content: string;
  extra?: string;
}

export interface MomTreasuresData {
  jokes: TreasureItem[];
  childhoodMemories: TreasureItem[];
  catchphrases: TreasureItem[];
  favoriteFoods: TreasureItem[];
  cherishedLessons: TreasureItem[];
}

export interface WordFromAlphaData {
  title: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  date: string;
  scrollSpeed: number; // pixels per second or duration multiplier
}

export interface AppConfig {
  adminPasswordHash: string; // or plain string for user ease
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  description: string;
  durationEstimate?: string;
}
