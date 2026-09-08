/**
 * Ambient Heartfelt Piano Synthesizer (Web Audio API)
 * Generates an emotional, warm, gentle acoustic piano/chime chord progression.
 * Used for live generation or as a zero-network fallback.
 */

class AmbientHeartfeltSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private currentVolume: number = 0.5;

  // Gentle, warm chord progression in F major (F - C - Dm - Bb) with soothing voicing
  private chords: number[][] = [
    // Fmaj9: F3, C4, E4, A4, C5
    [174.61, 261.63, 329.63, 440.0, 523.25],
    // Cmaj/E: E3, C4, G4, B4, E5
    [164.81, 261.63, 392.0, 493.88, 659.25],
    // Dm9: D3, A3, F4, C5, E5
    [146.83, 220.0, 349.23, 523.25, 659.25],
    // Bbmaj7: Bb2, F3, D4, A4, D5
    [116.54, 174.61, 293.66, 440.0, 587.33],
  ];

  private currentChordIndex: number = 0;
  private stepIndex: number = 0;

  private initContext(): AudioContext | null {
    try {
      if (typeof window === 'undefined') return null;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return null;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (!this.masterGain && this.ctx) {
        this.masterGain = this.ctx.createGain();
        const safeVol = Math.max(0, Math.min(1, this.currentVolume));
        this.masterGain.gain.setValueAtTime(safeVol * 0.4, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  // Play a single soft, felt-piano style tone
  private playNote(frequency: number, duration: number = 2.4, isRoot: boolean = false) {
    try {
      if (!this.ctx || !this.masterGain || this.ctx.state !== 'running') return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm, soft acoustic tone shaping
      osc.type = isRoot ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(frequency, now);

      // Subtle overtone for sparkle
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(frequency * 2, now);

      // Lowpass filter to mimic warm upright piano hammers
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isRoot ? 450 : 1200, now);
      filter.Q.setValueAtTime(1.2, now);

      // Dynamic envelope: soft attack (30ms), gentle exponential decay
      const velocity = isRoot ? 0.35 : 0.22;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(velocity, now + 0.035);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      oscHarmonic.start(now);

      osc.stop(now + duration + 0.1);
      oscHarmonic.stop(now + duration + 0.1);
    } catch {
      // ignore audio render anomalies
    }
  }

  public start(volume: number = 0.5) {
    try {
      if (this.isRunning) return;
      this.currentVolume = volume;
      const ctx = this.initContext();
      if (!ctx) return;

      this.isRunning = true;
      this.setVolume(volume);

      // Step through the chord progression with arpeggiation
      const tick = () => {
        if (!this.isRunning) return;

        const chord = this.chords[this.currentChordIndex];
        const noteFreq = chord[this.stepIndex % chord.length];
        const isRoot = this.stepIndex % chord.length === 0;

        this.playNote(noteFreq, isRoot ? 3.0 : 2.0, isRoot);

        this.stepIndex++;
        if (this.stepIndex >= chord.length * 2) {
          this.stepIndex = 0;
          this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
        }
      };

      tick();
      // Arpeggiate every 720ms for a peaceful, slow romantic rhythm
      this.intervalId = window.setInterval(tick, 720);
    } catch {
      this.isRunning = false;
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public setVolume(vol: number) {
    try {
      this.currentVolume = Math.max(0, Math.min(1, vol));
      if (this.ctx && this.masterGain) {
        // Scale down gently so it remains comfortable in background
        this.masterGain.gain.setValueAtTime(this.currentVolume * 0.35, this.ctx.currentTime);
      }
    } catch {
      // ignore
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const ambientSynthesizer = new AmbientHeartfeltSynthesizer();
