import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { GlowButton } from './GlowButton';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  itemTitle?: string;
  itemImage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  itemTitle,
  itemImage,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-pink-200 relative overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                variant === 'danger'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : 'bg-gradient-to-r from-amber-400 to-pink-500'
              }`}
            />

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    variant === 'danger'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {variant === 'danger' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif-display font-bold text-xl text-slate-900">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Please confirm this action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {message}
            </p>

            {/* Optional preview of item being deleted */}
            {(itemTitle || itemImage) && (
              <div className="flex items-center gap-3 p-3 mb-5 bg-rose-50/50 border border-rose-200/70 rounded-2xl">
                {itemImage && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-pink-200">
                    <img
                      src={itemImage}
                      alt={itemTitle || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {itemTitle && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{itemTitle}</p>
                    <p className="text-[11px] text-rose-500 font-medium">Will be permanently removed</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {variant === 'danger' ? (
                  <Trash2 className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
