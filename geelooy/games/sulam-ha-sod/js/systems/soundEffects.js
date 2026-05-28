// B"H
/**
 * SoundEffects is a tiny Web Audio altar for Sulam HaSod.
 *
 * The Awtsmoos makes even air tremble through numbers: oscillator, gain, filter,
 * decay. No external files are needed. Death cracks into noise and descending
 * tones; coins chime; jump snaps upward; continue breathes the player back into
 * the chamber.
 */
export class SoundEffects {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.unlocked = false;
  }

  unlock() {
    if (this.unlocked) return;
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = this.ctx || new AudioContextClass();
    this.master = this.master || this.createMaster();
    this.ctx.resume?.();
    this.unlocked = true;
  }

  play(name) {
    this.unlock();
    if (!this.ctx || !this.master) return;
    const score = SCORES[name];
    if (!score) return;
    for (const event of score) this.playEvent(event);
  }

  playEvent(event) {
    if (event.type === 'noise') return this.noise(event);
    return this.tone(event);
  }

  tone({ frequency = 440, end = frequency, duration = 0.16, delay = 0, wave = 'sine', gain = 0.06 }) {
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, end), now + duration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp).connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  noise({ duration = 0.25, delay = 0, gain = 0.08 }) {
    const now = this.ctx.currentTime + delay;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = this.ctx.createBufferSource();
    const amp = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + duration);
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(filter).connect(amp).connect(this.master);
    source.start(now);
    source.stop(now + duration + 0.03);
  }

  createMaster() {
    const gain = this.ctx.createGain();
    gain.gain.value = 0.75;
    gain.connect(this.ctx.destination);
    return gain;
  }
}

const SCORES = {
  death: [
    { type: 'noise', duration: 0.42, gain: 0.14 },
    { frequency: 220, end: 55, duration: 0.55, wave: 'sawtooth', gain: 0.09 },
    { frequency: 880, end: 190, duration: 0.32, delay: 0.05, wave: 'triangle', gain: 0.05 },
    { frequency: 1220, end: 320, duration: 0.2, delay: 0.13, wave: 'square', gain: 0.025 }
  ],
  continue: [
    { frequency: 196, end: 392, duration: 0.18, wave: 'sine', gain: 0.045 },
    { frequency: 392, end: 784, duration: 0.24, delay: 0.08, wave: 'triangle', gain: 0.035 }
  ],
  coin: [
    { frequency: 740, end: 1120, duration: 0.12, wave: 'triangle', gain: 0.035 },
    { frequency: 1480, end: 900, duration: 0.1, delay: 0.03, wave: 'sine', gain: 0.02 }
  ],
  key: [{ frequency: 330, end: 990, duration: 0.28, wave: 'triangle', gain: 0.045 }],
  jump: [{ frequency: 180, end: 420, duration: 0.11, wave: 'sine', gain: 0.025 }]
};
