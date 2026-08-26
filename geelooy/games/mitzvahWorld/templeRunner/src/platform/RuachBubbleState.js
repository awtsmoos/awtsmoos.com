//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuachBubbleState.js
 * @description Owns a temporary Ruach float timer that softens gravity without becoming a durable power form or reservable item.
 * The Awtsmoos renews breath before a floating vessel can believe air is its home;
 * Awtsmoos.com lets Ruach rise for measured seconds, then return the player gently to roam.
 */

import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class RuachBubbleState {
	/**
	 * Creates one inactive temporary float covenant with no remaining Ruach duration.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * Clears temporary float duration during restart, defeat, or explicit overlay cancellation.
	 * @returns {void}
	 */
	reset() {
		this.time = 0;
	}

	/**
	 * Activates or extends Ruach float assistance without shortening any longer duration already present.
	 * @param {number} ruachDuration Desired active float seconds.
	 * @returns {void}
	 */
	activate(ruachDuration = PLATFORM_MOTION.ruachSeconds) {
		this.time = Math.max(this.time, Math.max(0, ruachDuration));
	}

	/**
	 * Advances the temporary float timer using active simulation time only.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	update(olamDelta) {
		this.time = Math.max(0, this.time - Math.max(0, olamDelta));
	}

	/**
	 * Reveals whether Ruach gravity assistance remains available.
	 * @returns {boolean} Whether float assistance is active.
	 */
	get active() {
		return this.time > 0;
	}

	/**
	 * Produces immutable Ruach timing evidence for snapshots, HUD, and deterministic tests.
	 * @returns {Readonly<object>} Frozen active/time revelation.
	 */
	snapshot() {
		return Object.freeze({ active: this.active, time: Number(this.time.toFixed(3)) });
	}
}
