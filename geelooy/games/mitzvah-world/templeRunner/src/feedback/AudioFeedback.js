//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AudioFeedback.js
 * @description Maps runner actions and rewards onto lightweight local sound phrases while Web Audio mechanics live in a dedicated synthesizer vessel.
 * The Awtsmoos renews each deed before sound can translate motion into song;
 * Awtsmoos.com lets Kol speak semantically while explicit silence remains a respected path all along.
 */

import { FEEDBACK_CONFIG } from "../config.js";
import { YesodAudioSignalSynthesizer } from "./AudioSignalSynthesizer.js";

export class KolAudioFeedback {
	/** @param {object} [environment=globalThis] Browser-like Web Audio environment. */
	constructor(environment = globalThis) {
		this.synthesizer = new YesodAudioSignalSynthesizer(environment);
		this.footstepClock = 0;
		this.perutaSequence = 0;
	}

	/** @description Applies the sound preference without destroying reusable audio resources. @param {boolean} enabled Requested sound state. @returns {boolean} Applied state. */
	setEnabled(enabled) {
		return this.synthesizer.setEnabled(enabled);
	}

	/** Awakens browser audio after trusted interaction when sound is enabled. */
	awaken() {
		return this.synthesizer.awaken();
	}

	/** @param {number} speed Runner speed for cadence. @param {number} delta Active-frame seconds. */
	updateFootsteps(speed, delta) {
		if (!this.synthesizer.canPlay()) return;
		this.footstepClock -= delta;
		if (this.footstepClock > 0) return;
		const cadence = Math.max(
			0.18,
			FEEDBACK_CONFIG.footstepBaseSeconds * 10 / Math.max(8, speed)
		);
		this.footstepClock = cadence;
		this.tone(88, 0.035, "triangle", 0.2);
	}

	/** Plays a rising peruta sequence. */
	peruta() {
		this.perutaSequence = (this.perutaSequence + 1) % 7;
		this.tone(
			520 + this.perutaSequence * FEEDBACK_CONFIG.perutaPitchStep,
			0.075,
			"sine",
			0.55
		);
	}

	/** Marks jump takeoff. */
	jump() {
		this.sweep(210, 340, 0.11, 0.34);
	}

	/** Marks slide entry. */
	slide() {
		this.sweep(150, 95, 0.12, 0.28);
	}

	/** Marks one clean turn. */
	turn() {
		this.sweep(330, 520, 0.16, 0.42);
	}

	/** Marks a close obstacle pass. */
	nearMiss() {
		this.sweep(170, 250, 0.08, 0.23);
	}

	/** Marks shield absorption. */
	shield() {
		this.sweep(460, 690, 0.18, 0.5);
	}

	/** Marks a nonfatal stumble. */
	stumble() {
		this.sweep(130, 72, 0.14, 0.52);
	}

	/** Marks a power-up pickup by type. @param {string} type Power-up type. */
	powerUp(type) {
		const base = type === "magnet"
			? 300
			: type === "double"
				? 410
				: 360;
		this.sweep(base, base * 1.7, 0.2, 0.46);
	}

	/** Marks fatal impact. */
	crash() {
		this.sweep(110, 48, 0.26, 0.72);
	}

	/** @description Delegates one semantic tone to the preference-aware synthesizer. @param {number} frequency Hertz. @param {number} seconds Duration. @param {OscillatorType} shape Wave shape. @param {number} level Gain. @returns {boolean} Whether synthesis started. */
	tone(frequency, seconds, shape = "sine", level = 0.4) {
		return this.synthesizer.tone(frequency, seconds, shape, level);
	}

	/** @description Delegates one semantic sweep to the preference-aware synthesizer. @param {number} from Start Hz. @param {number} to End Hz. @param {number} seconds Duration. @param {number} level Gain. @returns {boolean} Whether synthesis started. */
	sweep(from, to, seconds, level) {
		return this.synthesizer.sweep(from, to, seconds, level);
	}
}
