// Web Audio API procedural Focus Soundscape & Ambient Music Synthesizer
// Zero external audio assets required - synthesized mathematically in browser
import { FocusTrack } from '../types';
import { loadCustomTracks } from './customAudioStorage';

export const FOCUS_TRACKS: FocusTrack[] = [
  {
    id: 'ethereal-choir',
    title: 'Ethereal Vocal Choirs',
    category: 'Vocal Ambience',
    bpm: 54,
    description: 'Synthesized human-like vocal formant choir chords (Oohs & Aahs) with warm tape saturation.',
    mood: 'Transcendent Calm',
  },
  {
    id: 'alpha-432hz',
    title: 'Deep Alpha Wave 432Hz',
    category: 'Binaural Focus',
    bpm: 60,
    description: '10Hz Alpha wave binaural pulsation centered around 432Hz natural resonance for laser concentration.',
    mood: 'Deep Work & Hyper-Focus',
  },
  {
    id: 'lofi-rhodes',
    title: 'Lo-Fi Study Rhodes',
    category: 'Lo-Fi Chords',
    bpm: 68,
    description: 'Mellow electric piano 7th chords with warm vinyl tape dust and soothing low-pass filtering.',
    mood: 'Relaxed Coding',
  },
  {
    id: 'cyber-zen',
    title: 'Cyber Zen Synthpad',
    category: 'Ambient Synth',
    bpm: 48,
    description: 'Dreamy pentatonic crystalline pads and smooth analog resonant sweeps designed for flow state.',
    mood: 'Meditative Coding',
  },
  {
    id: 'singing-bowl',
    title: 'Tibetan Singing Bowl',
    category: 'Harmonic Resonance',
    bpm: 40,
    description: 'Harmonic metal resonance bell tones with tranquil spatial stereo movement.',
    mood: 'Peaceful Mental Clarity',
  },
];

class FocusMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private loopTimer: number | null = null;
  private volume: number = 0.45;
  private currentTrackId: string = FOCUS_TRACKS[0].id;
  private customTracks: FocusTrack[] = [];
  private customAudioEl: HTMLAudioElement | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private listeners: Set<(track: FocusTrack, isPlaying: boolean) => void> = new Set();

  constructor() {
    // Randomize initial focus track on launch
    const randIdx = Math.floor(Math.random() * FOCUS_TRACKS.length);
    this.currentTrackId = FOCUS_TRACKS[randIdx].id;
    this.initCustomTracks();
  }

  public async initCustomTracks() {
    try {
      const stored = await loadCustomTracks();
      if (stored && stored.length > 0) {
        this.customTracks = stored;
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to load custom tracks into engine:', e);
    }
  }

  public getCustomTracks(): FocusTrack[] {
    return this.customTracks;
  }

  public addCustomTrack(track: FocusTrack) {
    // Avoid duplicates
    this.customTracks = [track, ...this.customTracks.filter((t) => t.id !== track.id)];
    this.setTrack(track.id);
    if (!this.isPlaying) {
      this.start();
    }
    this.notify();
  }

  public removeCustomTrack(trackId: string) {
    this.customTracks = this.customTracks.filter((t) => t.id !== trackId);
    if (this.currentTrackId === trackId) {
      this.currentTrackId = FOCUS_TRACKS[0].id;
      this.restartCurrentTrack();
    } else {
      this.notify();
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: (track: FocusTrack, isPlaying: boolean) => void) {
    this.listeners.add(listener);
    listener(this.getCurrentTrack(), this.isPlaying);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const current = this.getCurrentTrack();
    this.listeners.forEach((l) => l(current, this.isPlaying));
  }

  public getAllTracks(): FocusTrack[] {
    return [...this.customTracks, ...FOCUS_TRACKS];
  }

  public getTracks(): FocusTrack[] {
    return this.getAllTracks();
  }

  public getCurrentTrack(): FocusTrack {
    const all = this.getAllTracks();
    return all.find((t) => t.id === this.currentTrackId) || FOCUS_TRACKS[0];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.volume;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public selectRandomTrack(): FocusTrack {
    const all = this.getAllTracks();
    let nextIdx = Math.floor(Math.random() * all.length);
    if (all.length > 1 && all[nextIdx].id === this.currentTrackId) {
      nextIdx = (nextIdx + 1) % all.length;
    }
    this.setTrack(all[nextIdx].id);
    return this.getCurrentTrack();
  }

  public nextTrack(): FocusTrack {
    const all = this.getAllTracks();
    const curIdx = all.findIndex((t) => t.id === this.currentTrackId);
    const nextIdx = (curIdx + 1) % all.length;
    this.setTrack(all[nextIdx].id);
    return this.getCurrentTrack();
  }

  public prevTrack(): FocusTrack {
    const all = this.getAllTracks();
    const curIdx = all.findIndex((t) => t.id === this.currentTrackId);
    const prevIdx = (curIdx - 1 + all.length) % all.length;
    this.setTrack(all[prevIdx].id);
    return this.getCurrentTrack();
  }

  public setTrack(trackId: string) {
    const all = this.getAllTracks();
    const target = all.find((t) => t.id === trackId);
    if (target && target.id !== this.currentTrackId) {
      this.currentTrackId = target.id;
      this.restartCurrentTrack();
    }
  }

  private restartCurrentTrack() {
    this.notify();
    if (this.isPlaying) {
      this.stopCurrentAudio();
      this.playCurrentTrackStyle();
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isPlaying) return;

    this.isPlaying = true;

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.8);
    this.masterGain.connect(this.ctx.destination);

    this.notify();
    this.playCurrentTrackStyle();
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopCurrentAudio();

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          this.masterGain?.disconnect();
          this.masterGain = null;
        }, 900);
      } catch {
        // cleanup fallback
      }
    }

    this.notify();
  }

  private stopCurrentAudio() {
    // 1. Stop custom audio element if playing
    if (this.customAudioEl) {
      try {
        this.customAudioEl.pause();
        this.customAudioEl.currentTime = 0;
      } catch {
        // ignore
      }
    }

    // 2. Stop procedural timers & oscillators
    if (this.loopTimer !== null) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.activeNodes.forEach((node) => {
      if (typeof node !== 'number') {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.activeNodes = [];
  }

  private playCurrentTrackStyle() {
    const track = this.getCurrentTrack();

    // Check if this is a custom uploaded track
    if (track.isCustomUploaded && track.audioUrl) {
      this.playUploadedAudioTrack(track.audioUrl);
      return;
    }

    // Procedural synthesis tracks
    switch (track.id) {
      case 'ethereal-choir':
        this.loopVocalChoir();
        break;
      case 'alpha-432hz':
        this.loopAlphaBinaural();
        break;
      case 'lofi-rhodes':
        this.loopLofiRhodes();
        break;
      case 'cyber-zen':
        this.loopCyberZen();
        break;
      case 'singing-bowl':
        this.loopSingingBowl();
        break;
      default:
        this.loopVocalChoir();
    }
  }

  private playUploadedAudioTrack(url: string) {
    try {
      if (!this.customAudioEl) {
        this.customAudioEl = new Audio();
      }
      this.customAudioEl.src = url;
      this.customAudioEl.loop = true;
      this.customAudioEl.volume = this.volume;
      this.customAudioEl.play().catch((err) => {
        console.warn('Playback of uploaded audio track requires user gesture or failed:', err);
      });
    } catch (e) {
      console.error('Error playing uploaded audio:', e);
    }
  }

  // 1. Ethereal Vocal Choirs
  private loopVocalChoir() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const chords = [
      [174.61, 261.63, 349.23, 440.0, 523.25], // F major 9
      [146.83, 220.0, 293.66, 349.23, 440.0],  // D minor 9
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bb maj 7
      [130.81, 196.0, 261.63, 349.23, 392.0],  // C sus4
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const freqs = chords[chordIdx % chords.length];
      chordIdx++;
      const duration = 6.5;
      const now = this.ctx.currentTime;

      freqs.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const f1 = this.ctx.createBiquadFilter();
        const f2 = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, now);

        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(700 + (i * 120), now);
        f1.Q.setValueAtTime(4.5, now);

        f2.type = 'bandpass';
        f2.frequency.setValueAtTime(1150 + (i * 150), now);
        f2.Q.setValueAtTime(3.8, now);

        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.08 / (i + 1), now + 1.8);
        noteGain.gain.setValueAtTime(0.08 / (i + 1), now + duration - 2.0);
        noteGain.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(f1);
        osc.connect(f2);
        f1.connect(noteGain);
        f2.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        this.activeNodes.push(osc, noteGain, f1, f2);
      });

      this.loopTimer = window.setTimeout(playChord, (duration - 1.2) * 1000);
    };

    playChord();
  }

  // 2. Deep Alpha Wave 432Hz (10Hz Binaural Pulse)
  private loopAlphaBinaural() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const baseFreq = 432; // Natural concert pitch for calm focus
    const alphaDiff = 10; // 10Hz Alpha brainwave rhythm

    // Left Ear: 432Hz
    const oscL = this.ctx.createOscillator();
    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainL = this.ctx.createGain();

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, now);
    gainL.gain.setValueAtTime(0.12, now);

    // Right Ear: 442Hz (Creates 10Hz binaural beat in brain)
    const oscR = this.ctx.createOscillator();
    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainR = this.ctx.createGain();

    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + alphaDiff, now);
    gainR.gain.setValueAtTime(0.12, now);

    // Deep sub-octave drone for grounding (108Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(108, now);
    subGain.gain.setValueAtTime(0.08, now);

    if (panL && panR) {
      panL.pan.setValueAtTime(-0.85, now);
      panR.pan.setValueAtTime(0.85, now);
      oscL.connect(gainL);
      gainL.connect(panL);
      panL.connect(this.masterGain);

      oscR.connect(gainR);
      gainR.connect(panR);
      panR.connect(this.masterGain);
    } else {
      oscL.connect(gainL);
      gainL.connect(this.masterGain);
      oscR.connect(gainR);
      gainR.connect(this.masterGain);
    }

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    oscL.start(now);
    oscR.start(now);
    subOsc.start(now);
    this.activeNodes.push(oscL, oscR, subOsc, gainL, gainR, subGain);
  }

  // 3. Lo-Fi Study Rhodes (Mellow 7th Chords + Gentle Vinyl warmth)
  private loopLofiRhodes() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    // Jazzy 7th chords: Dm7 -> G7 -> Cmaj7 -> Am7
    const chords = [
      [146.83, 220.0, 261.63, 329.63], // Dm9
      [196.0, 246.94, 293.66, 349.23], // G7
      [130.81, 196.0, 246.94, 329.63], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
    ];

    let chordIdx = 0;
    const playRhodesChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const freqs = chords[chordIdx % chords.length];
      chordIdx++;
      const duration = 4.2;
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        // Warm tape lowpass filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(1.8, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.15 + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
        this.activeNodes.push(osc, gain, filter);
      });

      this.loopTimer = window.setTimeout(playRhodesChord, (duration - 0.4) * 1000);
    };

    playRhodesChord();
  }

  // 4. Cyber Zen Synthpad (Pentatonic atmospheric sweeps)
  private loopCyberZen() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const padPitches = [
      [220.0, 277.18, 329.63, 440.0], // A Major add 9
      [196.0, 246.94, 293.66, 392.0], // G Major
      [164.81, 220.0, 261.63, 329.63], // E Minor
    ];

    let idx = 0;
    const playZenPad = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const freqs = padPitches[idx % padPitches.length];
      idx++;
      const duration = 7.0;
      const now = this.ctx.currentTime;

      freqs.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(1100, now + duration * 0.5);
        filter.frequency.linearRampToValueAtTime(450, now + duration);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 2.5);
        gain.gain.setValueAtTime(0.06, now + duration - 2.5);
        gain.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
        this.activeNodes.push(osc, gain, filter);
      });

      this.loopTimer = window.setTimeout(playZenPad, (duration - 1.5) * 1000);
    };

    playZenPad();
  }

  // 5. Tibetan Singing Bowl (Harmonic overtone bells)
  private loopSingingBowl() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const strikes = [216, 288, 324, 432];
    let strikeIdx = 0;

    const strikeBowl = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const base = strikes[strikeIdx % strikes.length];
      strikeIdx++;
      const duration = 6.0;
      const now = this.ctx.currentTime;

      // Fundamental + 2 metallic overtones
      const overtones = [base, base * 2.76, base * 5.4];
      overtones.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 / (i + 1), now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
        this.activeNodes.push(osc, gain);
      });

      this.loopTimer = window.setTimeout(strikeBowl, (duration - 1.0) * 1000);
    };

    strikeBowl();
  }
}

export const focusMusic = new FocusMusicEngine();
