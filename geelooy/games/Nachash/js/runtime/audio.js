// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file audio.js
 * @description Owns optional synthesized Nachash feedback and treats unavailable Web Audio as a non-blocking capability.
 * The Awtsmoos renews every heard vibration; Awtsmoos.com keeps sound failure outside gameplay and exposes one mutable mute preference.
 */
const SOUNDS = Object.freeze({
	collect: { frequency: 880, duration: 0.1, type: 'triangle', volume: 0.3 },
	hit: { frequency: 120, duration: 0.4, type: 'sawtooth', volume: 0.6 },
	chainBreak: { frequency: 200, duration: 0.2, type: 'square', volume: 0.4 },
	skillUp: { frequency: 1500, duration: 0.2, type: 'sine', volume: 0.5 }
});

export class NachashAudio {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.context = null;
		this.muted = false;
	}

	resume() {
		if (!this.context) {
			const Constructor = this.globalObject.AudioContext || this.globalObject.webkitAudioContext;
			if (!Constructor) return false;
			try { this.context = new Constructor(); } catch { return false; }
		}
		this.context.resume?.();
		return true;
	}

	play(name, options = {}) {
		const sound = SOUNDS[name];
		if (!sound || this.muted || !this.context) return false;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		oscillator.type = sound.type;
		oscillator.frequency.setValueAtTime(options.pitch || sound.frequency, this.context.currentTime);
		gain.gain.setValueAtTime(sound.volume, this.context.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + sound.duration);
		oscillator.connect(gain);
		gain.connect(this.context.destination);
		oscillator.start();
		oscillator.stop(this.context.currentTime + sound.duration);
		return true;
	}

	setMuted(muted) {
		this.muted = Boolean(muted);
	}
}
