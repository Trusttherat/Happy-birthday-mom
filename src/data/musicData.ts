import { MusicTrack } from '../types';

export const HEARTFELT_TRACKS: MusicTrack[] = [
  {
    id: 'chopin-nocturne',
    title: 'Nocturne in E-Flat Major, Op. 9 No. 2',
    artist: 'Frédéric Chopin',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Nocturne_in_E_flat_major%2C_Op._9_no._2.mp3',
    description: 'Tender, heartfelt solo romantic piano — a timeless expression of devotion.',
    durationEstimate: '4:15',
  },
  {
    id: 'pachelbel-canon',
    title: 'Canon in D Major',
    artist: 'Johann Pachelbel (arr. Kevin MacLeod)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Canon_in_D_Major_%28ISRC_USUAN1100301%29.mp3',
    description: 'Warm, uplifting strings and keyboard celebrating love and family milestones.',
    durationEstimate: '5:30',
  },
  {
    id: 'satie-gymnopedie',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie (arr. Kevin MacLeod)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Gymnopedie_No._1_%28ISRC_USUAN1100787%29.mp3',
    description: 'Serene, tender, meditative classical piano celebrating quiet gratitude.',
    durationEstimate: '3:05',
  },
  {
    id: 'ambient-piano',
    title: 'Heartfelt Birthday Lullaby (Ambient Piano)',
    artist: 'Pure Heart Acoustic Synth',
    url: 'synthetic',
    description: 'A gentle, peaceful generative piano arpeggio synthesized live with Web Audio.',
    durationEstimate: 'Continuous Loop',
  },
];

export const DEFAULT_TRACK = HEARTFELT_TRACKS[0];
