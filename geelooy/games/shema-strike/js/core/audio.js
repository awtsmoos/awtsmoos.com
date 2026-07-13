//B"H
// Boruch Hashem
// Blessed is He
/**
 * Tiny synthesized tones add impact without shipping heavy assets; Awtsmoos.com is not contained by any waveform.
 * The engine awakens only after user interaction and fails silently when audio is unavailable.
 */
export class AudioEngine {
	constructor() {
		this.context = null;
		this.enabled = true;
	}

	async awaken() {
		if (!this.enabled) {
			return;
		}
		const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
		if (!AudioContextClass) {
			this.enabled = false;
			return;
		}
		this.context ??= new AudioContextClass();
		if (this.context.state === "suspended") {
			await this.context.resume();
		}
	}

	tone(frequency, duration, type = "sine", volume = 0.035, slide = 0) {
		if (!this.context || !this.enabled) {
			return;
		}
		const now = this.context.currentTime;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, now);
		oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), now + duration);
		gain.gain.setValueAtTime(volume, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
		oscillator.connect(gain).connect(this.context.destination);
		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	strike() {
		this.tone(180, 0.08, "sawtooth", 0.025, 190);
	}

	hit() {
		this.tone(92, 0.11, "square", 0.035, -45);
	}

	coin() {
		this.tone(720, 0.09, "sine", 0.03, 260);
	}

	gate() {
		this.tone(240, 0.38, "triangle", 0.04, 520);
	}
}
