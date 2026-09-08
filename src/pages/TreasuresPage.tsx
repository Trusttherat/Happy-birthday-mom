import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Sparkles, MessageCircleHeart, UtensilsCrossed, GraduationCap, Plus, Edit3, Trash2, Check, X, ArrowRight, Bookmark } from 'lucide-react';
import { MomTreasuresData, TreasureItem } from '../types';
import { GlowButton } from '../components/GlowButton';
import { storage } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';

interface TreasuresPageProps {
  treasures: MomTreasuresData;
  setTreasures: React.Dispatch<React.SetStateAction<MomTreasuresData>>;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onNavigateToNext: () => void;
}

type TreasureCategoryKey = keyof MomTreasuresData;

interface CategoryConfig {
  key: TreasureCategoryKey;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  description: string;
  placeholderTitle: string;
  placeholderContent: string;
}

export const TreasuresPage: React.FC<TreasuresPageProps> = ({
  treasures,
  setTreasures,
  isAdmin,
  onOpenAdminModal,
  onNavigateToNext,
}) => {
  const [activeTab, setActiveTab] = useState<TreasureCategoryKey>('jokes');
  const [editingItem, setEditingItem] = useState<{ category: TreasureCategoryKey; item: TreasureItem } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<TreasureCategoryKey | null>(null);

  // Form states
  const [itemTitle, setItemTitle] = useState('');
  const [itemContent, setItemContent] = useState('');
  const [itemExtra, setItemExtra] = useState('');

  const categories: CategoryConfig[] = [
    {
      key: 'jokes',
      subtitle: 'Jokes',
      icon: <Smile className="w-5 h-5 text-amber-500" />,
      accent: 'from-amber-400 to-pink-500',
      description: 'The hilarious one-liners, funny mom-isms, and jokes that make our sides hurt laughing.',
      placeholderTitle: 'e.g., Mom and the GPS',
      placeholderContent: 'Describe the funny joke or hilarious mom moment...',
    },
    {
      key: 'childhoodMemories',
      subtitle: 'Childhood Memories',
      icon: <Sparkles className="w-5 h-5 text-rose-500" />,
      accent: 'from-rose-400 to-pink-500',
      description: 'Nostalgic golden moments, bedtime stories, and tender days holding our hands.',
      placeholderTitle: 'e.g., Sunday morning pancakes',
      placeholderContent: 'Write about a precious memory from childhood with Mom...',
    },
    {
      key: 'catchphrases',
      subtitle: 'Catchphrases',
      icon: <MessageCircleHeart className="w-5 h-5 text-fuchsia-500" />,
      accent: 'from-fuchsia-500 to-pink-500',
      description: 'Her iconic quotes, daily words of wisdom, and things she always tells us.',
      placeholderTitle: 'e.g., "Take a sweater with you!"',
      placeholderContent: 'Her exact words and why she always says them...',
    },
    {
      key: 'favoriteFoods',
      subtitle: 'Favorite Foods',
      icon: <UtensilsCrossed className="w-5 h-5 text-pink-600" />,
      accent: 'from-pink-500 to-rose-600',
      description: 'Her beloved meals, secret holiday baking, and warm home-cooked culinary wonders.',
      placeholderTitle: 'e.g., Mom’s Homemade Apple Pie',
      placeholderContent: 'The dish, her secret touch, and why it tastes like pure love...',
    },
    {
      key: 'cherishedLessons',
      subtitle: 'Cherished Lessons from My Mother',
      icon: <GraduationCap className="w-5 h-5 text-indigo-500" />,
      accent: 'from-pink-500 to-indigo-600',
      description: 'The lifelong guiding principles, moral compass, and deep wisdom she bestowed on us.',
      placeholderTitle: 'e.g., Kindness is never wasted',
      placeholderContent: 'The life lesson and how it has guided you every day...',
    },
  ];

  const currentCategory = categories.find((c) => c.key === activeTab) || categories[0];
  const [itemToDelete, setItemToDelete] = useState<{ category: TreasureCategoryKey; item: TreasureItem } | null>(null);

  const openAddModal = (catKey: TreasureCategoryKey) => {
    setIsAddingNew(catKey);
    setEditingItem(null);
    setItemTitle('');
    setItemContent('');
    setItemExtra('');
  };

  const openEditModal = (category: TreasureCategoryKey, item: TreasureItem) => {
    setEditingItem({ category, item });
    setIsAddingNew(null);
    setItemTitle(item.title);
    setItemContent(item.content);
    setItemExtra(item.extra || '');
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemContent.trim()) return;

    if (isAddingNew) {
      const newItem: TreasureItem = {
        id: Date.now().toString(),
        title: itemTitle.trim(),
        content: itemContent.trim(),
        extra: itemExtra.trim() || undefined,
      };
      const updated = {
        ...treasures,
        [isAddingNew]: [...treasures[isAddingNew], newItem],
      };
      setTreasures(updated);
      storage.saveTreasures(updated);
      setIsAddingNew(null);
    } else if (editingItem) {
      const { category, item } = editingItem;
      const updatedList = treasures[category].map((t) =>
        t.id === item.id
          ? { ...t, title: itemTitle.trim(), content: itemContent.trim(), extra: itemExtra.trim() || undefined }
          : t
      );
      const updated = {
        ...treasures,
        [category]: updatedList,
      };
      setTreasures(updated);
      storage.saveTreasures(updated);
      setEditingItem(null);
    }
  };

  const handleConfirmDeleteItem = () => {
    if (!itemToDelete) return;
    const { category, item } = itemToDelete;
    const updated = {
      ...treasures,
      [category]: treasures[category].filter((i) => i.id !== item.id),
    };
    setTreasures(updated);
    storage.saveTreasures(updated);
    if (editingItem?.item.id === item.id) {
      setEditingItem(null);
      setIsAddingNew(null);
    }
    setItemToDelete(null);
  };

  return (
    <div className="min-h-[90vh] py-8 sm:py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider mb-2"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Chapter 4 • Words, Flavors & Life Lessons</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight"
          >
            Mom's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600">
              Treasures & Quips
            </span>
          </motion.h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
            Fill in and explore the jokes, childhood memories, catchphrases, favorite foods, and cherished lessons.
          </p>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = activeTab === cat.key;
            const count = treasures[cat.key]?.length || 0;
            return (
              <button
                key={cat.key}
                id={`treasure-tab-${cat.key}`}
                onClick={() => setActiveTab(cat.key)}
                className={`glow-btn px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-pink-500/25 ring-2 ring-pink-300'
                    : 'bg-white/80 hover:bg-white text-slate-700 hover:text-pink-600 border border-pink-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.subtitle}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Header Banner */}
        <div className="bg-gradient-to-r from-white/90 via-pink-50/80 to-white/90 rounded-3xl p-6 border border-pink-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-pink-600 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Section Focus</span>
            </div>
            <h2 className="font-serif-display font-bold text-2xl text-slate-800">
              {currentCategory.subtitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              {currentCategory.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <GlowButton
                id={`add-item-${currentCategory.key}-btn`}
                size="sm"
                variant="primary"
                onClick={() => openAddModal(currentCategory.key)}
                icon={<Plus className="w-4 h-4" />}
              >
                Fill in New {currentCategory.subtitle.split(' ')[0]}
              </GlowButton>
            ) : (
              <button
                id="treasures-admin-prompt-btn"
                onClick={onOpenAdminModal}
                className="glow-btn px-4 py-2 rounded-full text-xs font-semibold bg-white text-pink-700 border border-pink-200 hover:border-pink-400 flex items-center gap-1.5 transition"
                title="Only Alpha can fill in and edit text boxes"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Fill in as Alpha</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Boxes Grid for the Selected Subtitle */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {treasures[activeTab]?.map((item, idx) => (
            <motion.div
              key={item.id}
              id={`treasure-card-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-pink-200/80 shadow-md hover:shadow-xl hover:shadow-pink-500/15 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider bg-pink-50 border border-pink-200/70 px-2.5 py-1 rounded-full">
                    {item.extra || currentCategory.subtitle}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-item-btn-${item.id}`}
                        onClick={() => openEditModal(activeTab, item)}
                        className="p-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs transition"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-item-btn-${item.id}`}
                        onClick={() => setItemToDelete({ category: activeTab, item })}
                        className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-serif-display font-bold text-xl text-slate-800 mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-pink-100/70 flex items-center justify-between text-[11px] text-pink-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Cherished by Alpha</span>
                </span>
                {isAdmin && (
                  <span className="text-emerald-600 text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Filled & Saved
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {(!treasures[activeTab] || treasures[activeTab].length === 0) && (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-pink-200 p-8">
            <p className="text-slate-600 font-semibold">No entries in {currentCategory.subtitle} yet.</p>
            {isAdmin && (
              <GlowButton
                size="sm"
                variant="primary"
                onClick={() => openAddModal(activeTab)}
                className="mt-4"
              >
                Fill in First Entry
              </GlowButton>
            )}
          </div>
        )}
      </div>

      {/* Navigation to Page 5: Word from Alpha */}
      <div className="mt-12 pt-6 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Proceed to the grand finale: Word from Alpha
        </p>
        <GlowButton
          id="treasures-to-alpha-btn"
          size="md"
          variant="primary"
          onClick={onNavigateToNext}
          icon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          Read Word from Alpha
        </GlowButton>
      </div>

      {/* Modal for filling in or editing text box */}
      <AnimatePresence>
        {(isAddingNew || editingItem) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                <div>
                  <h3 className="font-serif-display font-bold text-2xl text-slate-900">
                    {isAddingNew
                      ? `Fill in ${currentCategory.subtitle}`
                      : `Edit ${currentCategory.subtitle}`}
                  </h3>
                  <p className="text-xs text-pink-600 font-medium">
                    Only Alpha can edit and save these personal memories.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingNew(null);
                    setEditingItem(null);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Entry Title *
                  </label>
                  <input
                    id="treasure-title-input"
                    type="text"
                    required
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder={currentCategory.placeholderTitle}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 font-semibold bg-rose-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tag / Note
                  </label>
                  <input
                    id="treasure-extra-input"
                    type="text"
                    value={itemExtra}
                    onChange={(e) => setItemExtra(e.target.value)}
                    placeholder="e.g., Mom's secret wisdom, hilarious quip"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-rose-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description / Fill In Text *
                  </label>
                  <textarea
                    id="treasure-content-input"
                    required
                    rows={4}
                    value={itemContent}
                    onChange={(e) => setItemContent(e.target.value)}
                    placeholder={currentCategory.placeholderContent}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 resize-none bg-rose-50/20"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between gap-2 border-t border-pink-100">
                  {editingItem ? (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(editingItem)}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Entry</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(null);
                        setEditingItem(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <GlowButton
                      id="save-treasure-submit-btn"
                      type="submit"
                      size="md"
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                    >
                      Save Entry
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
        isOpen={Boolean(itemToDelete)}
        title="Delete Treasure Entry"
        message="Are you sure you want to delete this memory entry? This action cannot be undone."
        confirmText="Yes, Delete Entry"
        cancelText="Keep Entry"
        variant="danger"
        itemTitle={itemToDelete?.item.title}
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
