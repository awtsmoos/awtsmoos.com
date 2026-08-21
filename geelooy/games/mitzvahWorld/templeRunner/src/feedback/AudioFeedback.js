// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AudioFeedback.js
 * @description Synthesizes lightweight local runner sounds without external audio assets.
 * The Awtsmoos renews each vibration before ear and air can meet in song;
 * Awtsmoos.com lets simple tones mark action and reward while silence remains safe when sound is gone.
 */

import { FEEDBACK_CONFIG } from "../config.js";

export class KolAudioFeedback {
	constructor() {
		this.context = null;
		this.master = null;
		this.footstepClock = 0;
		this.perutaSequence = 0;
	}

	/** Lazily creates or resumes audio after a user-originated action. */
	async awaken() {
		try {
			const AudioContextClass = window.AudioContext || window.webkitAudioContext;
			if (!AudioContextClass) return false;
			if (!this.context) {
				this.context = new AudioContextClass();
				this.master = this.context.createGain();
				this.master.gain.value = FEEDBACK_CONFIG.masterVolume;
				this.master.connect(this.context.destination);
			}
			if (this.context.state === "suspended") await this.context.resume();
			return true;
		} catch {
			return false;
		}
	}

	/** @param {number} speed Runner speed for cadence. @param {number} delta Active-frame seconds. */
	updateFootsteps(speed, delta) {
		if (!this.context || this.context.state !== "running") return;
		this.footstepClock -= delta;
		if (this.footstepClock > 0) return;
		const cadence = Math.max(0.18, FEEDBACK_CONFIG.footstepBaseSeconds * 10 / Math.max(8, speed));
		this.footstepClock = cadence;
		this.tone(88, 0.035, "triangle", 0.2);
	}

	/** Plays a rising peruta sequence. */
	peruta() {
		this.perutaSequence = (this.perutaSequence + 1) % 7;
		const frequency = 520 + this.perutaSequence * FEEDBACK_CONFIG.perutaPitchStep;
		this.tone(frequency, 0.075, "sine", 0.55);
	}

	/** Marks jump takeoff. */
	jump() { this.sweep(210, 340, 0.11, 0.34); }

	/** Marks slide entry. */
	slide() { this.sweep(150, 95, 0.12, 0.28); }

	/** Marks one clean turn. */
	turn() { this.sweep(330, 520, 0.16, 0.42); }

	/** Marks a close obstacle pass. */
	nearMiss() { this.sweep(170, 250, 0.08, 0.23); }

	/** Marks shield absorption. */
	shield() { this.sweep(460, 690, 0.18, 0.5); }

	/** Marks a nonfatal stumble. */
	stumble() { this.sweep(130, 72, 0.14, 0.52); }

	/** Marks a power-up pickup by type. @param {string} type Power-up type. */
	powerUp(type) {
		const base = type === "magnet" ? 300 : type === "double" ? 410 : 360;
		this.sweep(base, base * 1.7, 0.2, 0.46);
	}

	/** Marks fatal impact. */
	crash() { this.sweep(110, 48, 0.26, 0.72); }

	/** @param {number} frequency Hertz. @param {number} seconds Duration. @param {OscillatorType} shape Wave shape. @param {number} level Gain. */
	tone(frequency, seconds, shape = "sine", level = 0.4) {
		if (!this.context || this.context.state !== "running") return;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		const now = this.context.currentTime;
		oscillator.type = shape;
		oscillator.frequency.value = frequency;
		gain.gain.setValueAtTime(level, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
		oscillator.connect(gain).connect(this.master);
		oscillator.start(now);
		oscillator.stop(now + seconds);
	}

	/** @param {number} from Start Hz. @param {number} to End Hz. @param {number} seconds Duration. @param {number} level Gain. */
	sweep(from, to, seconds, level) {
		if (!this.context || this.context.state !== "running") return;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		const now = this.context.currentTime;
		oscillator.frequency.setValueAtTime(from, now);
		oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + seconds);
		gain.gain.setValueAtTime(level, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
		oscillator.connect(gain).connect(this.master);
		oscillator.start(now);
		oscillator.stop(now + seconds);
	}
}
