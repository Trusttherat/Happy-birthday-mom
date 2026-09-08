import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimelineEvent } from '../types';
import { storage } from '../utils/storage';
import { GlowButton } from '../components/GlowButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { ImagePasteDropZone } from '../components/ImagePasteDropZone';
import {
  Calendar,
  Clock,
  Sparkles,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowRight,
  Maximize2,
  Quote,
  Star,
} from 'lucide-react';

interface TimelinePageProps {
  events: TimelineEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TimelineEvent[]>>;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onNavigateToNext: () => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  events,
  setEvents,
  isAdmin,
  onOpenAdminModal,
  onNavigateToNext,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    year: '',
    title: '',
    subtitle: '',
    shortDescription: '',
    fullDescription: '',
    imageUrl: '',
    tag: '',
    quote: '',
  });

  const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);

  const handleStartEdit = (event: TimelineEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData(event);
    setIsAddingNew(false);
  };

  const handleDelete = (event: TimelineEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToDelete(event);
  };

  const handleConfirmDeleteEvent = () => {
    if (!eventToDelete) return;
    const updated = events.filter((ev) => ev.id !== eventToDelete.id);
    setEvents(updated);
    storage.saveTimelineEvents(updated);
    if (selectedEvent?.id === eventToDelete.id) setSelectedEvent(null);
    if (editingEvent?.id === eventToDelete.id) {
      setEditingEvent(null);
      setIsAddingNew(false);
    }
    setEventToDelete(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year?.trim() || !formData.title?.trim()) return;

    if (isAddingNew) {
      const newEvent: TimelineEvent = {
        id: 'time-' + Date.now(),
        year: formData.year || '2026',
        title: formData.title || 'Milestone Memory',
        subtitle: formData.subtitle || 'A Cherished Chapter',
        shortDescription: formData.shortDescription || '',
        fullDescription: formData.fullDescription || formData.shortDescription || '',
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        tag: formData.tag || 'Life Chapter',
        quote: formData.quote || '',
      };
      // Sort events by year if possible or append
      const updated = [...events, newEvent];
      setEvents(updated);
      storage.saveTimelineEvents(updated);
    } else if (editingEvent) {
      const updated = events.map((ev) =>
        ev.id === editingEvent.id ? ({ ...ev, ...formData } as TimelineEvent) : ev
      );
      setEvents(updated);
      storage.saveTimelineEvents(updated);
      if (selectedEvent?.id === editingEvent.id) {
        setSelectedEvent({ ...selectedEvent, ...formData } as TimelineEvent);
      }
    }

    setEditingEvent(null);
    setIsAddingNew(false);
  };

  return (
    <div className="min-h-[90vh] py-8 sm:py-12 px-4 md:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-100/90 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider mb-2"
            >
              <Clock className="w-3.5 h-3.5 text-pink-600" />
              <span>Chapter 3 • Chronological Memories</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight"
            >
              Mom's{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600">
                Life Journey
              </span>
            </motion.h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl font-medium">
              An interactive visual timeline celebrating the milestone moments and golden eras from Mom's past.
              <span className="block text-xs font-semibold text-pink-600 mt-1">
                ✨ Click any timeline node or card to reveal photos and stories!
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <GlowButton
                id="add-timeline-event-btn"
                size="sm"
                variant="primary"
                onClick={() => {
                  setIsAddingNew(true);
                  setEditingEvent(null);
                  setFormData({
                    year: '',
                    title: '',
                    subtitle: '',
                    shortDescription: '',
                    fullDescription: '',
                    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
                    tag: 'Milestone',
                    quote: '',
                  });
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Milestone
              </GlowButton>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="glow-btn px-4 py-2 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-slate-600 hover:text-pink-600 border border-pink-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-pink-500" />
                <span>Author Edit Mode</span>
              </button>
            )}
          </div>
        </div>

        {/* Vertical Connected Timeline */}
        <div className="relative pl-6 sm:pl-10 md:pl-0">
          {/* Central Track Line (Left-aligned on mobile, centered on desktop) */}
          <div className="absolute left-6 sm:left-10 md:left-1/2 top-4 bottom-12 w-1 -translate-x-1/2 bg-gradient-to-b from-pink-400 via-rose-400 to-fuchsia-500 rounded-full shadow-sm shadow-pink-500/20" />

          <div className="space-y-12">
            {events.map((event, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={event.id}
                  id={`timeline-point-${event.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Glowing Timeline Interactive Node */}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    title={`View ${event.year}: ${event.title}`}
                    className="absolute left-0 sm:left-4 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white border-4 border-pink-500 shadow-lg shadow-pink-500/40 hover:scale-125 transition-transform duration-200 cursor-pointer group"
                  >
                    <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-600 group-hover:scale-110" />
                  </button>

                  {/* Spacer for 2-column alternating layout on desktop */}
                  <div className="hidden md:block w-1/2" />

                  {/* Event Content Card */}
                  <div className="w-full md:w-1/2 pl-8 md:px-8 pt-2 md:pt-0">
                    <div
                      onClick={() => setSelectedEvent(event)}
                      className="group relative bg-white/90 hover:bg-white backdrop-blur-md rounded-3xl p-6 shadow-md hover:shadow-xl border border-pink-200/80 hover:border-pink-400 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      {/* Top Year Badge & Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-bold text-xs shadow-md shadow-pink-500/25">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.year}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {event.tag && (
                            <span className="text-[11px] font-semibold text-pink-700 bg-pink-100/80 px-2.5 py-0.5 rounded-full">
                              {event.tag}
                            </span>
                          )}

                          {isAdmin && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => handleStartEdit(event, e)}
                                title="Edit Milestone"
                                className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(event, e)}
                                title="Delete Milestone"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Thumbnail Preview if present */}
                      {event.imageUrl && (
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 shadow-sm border border-pink-100">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" /> Click to Expand
                          </span>
                        </div>
                      )}

                      {/* Title & Subtitle */}
                      <h3 className="text-xl font-serif-display font-bold text-slate-800 group-hover:text-pink-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs font-semibold text-fuchsia-700/80 mb-2">
                        {event.subtitle}
                      </p>

                      <p className="text-sm text-slate-600 leading-relaxed font-sans">
                        {event.shortDescription}
                      </p>

                      {/* Quote preview if present */}
                      {event.quote && (
                        <div className="mt-3 pt-3 border-t border-pink-100 flex items-start gap-2 text-xs italic text-pink-700">
                          <Quote className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                          <span>{event.quote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-16 pt-6 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Continue onward to Mom's interactive photo gallery!
        </p>
        <GlowButton
          id="timeline-to-gallery-btn"
          size="md"
          variant="primary"
          onClick={onNavigateToNext}
          icon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          Explore Photo Gallery
        </GlowButton>
      </div>

      {/* Interactive Detail Modal on click */}
      <AnimatePresence>
        {selectedEvent && (
          <div
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Image banner */}
              {selectedEvent.imageUrl && (
                <div className="relative w-full h-56 sm:h-72 shrink-0 overflow-hidden">
                  <img
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full mb-1">
                      {selectedEvent.year} • {selectedEvent.tag || 'Milestone'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif-display font-bold">
                      {selectedEvent.title}
                    </h2>
                  </div>
                </div>
              )}

              {/* Modal Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                {!selectedEvent.imageUrl && (
                  <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                    <div>
                      <span className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full mb-1">
                        {selectedEvent.year}
                      </span>
                      <h2 className="text-2xl font-serif-display font-bold text-slate-900">
                        {selectedEvent.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="text-sm font-semibold text-fuchsia-700">
                  {selectedEvent.subtitle}
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                  {selectedEvent.fullDescription || selectedEvent.shortDescription}
                </p>

                {selectedEvent.quote && (
                  <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200/80 flex items-start gap-3 text-pink-800 text-sm italic">
                    <Quote className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>{selectedEvent.quote}</div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-pink-100 text-xs text-slate-400 font-medium">
                  <span>Part of Mom's Golden Memory Collection</span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold rounded-xl transition cursor-pointer"
                  >
                    Close Memory
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Edit/Add Modal */}
      <AnimatePresence>
        {(isAddingNew || editingEvent) && (
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
                    {isAddingNew ? 'Add Timeline Milestone' : 'Edit Milestone'}
                  </h3>
                  <p className="text-xs text-pink-600 font-medium">Alpha Author Mode</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingEvent(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 1996"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Milestone Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. University & Big Dreams"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Subtitle / Period
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Youthful Ambition"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tag Badge
                    </label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Golden Era"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Summary (Shown on Timeline)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief summary displayed on the card..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Narrative Story (Shown in Expanded View)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    placeholder="Deep story or memory from this time..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <ImagePasteDropZone
                    value={formData.imageUrl || ''}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Associated Milestone Photo (Paste, Drag & Drop, or Browse)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quote / Saying from that Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder='e.g. "She walked into every room with radiant grace."'
                    className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-pink-100">
                  {editingEvent ? (
                    <button
                      type="button"
                      onClick={() => setEventToDelete(editingEvent as TimelineEvent)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Milestone</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingEvent(null);
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
                      <span>Save Milestone</span>
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
        isOpen={Boolean(eventToDelete)}
        title="Delete Milestone Event"
        message="Are you sure you want to remove this milestone from Mom's life timeline? This action is permanent."
        confirmText="Yes, Delete Milestone"
        cancelText="Keep Milestone"
        variant="danger"
        itemTitle={eventToDelete ? `${eventToDelete.year} — ${eventToDelete.title}` : undefined}
        itemImage={eventToDelete?.imageUrl}
        onConfirm={handleConfirmDeleteEvent}
        onCancel={() => setEventToDelete(null)}
      />
    </div>
  );
};
