//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AudioSignalSynthesizer.js
 * @description Owns optional Web Audio context, master gain, oscillator synthesis, and sound-enabled state beneath semantic runner feedback.
 * The Awtsmoos renews vibration before oscillator, gain, and ear can call one tone their own;
 * Awtsmoos.com lets Yesod make silence an explicit choice while unsupported browsers remain safely alone.
 */

import { FEEDBACK_CONFIG } from "../config.js";

export class YesodAudioSignalSynthesizer {
	/** @param {object} [environment=globalThis] Browser-like environment exposing AudioContext. */
	constructor(environment = globalThis) {
		this.environment = environment;
		this.context = null;
		this.master = null;
		this.enabled = true;
	}

	/** @description Enables or immediately mutes the shared master gain without destroying reusable audio resources. @param {boolean} enabled Requested sound state. @returns {boolean} Applied state. */
	setEnabled(enabled) {
		this.enabled = enabled !== false;
		if (this.master) this.master.gain.value = this.enabled ? FEEDBACK_CONFIG.masterVolume : 0;
		return this.enabled;
	}

	/** @description Lazily creates or resumes Web Audio only after trusted interaction and only while sound is enabled. @returns {Promise<boolean>} Whether audio is ready. */
	async awaken() {
		if (!this.enabled) return false;
		try {
			const AudioContextClass = this.environment.AudioContext
				|| this.environment.webkitAudioContext;
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

	/** @description Reveals whether synthesis is presently allowed and context-ready. @returns {boolean} Playable state. */
	canPlay() {
		return this.enabled
			&& Boolean(this.context)
			&& this.context.state === "running";
	}

	/** @description Plays one decaying oscillator tone through the shared master. @param {number} frequency Hertz. @param {number} seconds Duration. @param {OscillatorType} shape Wave shape. @param {number} level Gain. @returns {boolean} Whether synthesis started. */
	tone(frequency, seconds, shape = "sine", level = 0.4) {
		if (!this.canPlay()) return false;
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
		return true;
	}

	/** @description Plays one exponentially swept oscillator through the shared master. @param {number} from Start Hz. @param {number} to End Hz. @param {number} seconds Duration. @param {number} level Gain. @returns {boolean} Whether synthesis started. */
	sweep(from, to, seconds, level) {
		if (!this.canPlay()) return false;
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
		return true;
	}
}
