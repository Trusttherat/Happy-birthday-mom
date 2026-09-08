import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Music,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Heart,
  ListMusic,
  Radio,
} from 'lucide-react';
import { HEARTFELT_TRACKS, DEFAULT_TRACK } from '../data/musicData';
import { MusicTrack } from '../types';
import { storage } from '../utils/storage';
import { ambientSynthesizer } from '../utils/synthesizer';

export const BackgroundMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(() => {
    const savedId = storage.getMusicTrackId();
    return HEARTFELT_TRACKS.find((t) => t.id === savedId) || DEFAULT_TRACK;
  });
  const [volume, setVolume] = useState<number>(() => storage.getMusicVolume());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.6);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isSynthesizerMode, setIsSynthesizerMode] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [showInvitationPrompt, setShowInvitationPrompt] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Sync volume with audio element and synthesizer
  useEffect(() => {
    const actualVol = isMuted ? 0 : volume;
    const clampedVol = Math.max(0, Math.min(1, Number.isFinite(actualVol) ? actualVol : 0.6));
    if (audioRef.current) {
      try {
        audioRef.current.volume = clampedVol;
      } catch {
        // ignore
      }
    }
    if (isSynthesizerMode) {
      ambientSynthesizer.setVolume(clampedVol);
    }
    storage.saveMusicVolume(volume);
  }, [volume, isMuted, isSynthesizerMode]);

  // Handle Play/Pause
  const togglePlayPause = useCallback(async () => {
    setHasInteracted(true);
    setShowInvitationPrompt(false);

    if (isPlaying) {
      // Pause
      if (isSynthesizerMode) {
        ambientSynthesizer.stop();
      } else if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          // ignore
        }
      }
      setIsPlaying(false);
    } else {
      // Play - triggered strictly by user interaction
      if (currentTrack.url === 'synthetic') {
        setIsSynthesizerMode(true);
        ambientSynthesizer.start(isMuted ? 0 : volume);
        setIsPlaying(true);
      } else if (audioRef.current) {
        try {
          setIsSynthesizerMode(false);
          if (!audioRef.current.src || !audioRef.current.src.includes(currentTrack.url)) {
            audioRef.current.src = currentTrack.url;
          }
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          // If network / loading error, fallback gracefully to ambient synthesizer
          setIsSynthesizerMode(true);
          ambientSynthesizer.start(isMuted ? 0 : volume);
          setIsPlaying(true);
        }
      }
    }
  }, [isPlaying, isSynthesizerMode, currentTrack, volume, isMuted]);

  // Handle Track Switching
  const handleSelectTrack = async (track: MusicTrack) => {
    setCurrentTrack(track);
    storage.saveMusicTrackId(track.id);

    // Stop current
    if (isSynthesizerMode) {
      ambientSynthesizer.stop();
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
    }

    if (track.url === 'synthetic') {
      setIsSynthesizerMode(true);
      if (isPlaying) {
        ambientSynthesizer.start(isMuted ? 0 : volume);
      }
    } else {
      setIsSynthesizerMode(false);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        if (isPlaying) {
          try {
            await audioRef.current.play();
          } catch {
            setIsSynthesizerMode(true);
            ambientSynthesizer.start(isMuted ? 0 : volume);
          }
        }
      }
    }
  };

  // Handle Volume Change from Slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    if (!isNaN(newVol)) {
      setVolume(newVol);
      if (newVol > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  // Handle Mute / Unmute Toggle
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 0.6);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  // Seek audio timeline
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (!isNaN(targetTime) && audioRef.current) {
      try {
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      } catch {
        // ignore
      }
    }
  };

  // Audio event bindings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleError = (e: Event) => {
      e.stopPropagation();
      // Fall back to synthesizer if audio fails to load
      if (isPlaying) {
        setIsSynthesizerMode(true);
        ambientSynthesizer.start(isMuted ? 0 : volume);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [isPlaying, isMuted, volume]);

  const activeVol = isMuted ? 0 : volume;

  return (
    <>
      {/* Standard HTML5 Audio Element with preload none and loop enabled */}
      <audio
        ref={audioRef}
        src={currentTrack.url !== 'synthetic' ? currentTrack.url : undefined}
        preload="none"
        loop
      />

      {/* Floating Bottom-Right Audio Player Container */}
      <aside
        aria-label="Background music player"
        className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40 max-w-[calc(100vw-24px)] select-none"
      >
        {/* Welcoming Interactive Prompt Badge (Appears before first user play interaction) */}
        <AnimatePresence>
          {!hasInteracted && showInvitationPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="mb-2 flex items-center justify-end"
            >
              <div
                onClick={togglePlayPause}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePlayPause();
                  }
                }}
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all cursor-pointer border border-pink-300/40 animate-bounce"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-spin" />
                <span>Play Heartfelt Music for Mom</span>
                <Play className="w-3 h-3 fill-white ml-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Card */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="bg-white/90 hover:bg-white/95 backdrop-blur-xl border border-pink-200/90 rounded-3xl shadow-xl shadow-pink-900/10 overflow-hidden transition-colors"
        >
          {/* Expanded Controls Drawer */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="p-4 sm:p-5 border-b border-pink-100/80 space-y-4 max-w-sm"
              >
                {/* Header with Title & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
                        Soundtrack for Mom
                      </p>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {currentTrack.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-semibold shrink-0">
                    {isSynthesizerMode ? 'Live Synth' : 'Hi-Fi Audio'}
                  </span>
                </div>

                {/* Track Description */}
                <p className="text-[11px] text-slate-500 leading-relaxed italic bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/60">
                  "{currentTrack.description}"
                </p>

                {/* Progress / Timeline Bar (for audio tracks) */}
                {currentTrack.url !== 'synthetic' && duration > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <input
                      id="audio-seek-slider"
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.5}
                      value={currentTime}
                      onChange={handleSeek}
                      aria-label="Seek audio timeline"
                      className="w-full h-1.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                  </div>
                )}

                {/* Volume Slider Section */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="audio-volume-slider"
                      className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-pink-600" />
                      <span>Volume Slider</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-pink-700">
                      {Math.round(activeVol * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      id="music-player-mute-btn"
                      onClick={handleToggleMute}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition cursor-pointer"
                    >
                      {activeVol === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-500" />
                      ) : activeVol < 0.5 ? (
                        <Volume1 className="w-4 h-4 text-pink-600" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-pink-600" />
                      )}
                    </button>

                    <input
                      id="audio-volume-slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={activeVol}
                      onChange={handleVolumeChange}
                      aria-label="Adjust background music volume"
                      className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                  </div>
                </div>

                {/* Track Selector List */}
                <div className="space-y-1.5 pt-2 border-t border-pink-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <ListMusic className="w-3.5 h-3.5 text-pink-600" />
                    <span>Choose Heartfelt Track</span>
                  </div>

                  <div className="space-y-1">
                    {HEARTFELT_TRACKS.map((track) => {
                      const isSelected = currentTrack.id === track.id;
                      return (
                        <button
                          key={track.id}
                          id={`select-track-${track.id}`}
                          type="button"
                          onClick={() => handleSelectTrack(track)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500/15 to-rose-500/10 text-pink-800 border border-pink-300/80'
                              : 'hover:bg-pink-50/70 text-slate-600 hover:text-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold">{track.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-pink-600 shrink-0 shadow-xs shadow-pink-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Persistent Audio Bar */}
          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-3">
            {/* Play/Pause Toggle Button */}
            <button
              id="music-play-pause-btn"
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
              className="glow-btn w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title={isPlaying ? 'Pause Music' : 'Play Heartfelt Music'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            {/* Track Info & Animated Equalizer Sound Waves */}
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }
              }}
              className="min-w-0 flex-1 text-left cursor-pointer group"
              title="Click to expand music controls"
            >
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[180px] group-hover:text-pink-600 transition-colors">
                  {currentTrack.title}
                </p>

                {/* Animated Equalizer Wave Bars */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3.5 shrink-0 px-1">
                    <span className="w-1 bg-pink-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2" />
                    <span className="w-1 bg-rose-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.15s] h-3.5" />
                    <span className="w-1 bg-fuchsia-600 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.3s] h-2.5" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="truncate max-w-[110px] sm:max-w-[150px]">
                  {isPlaying ? 'Playing • ' + currentTrack.artist : 'Click play for Mom'}
                </span>
                <span>•</span>
                <span className="font-mono text-pink-600 font-bold">
                  {Math.round(activeVol * 100)}%
                </span>
              </div>
            </div>

            {/* Quick Mini Volume Button */}
            <button
              id="music-mini-volume-btn"
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition cursor-pointer"
              title={isMuted ? 'Unmute' : `Volume: ${Math.round(activeVol * 100)}%`}
            >
              {activeVol === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : activeVol < 0.5 ? (
                <Volume1 className="w-4 h-4 text-pink-600" />
              ) : (
                <Volume2 className="w-4 h-4 text-pink-600" />
              )}
            </button>

            {/* Expand / Collapse Chevron */}
            <button
              id="music-toggle-expand-btn"
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse audio controls' : 'Expand audio controls'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title={isExpanded ? 'Collapse Controls' : 'Full Controls & Track Selection'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>
      </aside>
    </>
  );
};
