import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PageId,
  AboutCard,
  GalleryPhoto,
  MomTreasuresData,
  WordFromAlphaData,
  MomFavorite,
  TimelineEvent,
} from './types';
import { storage } from './utils/storage';
import { SidebarNav } from './components/SidebarNav';
import { FloatingParticles } from './components/FloatingParticles';
import { AdminModal } from './components/AdminModal';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { LandingPage } from './pages/LandingPage';
import { AboutMomPage } from './pages/AboutMomPage';
import { TimelinePage } from './pages/TimelinePage';
import { PhotoGalleryPage } from './pages/PhotoGalleryPage';
import { TreasuresPage } from './pages/TreasuresPage';
import { WordFromAlphaPage } from './pages/WordFromAlphaPage';
import {
  DEFAULT_ABOUT_CARDS,
  DEFAULT_PHOTOS,
  DEFAULT_TREASURES,
  DEFAULT_ALPHA_LETTER,
  DEFAULT_FAVORITES,
  DEFAULT_TIMELINE_EVENTS,
} from './data/defaultData';
import { Unlock } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Dynamic Content Data (Persisted with safe fallback)
  const [aboutCards, setAboutCards] = useState<AboutCard[]>(() => storage.getAboutCards());
  const [favorites, setFavorites] = useState<MomFavorite[]>(() => storage.getFavorites());
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => storage.getTimelineEvents());
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => storage.getPhotos());
  const [treasures, setTreasures] = useState<MomTreasuresData>(() => storage.getTreasures());
  const [alphaLetter, setAlphaLetter] = useState<WordFromAlphaData>(() => storage.getAlphaLetter());

  // Reset to original defaults
  const handleResetDefaults = () => {
    storage.resetAllToDefault();
    setAboutCards(DEFAULT_ABOUT_CARDS);
    setFavorites(DEFAULT_FAVORITES);
    setTimelineEvents(DEFAULT_TIMELINE_EVENTS);
    setPhotos(DEFAULT_PHOTOS);
    setTreasures(DEFAULT_TREASURES);
    setAlphaLetter(DEFAULT_ALPHA_LETTER);
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/70 to-fuchsia-50/40 text-slate-800 antialiased overflow-x-hidden selection:bg-pink-500 selection:text-white font-sans">
      {/* Ambient floating pastel particles and heart/sparkles */}
      <FloatingParticles />

      {/* Admin Mode Active Top Pill Banner */}
      {isAdmin && (
        <div className="fixed top-3 right-4 z-30 flex items-center gap-2 bg-amber-500/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-amber-300 animate-pulse">
          <Unlock className="w-3.5 h-3.5" />
          <span>Alpha Author Mode Active</span>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="ml-1 underline text-[11px] hover:text-amber-100 cursor-pointer"
          >
            Manage
          </button>
        </div>
      )}

      {/* Left Vertical Navigation Panel (Expands on Hover) */}
      <SidebarNav
        currentPage={currentPage}
        onSelectPage={handleNavigate}
        isAdmin={isAdmin}
        onToggleAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Admin Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onResetDefaults={handleResetDefaults}
      />

      {/* Persistent Background Music Player */}
      <BackgroundMusicPlayer />

      {/* Main Content Area - Left Padding on Desktop to accommodate collapsed Sidebar */}
      <main className="lg:pl-20 transition-all duration-300 min-h-screen flex flex-col justify-between relative z-10">
        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            {currentPage === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <LandingPage onNavigateToAbout={() => handleNavigate('about')} />
              </motion.div>
            )}

            {currentPage === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <AboutMomPage
                  cards={aboutCards}
                  setCards={setAboutCards}
                  favorites={favorites}
                  setFavorites={setFavorites}
                  isAdmin={isAdmin}
                  onOpenAdminModal={() => setIsAdminModalOpen(true)}
                  onNavigateToNext={() => handleNavigate('timeline')}
                />
              </motion.div>
            )}

            {currentPage === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <TimelinePage
                  events={timelineEvents}
                  setEvents={setTimelineEvents}
                  isAdmin={isAdmin}
                  onOpenAdminModal={() => setIsAdminModalOpen(true)}
                  onNavigateToNext={() => handleNavigate('gallery')}
                />
              </motion.div>
            )}

            {currentPage === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <PhotoGalleryPage
                  photos={photos}
                  setPhotos={setPhotos}
                  isAdmin={isAdmin}
                  onOpenAdminModal={() => setIsAdminModalOpen(true)}
                  onNavigateToNext={() => handleNavigate('treasures')}
                />
              </motion.div>
            )}

            {currentPage === 'treasures' && (
              <motion.div
                key="treasures"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <TreasuresPage
                  treasures={treasures}
                  setTreasures={setTreasures}
                  isAdmin={isAdmin}
                  onOpenAdminModal={() => setIsAdminModalOpen(true)}
                  onNavigateToNext={() => handleNavigate('alpha')}
                />
              </motion.div>
            )}

            {currentPage === 'alpha' && (
              <motion.div
                key="alpha"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <WordFromAlphaPage
                  letter={alphaLetter}
                  setLetter={setAlphaLetter}
                  isAdmin={isAdmin}
                  setIsAdmin={setIsAdmin}
                  onOpenAdminModal={() => setIsAdminModalOpen(true)}
                  onNavigateToStart={() => handleNavigate('landing')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Delicate Footer */}
        <footer className="py-4 text-center text-xs text-pink-700/60 border-t border-pink-100/60 select-none">
          <p>
            Crafted with boundless love for Mom's Special Birthday • Always & Forever ❤️
          </p>
        </footer>
      </main>
    </div>
  );
}

