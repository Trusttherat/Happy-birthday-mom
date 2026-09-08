import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MomFavorite } from '../types';
import { storage } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';
import { ImagePasteDropZone } from './ImagePasteDropZone';
import {
  Flower2,
  Coffee,
  Music,
  Sparkles,
  Sun,
  Film,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkle,
  Eye,
  Info,
} from 'lucide-react';

interface MomsFavoritesSectionProps {
  favorites: MomFavorite[];
  setFavorites: React.Dispatch<React.SetStateAction<MomFavorite[]>>;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
}

export const MomsFavoritesSection: React.FC<MomsFavoritesSectionProps> = ({
  favorites,
  setFavorites,
  isAdmin,
  onOpenAdminModal,
}) => {
  const [activeRevealedId, setActiveRevealedId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [editingFav, setEditingFav] = useState<MomFavorite | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<MomFavorite>>({
    title: '',
    category: 'Favorite Hobby',
    iconName: 'Flower2',
    shortDescription: '',
    revealedDetail: '',
    revealedImageUrl: '',
    funFact: '',
  });

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'flower2':
      case 'flower':
        return <Flower2 className="w-5 h-5" />;
      case 'coffee':
      case 'tea':
        return <Coffee className="w-5 h-5" />;
      case 'music':
      case 'song':
        return <Music className="w-5 h-5" />;
      case 'sparkles':
      case 'craft':
        return <Sparkles className="w-5 h-5" />;
      case 'sun':
      case 'nature':
      case 'beach':
        return <Sun className="w-5 h-5" />;
      case 'film':
      case 'movie':
        return <Film className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const [favToDelete, setFavToDelete] = useState<MomFavorite | null>(null);

  const handleCardClick = (id: string) => {
    setActiveRevealedId(prev => (prev === id ? null : id));
  };

  const handleStartEdit = (fav: MomFavorite, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFav(fav);
    setFormData(fav);
    setIsAddingNew(false);
  };

  const handleDelete = (fav: MomFavorite, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavToDelete(fav);
  };

  const handleConfirmDelete = () => {
    if (!favToDelete) return;
    const updated = favorites.filter(f => f.id !== favToDelete.id);
    setFavorites(updated);
    storage.saveFavorites(updated);
    if (activeRevealedId === favToDelete.id) setActiveRevealedId(null);
    if (editingFav?.id === favToDelete.id) {
      setEditingFav(null);
      setIsAddingNew(false);
    }
    setFavToDelete(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.shortDescription?.trim()) return;

    if (isAddingNew) {
      const newFav: MomFavorite = {
        id: 'fav-' + Date.now(),
        title: formData.title || 'Special Favorite',
        category: formData.category || 'Special Memory',
        iconName: formData.iconName || 'Heart',
        shortDescription: formData.shortDescription || '',
        revealedDetail: formData.revealedDetail || 'A treasured element of Mom’s joyous life.',
        revealedImageUrl: formData.revealedImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
        funFact: formData.funFact || '',
      };
      const updated = [...favorites, newFav];
      setFavorites(updated);
      storage.saveFavorites(updated);
    } else if (editingFav) {
      const updated = favorites.map(f =>
        f.id === editingFav.id ? ({ ...f, ...formData } as MomFavorite) : f
      );
      setFavorites(updated);
      storage.saveFavorites(updated);
    }

    setEditingFav(null);
    setIsAddingNew(false);
  };

  return (
    <section className="mt-16 pt-12 border-t border-pink-200/70" id="moms-favorites">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/90 text-pink-700 text-xs font-bold uppercase tracking-wider mb-3 border border-pink-200 shadow-sm">
          <Sparkle className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>Curated Pleasures & Hobbies</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-display font-extrabold text-slate-800 tracking-tight">
          Mom's Favorite Things
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          The little joys, passions, and soul rituals that make our mom smile brightest.
          <span className="block text-xs font-medium text-pink-600 mt-1">
            ✨ Hover or click any card to reveal special memories, pictures, and hidden fun facts!
          </span>
        </p>

        {isAdmin && (
          <div className="mt-4 flex justify-center">
            <button
              id="add-favorite-btn"
              onClick={() => {
                setIsAddingNew(true);
                setEditingFav(null);
                setFormData({
                  title: '',
                  category: 'Favorite Hobby',
                  iconName: 'Flower2',
                  shortDescription: '',
                  revealedDetail: '',
                  revealedImageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
                  funFact: '',
                });
              }}
              className="glow-btn inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Favorite Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Interactive Favorite Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav, index) => {
          const isRevealed = activeRevealedId === fav.id || hoveredCardId === fav.id;

          return (
            <motion.div
              key={fav.id}
              id={`favorite-card-${fav.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              onMouseEnter={() => setHoveredCardId(fav.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleCardClick(fav.id)}
              className="group relative cursor-pointer select-none"
            >
              <div
                className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 border ${
                  isRevealed
                    ? 'bg-white shadow-xl shadow-pink-500/15 border-pink-400 ring-2 ring-pink-400/30'
                    : 'bg-white/85 hover:bg-white backdrop-blur-md shadow-md hover:shadow-lg border-pink-200/80'
                }`}
              >
                {/* Top badge and action icons */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 bg-pink-100/90 px-3 py-1 rounded-full border border-pink-200/60">
                    <span className="text-pink-500">{getIcon(fav.iconName)}</span>
                    {fav.category}
                  </span>

                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button
                          id={`edit-fav-btn-${fav.id}`}
                          onClick={(e) => handleStartEdit(fav, e)}
                          title="Edit Favorite"
                          className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-fav-btn-${fav.id}`}
                          onClick={(e) => handleDelete(fav, e)}
                          title="Delete Favorite"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        isRevealed ? 'text-pink-600' : 'text-slate-400 group-hover:text-pink-500'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isRevealed ? 'Revealed' : 'Hover/Click'}
                    </span>
                  </div>
                </div>

                {/* Title and Short Description */}
                <h3 className="text-xl font-serif-display font-bold text-slate-800 group-hover:text-pink-700 transition-colors">
                  {fav.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {fav.shortDescription}
                </p>

                {/* Animated Reveal Section */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isRevealed ? 'auto' : 0,
                    opacity: isRevealed ? 1 : 0,
                    marginTop: isRevealed ? 16 : 0,
                  }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-pink-100/90 space-y-3">
                    {/* High-res Revealed Image */}
                    {fav.revealedImageUrl && (
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-inner border border-pink-100">
                        <img
                          src={fav.revealedImageUrl}
                          alt={fav.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* Detailed memory / narrative */}
                    <div className="bg-pink-50/70 p-3.5 rounded-2xl border border-pink-200/50">
                      <div className="text-xs font-bold text-pink-700 flex items-center gap-1.5 mb-1">
                        <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                        <span>Why She Cherishes It:</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        {fav.revealedDetail}
                      </p>
                    </div>

                    {/* Fun fact badge if provided */}
                    {fav.funFact && (
                      <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50/90 px-3 py-2 rounded-xl border border-amber-200/70">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Mom Fact:</strong> {fav.funFact}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit / Add Favorite Modal for Alpha */}
      <AnimatePresence>
        {(isAddingNew || editingFav) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
                <div>
                  <h3 className="font-serif-display font-bold text-xl text-slate-800">
                    {isAddingNew ? "Add Mom's Favorite Item" : "Edit Favorite Item"}
                  </h3>
                  <p className="text-xs text-pink-600 font-medium">Alpha Author Mode</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingFav(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Title / Favorite Item
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., English Rose Gardening"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Favorite Hobby"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Icon Theme
                    </label>
                    <select
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="Flower2">Flower / Garden</option>
                      <option value="Coffee">Tea / Coffee</option>
                      <option value="Music">Music / Melodies</option>
                      <option value="Sparkles">Knitting / Craft</option>
                      <option value="Sun">Nature / Beach</option>
                      <option value="Film">Movies / Cinema</option>
                      <option value="Heart">Love / General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Description (Always Visible)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief description seen before hover or click..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Revealed Detail (Shown on Hover / Click)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.revealedDetail}
                    onChange={(e) => setFormData({ ...formData, revealedDetail: e.target.value })}
                    placeholder="Story or detail revealed when mom or guests interact with the card..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <ImagePasteDropZone
                    value={formData.revealedImageUrl || ''}
                    onChange={(url) => setFormData({ ...formData, revealedImageUrl: url })}
                    label="Revealed Photo (Paste, Drag & Drop, or Browse)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fun Mom Fact (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.funFact}
                    onChange={(e) => setFormData({ ...formData, funFact: e.target.value })}
                    placeholder="e.g. Can identify 40 rose varieties by smell alone!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-pink-100">
                  {editingFav ? (
                    <button
                      type="button"
                      onClick={() => setFavToDelete(editingFav)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Favorite</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingFav(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="glow-btn inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Favorite</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guaranteed In-App Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(favToDelete)}
        title="Delete Favorite Item"
        message="Are you sure you want to remove this favorite item from Mom's collection?"
        confirmText="Yes, Delete"
        cancelText="Keep Item"
        variant="danger"
        itemTitle={favToDelete?.title}
        itemImage={favToDelete?.revealedImageUrl}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFavToDelete(null)}
      />
    </section>
  );
};
