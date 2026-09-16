// Web Audio API based ambient vocal background music generator
// Synthesizes lush human-like vocal formant choir chords ("Oohs" & "Aahs") with warm tape saturation & gentle pulse

class VocalMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private loopTimer: number | null = null;
  private volume: number = 0.45;
  private currentTrack: string = 'Ethereal Vocal Chords';

  // Chord progressions (frequencies in Hz)
  // Voiced with warm vocal harmonies: root, fifth, octave, major third/ninth
  private progressions: number[][] = [
    // Chord 1: F major 9 (warm, uplifting)
    [174.61, 261.63, 349.23, 440.0, 523.25], 
    // Chord 2: D minor 9 (emotional, focus)
    [146.83, 220.0, 293.66, 349.23, 440.0],
    // Chord 3: Bb major 7 (expansive)
    [116.54, 174.61, 233.08, 293.66, 349.23],
    // Chord 4: C sus4 to C (resolving)
    [130.81, 196.0, 261.63, 349.23, 392.0],
  ];

  private currentChordIndex: number = 0;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getTrackName(): string {
    return this.currentTrack;
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

  public start() {
    this.init();
    if (!this.ctx) return;

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 2.5);
    this.masterGain.connect(this.ctx.destination);

    this.playNextChord();
  }

  private playNextChord() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const chord = this.progressions[this.currentChordIndex];
    const chordDuration = 7.5; // seconds per chord, slow breath-like pacing
    const now = this.ctx.currentTime;

    // Play each voice in the vocal chord
    chord.forEach((baseFreq, i) => {
      if (!this.ctx || !this.masterGain) return;

      // 1. Two slightly detuned oscillators for rich choir chorus effect
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      
      // Warm sawtooth filtered down mimics vocal fold vibration
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      const detuneAmount = (i % 2 === 0 ? 1 : -1) * (4 + i * 2);
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.detune.setValueAtTime(detuneAmount, now);

      osc2.frequency.setValueAtTime(baseFreq, now);
      osc2.detune.setValueAtTime(-detuneAmount, now);

      // 2. Vocal Formant Filter (simulates human vocal tract "Ah" / "Oh" resonance)
      // Formants for "Ah": F1 ~ 750Hz, F2 ~ 1200Hz
      const formant1 = this.ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(700 + (i * 40), now);
      formant1.Q.setValueAtTime(4.5, now);

      const formant2 = this.ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.setValueAtTime(1220 + (i * 60), now);
      formant2.Q.setValueAtTime(5.0, now);

      // Low pass to keep it buttery smooth and warm
      const warmthFilter = this.ctx.createBiquadFilter();
      warmthFilter.type = 'lowpass';
      warmthFilter.frequency.setValueAtTime(1400, now);

      // 3. Gentle LFO for natural human vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.8, now); // ~5Hz human vibrato
      lfoGain.gain.setValueAtTime(2.2, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start(now);
      lfo.stop(now + chordDuration + 1);

      // 4. Voice Envelope (soft fade-in, sustained breath, gentle release)
      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0, now);
      // Soft swelling attack
      voiceGain.gain.linearRampToValueAtTime(0.09 / Math.sqrt(chord.length), now + 2.5);
      // Gentle decay to release
      voiceGain.gain.setValueAtTime(0.09 / Math.sqrt(chord.length), now + chordDuration - 2.5);
      voiceGain.gain.linearRampToValueAtTime(0, now + chordDuration);

      // Routing
      osc1.connect(formant1);
      osc2.connect(formant2);

      formant1.connect(warmthFilter);
      formant2.connect(warmthFilter);

      warmthFilter.connect(voiceGain);
      voiceGain.connect(this.masterGain);

      // Start & Stop
      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + chordDuration + 0.5);
      osc2.stop(now + chordDuration + 0.5);
    });

    // Sub-bass warm drone underneath
    if (this.currentChordIndex % 2 === 0) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(chord[0] / 2, now); // 1 octave lower
      
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.12, now + 2.0);
      subGain.gain.setValueAtTime(0.12, now + chordDuration - 2.0);
      subGain.gain.linearRampToValueAtTime(0, now + chordDuration);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + chordDuration);
    }

    // Schedule next chord slightly before previous ends to crossfade seamlessly
    this.currentChordIndex = (this.currentChordIndex + 1) % this.progressions.length;
    this.loopTimer = window.setTimeout(() => {
      if (this.isPlaying) {
        this.playNextChord();
      }
    }, (chordDuration - 1.8) * 1000);
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        if (this.masterGain && !this.isPlaying) {
          try {
            this.masterGain.disconnect();
          } catch {
            // ignore
          }
        }
      }, 1100);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}

export const vocalMusic = new VocalMusicEngine();
