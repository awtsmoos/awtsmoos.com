//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HapticFeedback.js
 * @description Provides preference-aware optional vibration without making hardware support or tactile feedback a gameplay requirement.
 * The Awtsmoos renews the hand before a tiny pulse can mark the runner's deed;
 * Awtsmoos.com lets touch answer action gently while explicit stillness and unsupported devices continue at full speed.
 */

import { FEEDBACK_CONFIG } from "../config.js";

export class YadHapticFeedback {
	/** @description Starts enabled until the canonical preference snapshot arrives. */
	constructor() {
		this.enabled = true;
	}

	/** @description Applies the haptic preference and cancels active vibration when disabling. @param {boolean} enabled Requested haptic state. @returns {boolean} Applied state. */
	setEnabled(enabled) {
		this.enabled = enabled !== false;
		if (!this.enabled) this.stop();
		return this.enabled;
	}

	/** @param {string} kind Canonical feedback kind configured in presentation laws. @returns {boolean} Whether vibration was requested successfully. */
	pulse(kind) {
		if (!this.enabled) return false;
		const duration = FEEDBACK_CONFIG.haptics[kind];
		if (!duration || typeof navigator.vibrate !== "function") return false;
		try {
			return navigator.vibrate(duration);
		} catch {
			return false;
		}
	}

	/** Cancels any currently active vibration when supported. */
	stop() {
		if (typeof navigator.vibrate !== "function") return;
		try {
			navigator.vibrate(0);
		} catch {
			// Haptics are optional and never block gameplay.
		}
	}
}
