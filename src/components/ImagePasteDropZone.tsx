import React, { useState, useRef, useEffect } from 'react';
import { Upload, Clipboard, Image as ImageIcon, X, Check, FileCheck, AlertCircle } from 'lucide-react';

interface ImagePasteDropZoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const ImagePasteDropZone: React.FC<ImagePasteDropZoneProps> = ({
  value,
  onChange,
  label = 'Photo / Image',
  required = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Helper to process an image File or Blob
  const processImageFile = (file: File | Blob) => {
    if (!file.type.startsWith('image/')) {
      setPasteNotice('Please choose an image file (PNG, JPG, WEBP, etc.)');
      setTimeout(() => setPasteNotice(''), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onChange(e.target.result);
        setPasteSuccess(true);
        setPasteNotice('Image loaded successfully!');
        setTimeout(() => {
          setPasteSuccess(false);
          setPasteNotice('');
        }, 3000);
      }
    };
    reader.onerror = () => {
      setPasteNotice('Could not read image file.');
      setTimeout(() => setPasteNotice(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    } else {
      const text = e.dataTransfer.getData('text');
      if (text && (text.startsWith('http') || text.startsWith('data:image/'))) {
        onChange(text.trim());
      }
    }
  };

  // Handle native Paste Event when focused or over dropzone
  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // 1. Check for files (e.g. copied file from Windows Explorer or Mac Finder or screenshot)
    if (clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          e.stopPropagation();
          processImageFile(file);
          return;
        }
      }
    }

    // 2. Check for clipboard items
    if (clipboardData.items && clipboardData.items.length > 0) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            e.stopPropagation();
            processImageFile(file);
            return;
          }
        }
      }
    }

    // 3. Check for text URL / base64
    const text = clipboardData.getData('text');
    if (text) {
      const trimmed = text.trim();
      if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        e.preventDefault();
        onChange(trimmed);
        setPasteSuccess(true);
        setPasteNotice('Image link pasted!');
        setTimeout(() => {
          setPasteSuccess(false);
          setPasteNotice('');
        }, 2500);
      }
    }
  };

  // Button: Paste directly from System Clipboard via Async Clipboard API
  const handlePasteFromClipboardBtn = async () => {
    setPasteNotice('');
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            processImageFile(blob);
            return;
          }
        }
      }

      // Fallback: check text clipboard
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const trimmed = text.trim();
        if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          onChange(trimmed);
          setPasteSuccess(true);
          setPasteNotice('Image link pasted!');
          setTimeout(() => {
            setPasteSuccess(false);
            setPasteNotice('');
          }, 2500);
          return;
        }
      }

      setPasteNotice('No image found in clipboard. Copy an image or file first, then click paste!');
      setTimeout(() => setPasteNotice(''), 4000);
    } catch (err) {
      setPasteNotice('To paste: Press Ctrl+V (or Cmd+V) directly inside the box.');
      setTimeout(() => setPasteNotice(''), 4000);
    }
  };

  // Also support global window paste when modal is active
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // If user isn't typing into a text input other than this
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'INPUT' && target.id !== 'image-url-text-input') {
        // If typing in title or year input, allow text paste there
        if (target.getAttribute('type') === 'text') return;
      }
      if (target && target.tagName === 'TEXTAREA') return;

      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          processImageFile(file);
        }
      } else if (e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              processImageFile(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-pink-600">*</span>}
        </label>
        <span className="text-[11px] text-pink-600 font-semibold flex items-center gap-1">
          <span>Ctrl+V to Paste</span>
        </span>
      </div>

      {/* Paste / Drop / Browse Unified Container */}
      <div
        ref={dropZoneRef}
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`relative rounded-2xl border-2 transition-all p-3 sm:p-4 outline-none ${
          isDragging
            ? 'border-pink-500 bg-pink-100/70 scale-[1.01] ring-4 ring-pink-300/50'
            : value
            ? 'border-pink-200 bg-rose-50/20'
            : 'border-dashed border-pink-300 hover:border-pink-400 bg-pink-50/40 hover:bg-pink-50/70'
        }`}
      >
        {value ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Image Preview */}
            <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-slate-900/5 shrink-0 border border-pink-200 shadow-xs">
              <img
                src={value}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition shadow-sm"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions for replace / repaste */}
            <div className="flex-1 w-full space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Image loaded and ready</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-pink-200 hover:bg-pink-50 text-[11px] font-bold text-pink-700 transition shadow-2xs flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Choose Another File</span>
                </button>

                <button
                  type="button"
                  onClick={handlePasteFromClipboardBtn}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold transition shadow-2xs flex items-center gap-1"
                >
                  <Clipboard className="w-3 h-3" />
                  <span>Paste New Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition"
                >
                  Clear
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                Or press Ctrl+V / Cmd+V anytime to replace with copied image
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 sm:py-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-2.5 shadow-2xs">
              <ImageIcon className="w-6 h-6" />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Paste an image from your personal files
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Copy any image from your computer (Ctrl+C), then press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-pink-200 font-mono text-[10px] font-bold text-pink-700 shadow-2xs">
                Ctrl+V
              </kbd>{' '}
              here
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <button
                type="button"
                onClick={handlePasteFromClipboardBtn}
                className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste from Clipboard</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-200 text-slate-700 text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-pink-600" />
                <span>Browse Files...</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processImageFile(file);
          }}
          className="hidden"
        />

        {/* Feedback Notices */}
        {pasteNotice && (
          <div className="mt-2.5 p-2 rounded-xl bg-pink-100/90 border border-pink-300 text-pink-900 text-[11px] font-semibold flex items-center justify-center gap-1.5">
            {pasteSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-pink-600" />
            )}
            <span>{pasteNotice}</span>
          </div>
        )}
      </div>

      {/* Alternative URL input (expandable / optional fallback) */}
      <div className="pt-1">
        <input
          id="image-url-text-input"
          type="text"
          value={value.startsWith('data:image/') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={value.startsWith('data:image/') ? 'Image loaded from personal file (base64 data)' : 'Or paste direct web image link (https://...)'}
          className="w-full px-3 py-1.5 text-[11px] rounded-xl border border-pink-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none text-slate-700 placeholder:text-slate-400 shadow-2xs"
        />
      </div>
    </div>
  );
};
