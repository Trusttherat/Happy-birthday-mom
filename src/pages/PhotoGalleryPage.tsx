import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  History,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Maximize2,
  ArrowRight,
  Clipboard,
} from 'lucide-react';
import { GalleryPhoto } from '../types';
import { GlowButton } from '../components/GlowButton';
import { storage } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { ImagePasteDropZone } from '../components/ImagePasteDropZone';

interface PhotoGalleryPageProps {
  photos: GalleryPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onNavigateToNext: () => void;
}

export const PhotoGalleryPage: React.FC<PhotoGalleryPageProps> = ({
  photos,
  setPhotos,
  isAdmin,
  onOpenAdminModal,
  onNavigateToNext,
}) => {
  const [activeCategory, setActiveCategory] = useState<'past' | 'today'>('past');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // In-app Delete Confirmation (No window.confirm!)
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);

  // Form states
  const [photoUrl, setPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState<'past' | 'today'>('past');

  const filteredPhotos = photos.filter((p) => p.category === activeCategory);

  const openNewPhotoModal = () => {
    setEditingPhoto(null);
    setPhotoUrl('');
    setTitle('');
    setCaption('');
    setYear(activeCategory === 'past' ? 'Vintage Memory' : 'Mom Today');
    setCategory(activeCategory);
    setIsAddingNew(true);
  };

  const openEditPhotoModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setPhotoUrl(photo.url);
    setTitle(photo.title);
    setCaption(photo.caption);
    setYear(photo.year || '');
    setCategory(photo.category);
    setIsAddingNew(false);
  };

  // Quick Paste Button: read image directly from clipboard
  const handleQuickPasteImage = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (typeof ev.target?.result === 'string') {
                setPhotoUrl(ev.target.result);
                setTitle('Mom Special Moment');
                setCaption('Pasted directly from personal files.');
                setYear(activeCategory === 'past' ? 'Vintage Memory' : 'Mom Today');
                setCategory(activeCategory);
                setIsAddingNew(true);
                setEditingPhoto(null);
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch {
      // If clipboard read permissions denied, open modal so user can press Ctrl+V directly
    }
    openNewPhotoModal();
  };

  // Global Page Paste Listener: Allows pasting an image directly while on the gallery page!
  useEffect(() => {
    const handlePagePaste = (e: ClipboardEvent) => {
      // If a modal is already open, let the modal's input handle it
      if (isAddingNew || editingPhoto) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // 1. Check for image files in clipboard (e.g. copied in File Explorer / Finder)
      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (typeof ev.target?.result === 'string') {
                setPhotoUrl(ev.target.result);
                setTitle('Pasted Memory of Mom');
                setCaption('A picture from personal memories.');
                setYear(activeCategory === 'past' ? 'Vintage Memory' : 'Mom Today');
                setCategory(activeCategory);
                setIsAddingNew(true);
                setEditingPhoto(null);
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }

      // 2. Check for image items (screenshots / copied images)
      if (clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (typeof ev.target?.result === 'string') {
                  setPhotoUrl(ev.target.result);
                  setTitle('Pasted Memory of Mom');
                  setCaption('A picture from personal memories.');
                  setYear(activeCategory === 'past' ? 'Vintage Memory' : 'Mom Today');
                  setCategory(activeCategory);
                  setIsAddingNew(true);
                  setEditingPhoto(null);
                }
              };
              reader.readAsDataURL(file);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePagePaste);
    return () => window.removeEventListener('paste', handlePagePaste);
  }, [isAddingNew, editingPhoto, activeCategory]);

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim() || !title.trim()) return;

    let updatedPhotos: GalleryPhoto[];
    if (isAddingNew) {
      const newPhoto: GalleryPhoto = {
        id: Date.now().toString(),
        category,
        url: photoUrl.trim(),
        title: title.trim(),
        caption: caption.trim() || 'A cherished photograph of Mom.',
        year: year.trim() || undefined,
      };
      updatedPhotos = [newPhoto, ...photos];
    } else if (editingPhoto) {
      updatedPhotos = photos.map((p) =>
        p.id === editingPhoto.id
          ? {
              ...p,
              category,
              url: photoUrl.trim(),
              title: title.trim(),
              caption: caption.trim(),
              year: year.trim() || undefined,
            }
          : p
      );
    } else {
      return;
    }

    setPhotos(updatedPhotos);
    storage.savePhotos(updatedPhotos);
    setIsAddingNew(false);
    setEditingPhoto(null);
  };

  // Reliable, guaranteed delete execution
  const handleConfirmDelete = () => {
    if (!photoToDelete) return;
    const updated = photos.filter((p) => p.id !== photoToDelete.id);
    setPhotos(updated);
    storage.savePhotos(updated);

    if (selectedPhoto?.id === photoToDelete.id) {
      setSelectedPhoto(null);
    }
    if (editingPhoto?.id === photoToDelete.id) {
      setEditingPhoto(null);
      setIsAddingNew(false);
    }
    setPhotoToDelete(null);
  };

  return (
    <div className="min-h-[90vh] py-8 sm:py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider mb-2"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Chapter 3 • Photographic Chronicles</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight"
          >
            Digital Photo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600">
              Gallery
            </span>
          </motion.h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
            A journey through timeless smiles, nostalgic milestones, and her radiant present-day beauty.
          </p>
        </div>

        {/* Action Bar: Categories & Photo Insertion */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            id="gallery-btn-past"
            onClick={() => setActiveCategory('past')}
            className={`glow-btn px-6 sm:px-7 py-3 rounded-full text-sm sm:text-base font-bold flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
              activeCategory === 'past'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-pink-500/30 ring-2 ring-pink-300'
                : 'bg-white/85 hover:bg-white text-slate-700 hover:text-pink-600 border border-pink-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Memories from the Past</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeCategory === 'past' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
              }`}
            >
              {photos.filter((p) => p.category === 'past').length}
            </span>
          </button>

          <button
            id="gallery-btn-today"
            onClick={() => setActiveCategory('today')}
            className={`glow-btn px-6 sm:px-7 py-3 rounded-full text-sm sm:text-base font-bold flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
              activeCategory === 'today'
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-pink-500/30 ring-2 ring-pink-300'
                : 'bg-white/85 hover:bg-white text-slate-700 hover:text-pink-600 border border-pink-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Mom Today</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeCategory === 'today' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
              }`}
            >
              {photos.filter((p) => p.category === 'today').length}
            </span>
          </button>

          {/* Insert / Paste Photo Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                id="gallery-add-photo-btn"
                onClick={openNewPhotoModal}
                className="glow-btn px-4 py-3 rounded-full text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Insert Photo</span>
              </button>

              <button
                id="gallery-paste-photo-btn"
                onClick={handleQuickPasteImage}
                className="glow-btn px-4 py-3 rounded-full text-xs sm:text-sm font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30 flex items-center gap-1.5 cursor-pointer"
                title="Paste an image copied from your personal files or clipboard"
              >
                <Clipboard className="w-4 h-4" />
                <span>Paste Image</span>
              </button>
            </div>
          ) : (
            <button
              id="gallery-admin-prompt-btn"
              onClick={onOpenAdminModal}
              className="glow-btn px-4 py-3 rounded-full text-xs font-semibold bg-white/70 hover:bg-white text-slate-500 hover:text-pink-600 border border-pink-200 transition"
              title="Only Alpha can insert & edit images"
            >
              Author Photo Manager
            </button>
          )}
        </div>

        {/* Quick helper tip banner for pasting */}
        {isAdmin && (
          <div className="max-w-md mx-auto mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-semibold">
              <Clipboard className="w-3 h-3 text-pink-600" />
              <span>Tip: You can copy an image from your files & press Ctrl+V right here!</span>
            </span>
          </div>
        )}

        {/* Gallery Grid with Interactive Hover Effects */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              id={`photo-card-${photo.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative bg-white rounded-3xl p-3 shadow-lg hover:shadow-2xl hover:shadow-pink-500/20 border border-pink-200/80 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-pink-50">
                <img
                  src={photo.url}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Shimmer / Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <div className="flex items-center justify-between text-xs text-pink-300 font-semibold mb-1">
                    <span>{photo.year || 'Special Moment'}</span>
                    <Maximize2 className="w-4 h-4 text-white/80" />
                  </div>
                  <h4 className="font-serif-display font-bold text-base text-white leading-tight">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>

                {/* Tag pill at top */}
                {photo.year && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wide border border-white/20">
                    {photo.year}
                  </div>
                )}
              </div>

              {/* Card Footer info */}
              <div className="pt-3 px-1.5 flex items-center justify-between">
                <div className="truncate mr-2">
                  <h4 className="font-serif-display font-bold text-slate-800 text-sm truncate">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{photo.caption}</p>
                </div>

                {/* Admin controls: Edit & Guaranteed Delete */}
                {isAdmin && (
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      id={`edit-photo-btn-${photo.id}`}
                      onClick={() => openEditPhotoModal(photo)}
                      className="p-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs transition"
                      title="Edit photo info"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-photo-btn-${photo.id}`}
                      onClick={() => setPhotoToDelete(photo)}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs transition cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state if all photos in this category are removed */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-16 bg-white/70 rounded-3xl border border-dashed border-pink-300 p-8 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="font-serif-display font-bold text-xl text-slate-800">
              No photos in this category yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Paste an image from your files or insert a new photograph to bring this section to life!
            </p>
            {isAdmin ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={openNewPhotoModal}
                  className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-md hover:bg-pink-700 transition"
                >
                  Insert Photo
                </button>
                <button
                  onClick={handleQuickPasteImage}
                  className="px-4 py-2 rounded-xl bg-white border border-pink-200 text-pink-700 text-xs font-bold hover:bg-pink-50 transition"
                >
                  Paste from Files
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold"
              >
                Log In as Alpha to Add Photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <History className="w-4 h-4 text-pink-500" />
          <span>Every photograph preserves a treasure of her soul</span>
        </div>

        <GlowButton
          id="gallery-next-chapter-btn"
          size="md"
          variant="primary"
          onClick={onNavigateToNext}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Next: Mom's Treasures
        </GlowButton>
      </div>

      {/* Photo Fullscreen Zoom / Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-pink-500/30"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/70 text-white hover:bg-pink-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full max-h-[65vh] overflow-hidden flex items-center justify-center bg-black/40">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                      {selectedPhoto.category === 'past' ? 'Past Memory' : 'Mom Today'}
                    </span>
                    {selectedPhoto.year && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {selectedPhoto.year}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif-display font-bold text-2xl text-white">
                    {selectedPhoto.title}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {selectedPhoto.caption}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const target = selectedPhoto;
                        setSelectedPhoto(null);
                        openEditPhotoModal(target);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        const target = selectedPhoto;
                        setSelectedPhoto(null);
                        setPhotoToDelete(target);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Insert / Edit Photo Modal with ImagePasteDropZone & Delete button */}
      <AnimatePresence>
        {(isAddingNew || editingPhoto) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-pink-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                <div>
                  <h3 className="font-serif-display font-bold text-xl text-slate-900">
                    {isAddingNew ? 'Insert New Photo' : 'Edit Photo Details'}
                  </h3>
                  <p className="text-[11px] text-pink-600 font-medium">
                    Upload, drag & drop, or paste an image from your personal files
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingPhoto(null);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Photo Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('past')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        category === 'past'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-pink-50 text-slate-700 border-pink-200'
                      }`}
                    >
                      Past Memories
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('today')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        category === 'today'
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-pink-50 text-slate-700 border-pink-200'
                      }`}
                    >
                      Mom Today
                    </button>
                  </div>
                </div>

                {/* Paste & Drop Zone */}
                <ImagePasteDropZone
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  label="Photo from Personal Files"
                  required
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Photo Title *
                  </label>
                  <input
                    id="photo-title-input"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mom's Radiant Smile"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Caption / Memory
                  </label>
                  <textarea
                    id="photo-caption-input"
                    rows={2}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="A sweet memory or date note..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year / Era Tag
                  </label>
                  <input
                    id="photo-year-input"
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., Summer 2026, 90s Vintage"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between gap-2 border-t border-pink-100">
                  {/* Delete button available directly inside Edit modal */}
                  {editingPhoto ? (
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(editingPhoto)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Photo</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingPhoto(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <GlowButton
                      id="save-photo-submit-btn"
                      type="submit"
                      size="sm"
                      variant="primary"
                      icon={<Check className="w-3.5 h-3.5" />}
                    >
                      Save Photo
                    </GlowButton>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guaranteed In-App Confirm Deletion Modal (Works in all iframes and browsers) */}
      <ConfirmModal
        isOpen={Boolean(photoToDelete)}
        title="Delete Photo"
        message="Are you sure you want to delete this photo from the gallery? This action is immediate and permanent."
        confirmText="Yes, Delete Photo"
        cancelText="Keep Photo"
        variant="danger"
        itemTitle={photoToDelete?.title}
        itemImage={photoToDelete?.url}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPhotoToDelete(null)}
      />
    </div>
  );
};
