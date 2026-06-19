type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

type WaveShape = OscillatorType;

interface ToneOptions {
  frequency: number;
  duration: number;
  volume?: number;
  type?: WaveShape;
  delay?: number;
  endFrequency?: number;
  attack?: number;
  release?: number;
}

export class SoundSystem {
  private static context: AudioContext | null = null;
  private static master: GainNode | null = null;
  private static enabled = true;

  static unlock(): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    void context.resume();
    this.ensureMaster(context);
  }

  static playStart(): void {
    this.tone({ frequency: 330, endFrequency: 660, duration: 0.12, volume: 0.06, type: 'sawtooth' });
    this.tone({ frequency: 990, duration: 0.08, volume: 0.035, type: 'triangle', delay: 0.08 });
  }

  static playJump(): void {
    this.tone({ frequency: 420, endFrequency: 880, duration: 0.16, volume: 0.055, type: 'triangle' });
    this.tone({ frequency: 1180, duration: 0.05, volume: 0.025, type: 'sine', delay: 0.07 });
  }

  static playSlide(): void {
    this.tone({ frequency: 290, endFrequency: 110, duration: 0.2, volume: 0.045, type: 'sawtooth' });
  }

  static playEnergyOrb(): void {
    this.tone({ frequency: 640, endFrequency: 920, duration: 0.1, volume: 0.05, type: 'sine' });
    this.tone({ frequency: 1280, duration: 0.11, volume: 0.035, type: 'triangle', delay: 0.08 });
  }

  static playInspirationShard(): void {
    this.tone({ frequency: 720, duration: 0.07, volume: 0.04, type: 'triangle' });
    this.tone({ frequency: 960, duration: 0.07, volume: 0.04, type: 'triangle', delay: 0.06 });
    this.tone({ frequency: 1440, duration: 0.1, volume: 0.035, type: 'sine', delay: 0.12 });
  }

  static playHit(): void {
    this.noiseBurst(0.16, 0.07);
    this.tone({ frequency: 120, endFrequency: 65, duration: 0.22, volume: 0.07, type: 'square' });
  }

  static playStageChange(): void {
    this.tone({ frequency: 260, duration: 0.18, volume: 0.045, type: 'triangle' });
    this.tone({ frequency: 390, duration: 0.18, volume: 0.04, type: 'triangle', delay: 0.04 });
    this.tone({ frequency: 780, duration: 0.22, volume: 0.035, type: 'sine', delay: 0.1 });
  }

  static playDangerAlarm(pressureRatio: number): void {
    const highTone = pressureRatio > 0.92 ? 760 : 620;
    this.tone({ frequency: highTone, duration: 0.09, volume: 0.04, type: 'square' });
    this.tone({ frequency: highTone * 0.72, duration: 0.1, volume: 0.035, type: 'square', delay: 0.12 });
  }

  static playFailure(): void {
    this.tone({ frequency: 180, endFrequency: 55, duration: 0.45, volume: 0.08, type: 'sawtooth' });
    this.noiseBurst(0.24, 0.06);
  }

  static playSuccess(): void {
    this.tone({ frequency: 392, duration: 0.12, volume: 0.05, type: 'triangle' });
    this.tone({ frequency: 523.25, duration: 0.14, volume: 0.05, type: 'triangle', delay: 0.1 });
    this.tone({ frequency: 659.25, duration: 0.16, volume: 0.045, type: 'triangle', delay: 0.22 });
    this.tone({ frequency: 1046.5, duration: 0.28, volume: 0.035, type: 'sine', delay: 0.36 });
  }

  private static tone(options: ToneOptions): void {
    if (!this.enabled) {
      return;
    }

    const context = this.getContext();
    if (!context) {
      return;
    }

    const master = this.ensureMaster(context);
    const start = context.currentTime + (options.delay ?? 0);
    const duration = Math.max(options.duration, 0.02);
    const attack = options.attack ?? 0.012;
    const release = options.release ?? 0.045;
    const volume = options.volume ?? 0.04;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = options.type ?? 'sine';
    oscillator.frequency.setValueAtTime(options.frequency, start);
    if (options.endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(options.endFrequency, 1), start + duration);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + release + 0.02);
  }

  private static noiseBurst(duration: number, volume: number): void {
    if (!this.enabled) {
      return;
    }

    const context = this.getContext();
    if (!context) {
      return;
    }

    const master = this.ensureMaster(context);
    const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < sampleCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const now = context.currentTime;

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.Q.setValueAtTime(3.5, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(now);
    source.stop(now + duration + 0.02);
  }

  private static getContext(): AudioContext | null {
    if (this.context) {
      return this.context;
    }

    const audioWindow = window as AudioWindow;
    const AudioContextCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextCtor) {
      this.enabled = false;
      return null;
    }

    this.context = new AudioContextCtor();
    return this.context;
  }

  private static ensureMaster(context: AudioContext): GainNode {
    if (this.master) {
      return this.master;
    }

    this.master = context.createGain();
    this.master.gain.setValueAtTime(0.75, context.currentTime);
    this.master.connect(context.destination);
    return this.master;
  }
}
