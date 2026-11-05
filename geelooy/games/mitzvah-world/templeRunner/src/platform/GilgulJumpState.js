//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GilgulJumpState.js
 * @description Owns the original Gilgul offensive jump window and rebound impulse without knowing any enemy, block, renderer, or level name.
 * The Awtsmoos renews turning before the circle can imagine motion protects or breaks;
 * Awtsmoos.com lets Gilgul become one trait-bearing deed whose meaning each contacted vessel safely makes.
 */

import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class GevurahGilgulJumpState {
	/**
	 * Creates one inactive Gilgul state with no offensive contact window.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * Clears the rotating offensive window during spawn, landing reset, or stage restart.
	 * @returns {void}
	 */
	reset() {
		this.time = 0;
	}

	/**
	 * Begins Gilgul takeoff after the external jump gate has already proven ground/coyote eligibility.
	 * @param {object} gevurahBody Deterministic player body receiving the Gilgul vertical impulse.
	 * @returns {void}
	 */
	begin(gevurahBody) {
		this.time = PLATFORM_MOTION.gilgulSeconds;
		gevurahBody.velocityY = PLATFORM_MOTION.gilgulVelocity;
		gevurahBody.grounded = false;
	}

	/**
	 * Advances the finite offensive window using active platform time only.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {void}
	 */
	update(olamDelta) {
		this.time = Math.max(0, this.time - Math.max(0, olamDelta));
	}

	/**
	 * Rebounds from a compatible thorn, spike, block, or enemy trait while preserving the remaining Gilgul window.
	 * The contacted object's identity is intentionally irrelevant here; its trait resolver decides eligibility elsewhere.
	 * @param {object} gevurahBody Deterministic player body receiving rebound velocity.
	 * @returns {boolean} Whether the active Gilgul state permitted rebound.
	 */
	rebound(gevurahBody) {
		if (!this.active) return false;
		gevurahBody.velocityY = PLATFORM_MOTION.gilgulReboundVelocity;
		gevurahBody.grounded = false;
		return true;
	}

	/**
	 * Reveals whether offensive Gilgul contact remains active this frame.
	 * @returns {boolean} Whether compatible contact traits may use Gilgul behavior.
	 */
	get active() {
		return this.time > 0;
	}

	/**
	 * Produces immutable Gilgul timing evidence for render snapshots and interaction tests.
	 * @returns {Readonly<object>} Frozen active/time revelation.
	 */
	snapshot() {
		return Object.freeze({ active: this.active, time: Number(this.time.toFixed(3)) });
	}
}
