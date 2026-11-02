/**
 * Procedural Web Audio API Sound Effects Synthesizer
 * Zero external audio files, works offline, low-latency.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgOscillator: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.bgGain && this.ctx) {
      this.bgGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Coin Chime
  public playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.setValueAtTime(2637.02, now + 0.08); // E7

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }

  // Harvest Paddy Scythe Swish
  public playHarvest() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.26);

    // Complementary pleasant wood chop chime
    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(523.25, now + 0.05); // C5
    tone.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
    toneGain.gain.setValueAtTime(0.12, now + 0.05);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    tone.connect(toneGain);
    toneGain.connect(ctx.destination);
    tone.start(now + 0.05);
    tone.stop(now + 0.26);
  }

  // Tractor Engine Roar
  public playTractor() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.3);
    osc.frequency.linearRampToValueAtTime(75, now + 0.7);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.linearRampToValueAtTime(600, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(200, now + 1.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // Water Irrigation Splash
  public playWater() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let j = 0; j < 3; j++) {
      const dropTime = now + j * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 + j * 200, dropTime);
      osc.frequency.exponentialRampToValueAtTime(600, dropTime + 0.1);
      gain.gain.setValueAtTime(0.1, dropTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(dropTime);
      osc.stop(dropTime + 0.12);
    }
  }

  // Wheel Spin Click
  public playWheelTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Win Fanfare
  public playWin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  // Cow Moo Sound
  public playCow() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.linearRampToValueAtTime(520, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(260, now + 0.8);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Goat Baa Sound
  public playGoat() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.5);

    // Vibrato for goat bleat
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(14, now);
    lfoGain.gain.setValueAtTime(25, now);
    lfo.connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.value = 2.0;

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.55);
    osc.stop(now + 0.55);
  }

  // Chicken Cluck
  public playChicken() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  // Toggle ambient village countryside breeze & soft birds
  public toggleAmbientMusic(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    if (this.isAmbientPlaying) {
      if (this.bgGain) {
        this.bgGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      }
      setTimeout(() => {
        try {
          this.bgOscillator?.stop();
          this.bgOscillator?.disconnect();
          this.bgGain?.disconnect();
        } catch {
          // ignore
        }
        this.bgOscillator = null;
        this.bgGain = null;
        this.isAmbientPlaying = false;
      }, 450);
      return false;
    } else {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now); // Warm A3 drone

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 1.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      this.bgOscillator = osc;
      this.bgGain = gain;
      this.isAmbientPlaying = true;
      return true;
    }
  }

  public isAmbientOn(): boolean {
    return this.isAmbientPlaying;
  }

  // Tree Foliage Rustle & Wind Shiver
  public playTreeRustle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    filter.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
  }

  // Tractor Friendly Horn Honk
  public playTractorHorn() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.setValueAtTime(554.37, now); // C#5

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.setValueAtTime(0.14, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.29);
    osc2.stop(now + 0.29);
  }
}

export const sounds = new SoundEffectsService();
