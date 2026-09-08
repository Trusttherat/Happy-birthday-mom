import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Cake, Sun, Plus, Edit3, Trash2, Check, X, ArrowRight, Star, Flower2 } from 'lucide-react';
import { AboutCard, MomFavorite } from '../types';
import { GlowButton } from '../components/GlowButton';
import { MomsFavoritesSection } from '../components/MomsFavoritesSection';
import { storage } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';

interface AboutMomPageProps {
  cards: AboutCard[];
  setCards: React.Dispatch<React.SetStateAction<AboutCard[]>>;
  favorites: MomFavorite[];
  setFavorites: React.Dispatch<React.SetStateAction<MomFavorite[]>>;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onNavigateToNext: () => void;
}

export const AboutMomPage: React.FC<AboutMomPageProps> = ({
  cards,
  setCards,
  favorites,
  setFavorites,
  isAdmin,
  onOpenAdminModal,
  onNavigateToNext,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'superpowers' | 'favorites'>('all');
  const [editingCard, setEditingCard] = useState<AboutCard | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<AboutCard | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');

  const openEditModal = (card: AboutCard) => {
    setEditingCard(card);
    setTitle(card.title);
    setSubtitle(card.subtitle);
    setContent(card.content);
    setTag(card.tag);
    setIsAddingNew(false);
  };

  const openNewCardModal = () => {
    setEditingCard(null);
    setTitle('');
    setSubtitle('');
    setContent('');
    setTag('Mom Quality');
    setIsAddingNew(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let updatedCards: AboutCard[];
    if (isAddingNew) {
      const newCard: AboutCard = {
        id: Date.now().toString(),
        title: title.trim(),
        subtitle: subtitle.trim() || 'A Treasured Quality',
        content: content.trim(),
        iconName: 'Sparkles',
        tag: tag.trim() || 'Special Memory',
      };
      updatedCards = [...cards, newCard];
    } else if (editingCard) {
      updatedCards = cards.map((c) =>
        c.id === editingCard.id
          ? { ...c, title: title.trim(), subtitle: subtitle.trim(), content: content.trim(), tag: tag.trim() }
          : c
      );
    } else {
      return;
    }

    setCards(updatedCards);
    storage.saveAboutCards(updatedCards);
    setEditingCard(null);
    setIsAddingNew(false);
  };

  const handleConfirmDeleteCard = () => {
    if (!cardToDelete) return;
    const updated = cards.filter((c) => c.id !== cardToDelete.id);
    setCards(updated);
    storage.saveAboutCards(updated);
    if (editingCard?.id === cardToDelete.id) {
      setEditingCard(null);
    }
    setCardToDelete(null);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />;
      case 'Cake':
        return <Cake className="w-6 h-6 text-fuchsia-500" />;
      case 'Sun':
        return <Sun className="w-6 h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-pink-500" />;
    }
  };

  return (
    <div className="min-h-[90vh] py-8 sm:py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Header section labeled explicitly "About Mom" */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider mb-2"
            >
              <Star className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>Chapter 2 • The Woman We Adore</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight"
            >
              About{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600">
                Mom
              </span>
            </motion.h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl font-medium">
              Every detail that makes our mother so utterly irreplaceable. Explore her superpowers and her favorite things!
            </p>
          </div>

          {/* Quick Tab Filter and Admin Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-pink-200/80 shadow-sm flex items-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                All Views
              </button>
              <button
                onClick={() => setActiveTab('superpowers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'superpowers'
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Superpowers</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'favorites'
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                <Flower2 className="w-3 h-3" />
                <span>Mom's Favorites</span>
              </button>
            </div>

            {isAdmin ? (
              <GlowButton
                id="add-about-card-btn"
                size="sm"
                variant="primary"
                onClick={openNewCardModal}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Trait
              </GlowButton>
            ) : (
              <button
                id="about-admin-prompt-btn"
                onClick={onOpenAdminModal}
                className="glow-btn px-4 py-2 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-slate-600 hover:text-pink-600 border border-pink-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Only Alpha can edit these boxes"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-500" />
                <span>Author Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Hovering Superpower Cards */}
        {(activeTab === 'all' || activeTab === 'superpowers') && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <h2 className="text-xl font-serif-display font-bold text-slate-800">
                Her Superpowers & Qualities
              </h2>
              <span className="text-xs text-slate-400">• Hover to reveal subtle lift</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {cards.map((card, idx) => {
                const isHovered = hoveredCardId === card.id;

                return (
                  <motion.div
                    key={card.id}
                    id={`about-card-${card.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    onMouseEnter={() => setHoveredCardId(card.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-md bg-white/85 border ${
                      isHovered
                        ? 'border-pink-400 shadow-xl shadow-pink-500/15 ring-2 ring-pink-300/40'
                        : 'border-pink-200/80 shadow-md shadow-pink-500/5'
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-300/30 to-transparent rounded-tr-3xl rounded-bl-full pointer-events-none transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-40'
                      }`}
                    />

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-2xl transition-all duration-300 ${
                            isHovered
                              ? 'bg-gradient-to-tr from-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/30 rotate-6'
                              : 'bg-pink-100 text-pink-600'
                          }`}
                        >
                          {getIconComponent(card.iconName)}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider block">
                            {card.tag}
                          </span>
                          <h3 className="font-serif-display font-bold text-xl sm:text-2xl text-slate-800 leading-tight">
                            {card.title}
                          </h3>
                        </div>
                      </div>

                      {isAdmin ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`edit-card-btn-${card.id}`}
                            onClick={() => openEditModal(card)}
                            className="glow-btn p-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-semibold transition cursor-pointer"
                            title="Edit text"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-card-btn-${card.id}`}
                            onClick={() => setCardToDelete(card)}
                            className="glow-btn p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold transition cursor-pointer"
                            title="Delete card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <p className="text-xs font-semibold text-fuchsia-700/80 mb-2">
                      {card.subtitle}
                    </p>

                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                      {card.content}
                    </p>

                    <div className="mt-4 pt-4 border-t border-pink-100/80 flex items-center justify-between text-[11px] text-pink-500/80 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Pure Love & Appreciation</span>
                      </span>
                      {isAdmin && (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          Editable by Alpha
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Mom's Favorites Showcase */}
        {(activeTab === 'all' || activeTab === 'favorites') && (
          <MomsFavoritesSection
            favorites={favorites}
            setFavorites={setFavorites}
            isAdmin={isAdmin}
            onOpenAdminModal={onOpenAdminModal}
          />
        )}
      </div>

      {/* Navigation to next page */}
      <div className="mt-12 pt-6 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Ready to explore Mom's journey through time?
        </p>
        <GlowButton
          id="about-to-gallery-btn"
          size="md"
          variant="primary"
          onClick={onNavigateToNext}
          icon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          View Life Timeline
        </GlowButton>
      </div>

      {/* Modal for editing or adding card */}
      <AnimatePresence>
        {(editingCard || isAddingNew) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-pink-100 mb-6">
                <div>
                  <h3 className="font-serif-display font-bold text-2xl text-slate-900">
                    {isAddingNew ? 'Add New Trait Box' : 'Edit About Mom Text'}
                  </h3>
                  <p className="text-xs text-pink-600 font-medium">
                    Only Alpha can edit and save these personal tributes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setIsAddingNew(false);
                  }}
                  className="p-2 rounded-full hover:bg-pink-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tag / Category
                  </label>
                  <input
                    id="card-tag-input"
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g., Her Superpower, Heart of Gold"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-rose-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Box Title *
                  </label>
                  <input
                    id="card-title-input"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Heart of Our Home"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-rose-50/20 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subtitle / Short Highlight
                  </label>
                  <input
                    id="card-subtitle-input"
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Unconditional Love & Warmth"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-rose-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Heartfelt Content *
                  </label>
                  <textarea
                    id="card-content-input"
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a sweet description of Mom's qualities, kindness, or memories..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-rose-50/20 resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3 border-t border-pink-100">
                  {editingCard ? (
                    <button
                      type="button"
                      onClick={() => setCardToDelete(editingCard)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Card</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCard(null);
                        setIsAddingNew(false);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <GlowButton
                      id="save-card-submit-btn"
                      type="submit"
                      size="md"
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                    >
                      Save Changes
                    </GlowButton>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guaranteed In-App Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(cardToDelete)}
        title="Delete Trait Card"
        message="Are you sure you want to delete this trait card? This will remove it from Mom's tribute."
        confirmText="Yes, Delete Card"
        cancelText="Keep Card"
        variant="danger"
        itemTitle={cardToDelete?.title}
        onConfirm={handleConfirmDeleteCard}
        onCancel={() => setCardToDelete(null)}
      />
    </div>
  );
};
