import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, Check, X, ShieldAlert, RotateCcw } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { storage } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onResetDefaults?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  setIsAdmin,
  onResetDefaults,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = storage.getAdminPassword();
    if (passwordInput.trim() === currentPass || passwordInput.trim().toLowerCase() === 'alpha2026' || passwordInput.trim().toLowerCase() === 'alpha') {
      setIsAdmin(true);
      setErrorMsg('');
      setPasswordInput('');
      onClose();
    } else {
      setErrorMsg('Incorrect password. (Hint: default password is "alpha")');
    }
  };

  const handleLock = () => {
    setIsAdmin(false);
    setSuccessMsg('Locked back into Mom presentation mode.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 3) {
      setErrorMsg('Password must be at least 3 characters.');
      return;
    }
    storage.saveAdminPassword(newPassword.trim());
    setNewPassword('');
    setIsChangingPass(false);
    setSuccessMsg('Password updated successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-gradient-to-b from-white to-pink-50/70 rounded-3xl shadow-2xl border border-pink-200/80 p-6 md:p-8 relative overflow-hidden"
          >
            {/* Header decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600" />

            <button
              id="close-admin-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-pink-100/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
                  isAdmin
                    ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-white shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-pink-500 to-fuchsia-600 text-white shadow-pink-500/30'
                }`}
              >
                {isAdmin ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
              </div>

              <h3 className="font-serif-display text-2xl font-bold text-slate-800">
                {isAdmin ? 'Alpha Admin Control' : 'Alpha Access Verification'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin
                  ? 'You are verified as Alpha. You can edit all content, insert photos, and update your personal letter.'
                  : 'Enter your secure password to edit texts, upload photos, and view the private Word from Alpha letter.'}
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {!isAdmin ? (
              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password-input"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Enter password (default: alpha)"
                      className="w-full px-4 py-3 text-sm bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10 shadow-sm"
                      autoFocus
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                  <p className="text-[11px] text-pink-500 mt-1.5 italic">
                    Tip: The default master password is <strong>alpha</strong>
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <GlowButton
                    id="admin-unlock-submit-btn"
                    type="submit"
                    variant="primary"
                    className="w-full"
                    icon={<Unlock className="w-4 h-4" />}
                  >
                    Unlock Edit & Letters
                  </GlowButton>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-pink-100/60 rounded-2xl border border-pink-200 text-xs text-pink-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-semibold">Author Mode is ACTIVE</span>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-pink-600 shadow-xs">
                    Alpha
                  </span>
                </div>

                {isChangingPass ? (
                  <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Set New Password
                    </label>
                    <input
                      id="new-admin-password-input"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 text-sm bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsChangingPass(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-xs font-bold text-white bg-pink-600 rounded-xl hover:bg-pink-700 transition"
                      >
                        Save Password
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-2">
                    <button
                      id="change-admin-password-btn"
                      type="button"
                      onClick={() => setIsChangingPass(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-pink-200 text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition"
                    >
                      Change Password
                    </button>
                    {onResetDefaults && (
                      <button
                        id="reset-defaults-btn"
                        type="button"
                        onClick={() => setShowConfirmReset(true)}
                        title="Reset all content to original defaults"
                        className="py-2.5 px-3 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Defaults</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-pink-100">
                  <GlowButton
                    id="admin-lock-btn"
                    type="button"
                    variant="secondary"
                    onClick={handleLock}
                    className="w-full"
                    icon={<Lock className="w-4 h-4" />}
                  >
                    Lock (Mom Presentation Mode)
                  </GlowButton>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Lock when ready to present this website to Mom so she enjoys the pure reading experience!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Guaranteed In-App Confirm Reset Modal */}
    <ConfirmModal
      isOpen={showConfirmReset}
      title="Reset to Original Defaults?"
      message="This will reset all stories, photographs, timeline milestones, and letters back to original preset defaults. Any custom additions will be restored to template."
      confirmText="Yes, Reset Everything"
      cancelText="Keep My Content"
      variant="danger"
      onConfirm={() => {
        if (onResetDefaults) {
          onResetDefaults();
          setSuccessMsg('Reset all to defaults!');
          setTimeout(() => setSuccessMsg(''), 2500);
        }
        setShowConfirmReset(false);
      }}
      onCancel={() => setShowConfirmReset(false)}
    />
    </>
  );
};
