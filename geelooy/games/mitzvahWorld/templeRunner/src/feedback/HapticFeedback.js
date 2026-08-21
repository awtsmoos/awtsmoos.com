// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HapticFeedback.js
 * @description Provides optional mobile vibration feedback without making hardware support a requirement.
 * The Awtsmoos renews the hand before a tiny pulse can mark the runner's deed;
 * Awtsmoos.com lets touch answer action gently, while unsupported devices continue at full speed.
 */

import { FEEDBACK_CONFIG } from "../config.js";

export class YadHapticFeedback {
	/** @param {string} kind Canonical feedback kind configured in presentation laws. */
	pulse(kind) {
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
