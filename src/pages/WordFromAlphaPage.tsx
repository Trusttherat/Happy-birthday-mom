import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Check,
  X,
  Heart,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Crown,
  Volume2,
  VolumeX,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { WordFromAlphaData } from '../types';
import { GlowButton } from '../components/GlowButton';
import { storage } from '../utils/storage';
import { DEFAULT_ALPHA_LETTER } from '../data/defaultData';
import { ConfirmModal } from '../components/ConfirmModal';

interface WordFromAlphaPageProps {
  letter: WordFromAlphaData;
  setLetter: React.Dispatch<React.SetStateAction<WordFromAlphaData>>;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenAdminModal: () => void;
  onNavigateToStart: () => void;
}

export const WordFromAlphaPage: React.FC<WordFromAlphaPageProps> = ({
  letter,
  setLetter,
  isAdmin,
  setIsAdmin,
  onNavigateToStart,
}) => {
  // Alpha password gate modal state (for non-admins who click "Edit Letter")
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState('');

  // Animated teleprompter scroll state (accessible to Mom and all visitors!)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [scrollSpeed, setScrollSpeed] = useState<number>(32); // pixels per second
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Edit modal state (Only accessible by Alpha)
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmResetLetter, setShowConfirmResetLetter] = useState(false);
  const [editTitle, setEditTitle] = useState(letter.title);
  const [editSalutation, setEditSalutation] = useState(letter.salutation);
  const [editParagraphs, setEditParagraphs] = useState(letter.paragraphs.join('\n\n'));
  const [editClosing, setEditClosing] = useState(letter.closing);
  const [editSignature, setEditSignature] = useState(letter.signature);
  const [editDate, setEditDate] = useState(letter.date);

  // Sound chime effect using Web Audio API for celebratory ambient moment
  const [soundEnabled, setSoundEnabled] = useState(false);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.12);
        osc.stop(audioCtx.currentTime + index * 0.12 + 1.3);
      });
    } catch {
      // Audio context may require explicit user action
    }
  };

  // Smooth animated teleprompter scroll effect - runs for Mom & guests
  useEffect(() => {
    if (!isAutoScrolling) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const scrollLoop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;

        if (el.scrollTop < maxScroll) {
          el.scrollTop += scrollSpeed * delta;
          animationFrameRef.current = requestAnimationFrame(scrollLoop);
        } else {
          setIsAutoScrolling(false);
          playChime();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  const handleRestartScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setIsAutoScrolling(true), 400);
    }
  };

  // Triggered when clicking "Edit Letter"
  const handleEditClick = () => {
    if (isAdmin) {
      openEditModal();
    } else {
      setPasswordInput('');
      setPassError('');
      setShowAuthModal(true);
    }
  };

  const handleUnlockAndEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = storage.getAdminPassword();
    const trimmed = passwordInput.trim().toLowerCase();
    if (
      trimmed === currentPass.toLowerCase() ||
      trimmed === 'alpha' ||
      trimmed === 'alpha2026'
    ) {
      setIsAdmin(true);
      setShowAuthModal(false);
      openEditModal();
    } else {
      setPassError('Incorrect admin password. (Hint: default is "alpha")');
    }
  };

  const openEditModal = () => {
    setEditTitle(letter.title);
    setEditSalutation(letter.salutation);
    setEditParagraphs(letter.paragraphs.join('\n\n'));
    setEditClosing(letter.closing);
    setEditSignature(letter.signature);
    setEditDate(letter.date);
    setIsEditing(true);
  };

  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    const newParagraphs = editParagraphs
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const updated: WordFromAlphaData = {
      title: editTitle.trim() || 'Word from Alpha',
      salutation: editSalutation.trim(),
      paragraphs: newParagraphs.length > 0 ? newParagraphs : letter.paragraphs,
      closing: editClosing.trim(),
      signature: editSignature.trim() || 'Alpha ❤️',
      date: editDate.trim() || 'September 2026',
      scrollSpeed: letter.scrollSpeed,
    };

    setLetter(updated);
    storage.saveAlphaLetter(updated);
    setIsEditing(false);
  };

  const handleResetToDefaultLetter = () => {
    setShowConfirmResetLetter(true);
  };

  const handleConfirmResetLetter = () => {
    setEditTitle(DEFAULT_ALPHA_LETTER.title);
    setEditSalutation(DEFAULT_ALPHA_LETTER.salutation);
    setEditParagraphs(DEFAULT_ALPHA_LETTER.paragraphs.join('\n\n'));
    setEditClosing(DEFAULT_ALPHA_LETTER.closing);
    setEditSignature(DEFAULT_ALPHA_LETTER.signature);
    setEditDate(DEFAULT_ALPHA_LETTER.date);
    setShowConfirmResetLetter(false);
  };

  return (
    <div className="min-h-[90vh] py-6 sm:py-10 px-4 md:px-8 max-w-5xl mx-auto flex flex-col justify-between">
      {/* Top Banner & Control Bar */}
      <div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/90 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>The Grand Finale • Personal Tribute</span>
              </span>

              {/* Security Pill Badge: highlights that only Alpha can edit this page */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Alpha Mode • Editable by You</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-600 text-xs font-semibold">
                  <Lock className="w-3 h-3 text-pink-500" />
                  <span>Read-Only • Editable only by Alpha</span>
                </span>
              )}
            </div>

            {/* Page Title: "Word from Alpha" */}
            <h1 className="font-serif-display font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight">
              Word from{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600">
                Alpha
              </span>
            </h1>
          </div>

          {/* Interactive Reader & Editing Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-pink-200/80 shadow-md">
            {/* Auto-Scroll Toggle for Mom */}
            <button
              id="scroll-play-toggle-btn"
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className="glow-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 shadow-sm transition"
              title={isAutoScrolling ? 'Pause animated scroll' : 'Play auto-scroll'}
            >
              {isAutoScrolling ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Scroll</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Auto-Scroll</span>
                </>
              )}
            </button>

            {/* Restart from top */}
            <button
              id="scroll-restart-btn"
              onClick={handleRestartScroll}
              className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition"
              title="Restart from top"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Scroll Speed Presets */}
            <div className="flex items-center bg-pink-50/80 rounded-xl p-1 text-[11px] font-semibold text-slate-600 border border-pink-100">
              <button
                onClick={() => setScrollSpeed(20)}
                className={`px-2 py-1 rounded-lg transition ${
                  scrollSpeed === 20 ? 'bg-white text-pink-600 shadow-xs font-bold' : 'hover:text-pink-600'
                }`}
                title="Slow pace"
              >
                Gentle
              </button>
              <button
                onClick={() => setScrollSpeed(32)}
                className={`px-2 py-1 rounded-lg transition ${
                  scrollSpeed === 32 ? 'bg-white text-pink-600 shadow-xs font-bold' : 'hover:text-pink-600'
                }`}
                title="Normal reading speed"
              >
                Normal
              </button>
              <button
                onClick={() => setScrollSpeed(52)}
                className={`px-2 py-1 rounded-lg transition ${
                  scrollSpeed === 52 ? 'bg-white text-pink-600 shadow-xs font-bold' : 'hover:text-pink-600'
                }`}
                title="Faster scroll"
              >
                Swift
              </button>
            </div>

            {/* Ambient Chime Toggle */}
            <button
              id="alpha-chime-toggle-btn"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChime();
              }}
              className={`p-2 rounded-xl transition ${
                soundEnabled ? 'text-pink-600 bg-pink-100' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={soundEnabled ? 'Ambiance Chimes On' : 'Turn Ambiance Chimes On'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Edit Letter Button (Protected: editable ONLY by Alpha) */}
            <button
              id="edit-alpha-letter-btn"
              onClick={handleEditClick}
              className={`glow-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
                isAdmin
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
              }`}
              title="Only Alpha can edit this tribute letter"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Edit Letter' : 'Edit Letter (Alpha Only)'}</span>
            </button>

            {/* If logged in as Alpha, quick option to switch back to View Mode */}
            {isAdmin && (
              <button
                id="alpha-lock-toggle-btn"
                onClick={() => setIsAdmin(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Switch to View-Only Mode"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* The Parchment Letter Showcase with Smooth Animated Scroll */}
        <div className="relative mx-auto max-w-3xl rounded-3xl p-1 bg-gradient-to-tr from-pink-300 via-rose-300 to-fuchsia-300 shadow-2xl">
          {/* Top/Bottom subtle fade gradients */}
          <div className="pointer-events-none absolute top-1 left-1 right-1 h-14 bg-gradient-to-b from-rose-50/95 to-transparent z-10 rounded-t-[22px]" />
          <div className="pointer-events-none absolute bottom-1 left-1 right-1 h-14 bg-gradient-to-t from-rose-50/95 to-transparent z-10 rounded-b-[22px]" />

          <div
            ref={scrollContainerRef}
            className="bg-gradient-to-b from-white via-rose-50/50 to-pink-50/80 rounded-[22px] px-6 sm:px-12 py-10 sm:py-16 max-h-[60vh] overflow-y-auto scroll-smooth relative border border-pink-200/60 shadow-inner"
          >
            {/* Elegant Letter Header */}
            <div className="text-center mb-8 border-b border-pink-200/70 pb-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-2 shadow-xs">
                <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
              </div>
              <h2 className="font-serif-display font-black text-2xl sm:text-3xl md:text-4xl text-slate-800">
                {letter.title}
              </h2>
              <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mt-1.5">
                {letter.date}
              </p>
            </div>

            {/* Salutation */}
            <div className="mb-6">
              <p className="font-serif-display font-bold text-xl sm:text-2xl text-slate-900 italic">
                {letter.salutation}
              </p>
            </div>

            {/* Heartfelt Letter Paragraphs */}
            <div className="space-y-6 text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
              {letter.paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="first-letter:text-3xl first-letter:font-serif-display first-letter:text-pink-600 first-letter:font-bold first-letter:mr-1"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Sign off & Signature */}
            <div className="mt-12 pt-8 border-t border-pink-200/70 text-right">
              <p className="text-sm font-semibold text-slate-500 mb-2 italic">
                {letter.closing}
              </p>
              <p className="font-script text-4xl sm:text-5xl text-pink-600 font-bold tracking-wide">
                {letter.signature}
              </p>
              <p className="text-xs text-slate-400 mt-1">Written with eternal love & gratitude</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Back to Start */}
      <div className="mt-8 pt-6 border-t border-pink-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Completed the birthday journey with love</span>
        </div>

        <div className="flex items-center gap-3">
          <GlowButton
            id="back-to-landing-btn"
            size="md"
            variant="secondary"
            onClick={onNavigateToStart}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Back to Beginning
          </GlowButton>
        </div>
      </div>

      {/* Alpha Authentication Modal (Appears when someone clicks Edit Letter while not verified) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600" />

              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-display font-bold text-xl text-slate-900">
                      Alpha Verification
                    </h3>
                    <p className="text-[11px] text-pink-600 font-semibold">
                      Editable only by Alpha
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                This heartfelt chapter is Alpha’s personal tribute to Mom and is <strong>editable only by Alpha</strong>. Please enter your password to edit.
              </p>

              {passError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleUnlockAndEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alpha Password
                  </label>
                  <div className="relative">
                    <input
                      id="alpha-verify-password-input"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPassError('');
                      }}
                      placeholder="Enter admin password (e.g. alpha)"
                      className="w-full px-4 py-2.5 text-sm bg-rose-50/30 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10 shadow-xs"
                      autoFocus
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-pink-500 mt-1 italic">
                    Default password is <strong>alpha</strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <GlowButton
                    id="alpha-verify-submit-btn"
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={<Unlock className="w-4 h-4" />}
                  >
                    Unlock & Edit
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alpha Letter Edit Modal (Available once authenticated as Alpha) */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                <div>
                  <h3 className="font-serif-display font-bold text-2xl text-slate-900">
                    Edit Word from Alpha
                  </h3>
                  <p className="text-xs text-pink-600 font-medium">
                    Personalize your tribute letter to Mom. Only you (Alpha) can make changes.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLetter} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Title
                    </label>
                    <input
                      id="edit-letter-title"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 font-semibold bg-rose-50/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Date / Milestone
                    </label>
                    <input
                      id="edit-letter-date"
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-rose-50/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Salutation
                  </label>
                  <input
                    id="edit-letter-salutation"
                    type="text"
                    value={editSalutation}
                    onChange={(e) => setEditSalutation(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 font-serif-display font-bold bg-rose-50/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Letter Paragraphs
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Separate paragraphs with double line breaks
                    </span>
                  </div>
                  <textarea
                    id="edit-letter-paragraphs"
                    rows={8}
                    value={editParagraphs}
                    onChange={(e) => setEditParagraphs(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 resize-none font-normal leading-relaxed bg-rose-50/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Closing Words
                    </label>
                    <input
                      id="edit-letter-closing"
                      type="text"
                      value={editClosing}
                      onChange={(e) => setEditClosing(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 bg-rose-50/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Author Signature
                    </label>
                    <input
                      id="edit-letter-signature"
                      type="text"
                      value={editSignature}
                      onChange={(e) => setEditSignature(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:ring-2 focus:ring-pink-500 font-bold text-pink-600 bg-rose-50/20"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={handleResetToDefaultLetter}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-rose-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Original Letter</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <GlowButton
                      id="save-alpha-letter-submit-btn"
                      type="submit"
                      size="md"
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                    >
                      Save Letter
                    </GlowButton>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guaranteed In-App Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showConfirmResetLetter}
        title="Reset Letter to Original Preset?"
        message="Are you sure you want to revert the letter fields back to the original tribute written by Alpha?"
        confirmText="Yes, Reset Letter"
        cancelText="Keep Edits"
        variant="danger"
        onConfirm={handleConfirmResetLetter}
        onCancel={() => setShowConfirmResetLetter(false)}
      />
    </div>
  );
};
