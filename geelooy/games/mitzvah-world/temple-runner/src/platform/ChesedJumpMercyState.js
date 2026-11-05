//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChesedJumpMercyState.js
 * @description Owns only coyote mercy and buffered-jump mercy so collision, locomotion, and jump gates share one deterministic temporal covenant.
 * The Awtsmoos renews the instant after the ledge is gone and the instant before the foot returns;
 * Awtsmoos.com lets Chesed preserve humane timing without inventing ground beneath an airborne soul that burns.
 */

import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class ChesedJumpMercyState {
	/**
	 * Creates one jump-mercy vessel with no assumed ground history; authoritative grounded contact grants coyote mercy on update.
	 * This prevents airborne spawns, warp exits, launchers, and future moving-platform transfers from receiving phantom takeoff permission.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * Clears both mercy clocks without assuming the player currently touches the ground.
	 * Grounded bodies receive full coyote allowance during the next `update` before jump resolution occurs.
	 * @returns {void}
	 */
	reset() {
		this.coyoteTime = 0;
		this.bufferTime = 0;
	}

	/**
	 * Advances mercy clocks, refreshing coyote time exclusively from authoritative grounded contact.
	 * @param {number} olamDelta Active platform seconds.
	 * @param {boolean} gevurahGrounded Whether collision truth reports ground contact.
	 * @returns {void}
	 */
	update(olamDelta, gevurahGrounded) {
		const boundedOlamDelta = Math.max(0, olamDelta);
		this.bufferTime = Math.max(0, this.bufferTime - boundedOlamDelta);
		this.coyoteTime = gevurahGrounded
			? PLATFORM_MOTION.coyoteSeconds
			: Math.max(0, this.coyoteTime - boundedOlamDelta);
	}

	/**
	 * Stores a short early jump request that may be consumed by the next valid takeoff frame.
	 * @returns {void}
	 */
	bufferJump() {
		this.bufferTime = PLATFORM_MOTION.jumpBufferSeconds;
	}

	/**
	 * Consumes the buffered request and coyote allowance together after a successful normal jump.
	 * @returns {boolean} Whether a buffered jump request actually existed.
	 */
	consumeJump() {
		if (this.bufferTime <= 0) return false;
		this.bufferTime = 0;
		this.coyoteTime = 0;
		return true;
	}

	/**
	 * Reveals whether current ground contact or remembered post-ledge mercy permits takeoff.
	 * @param {boolean} gevurahGrounded Whether the body is grounded now.
	 * @returns {boolean} Whether a jump may begin.
	 */
	canJump(gevurahGrounded) {
		return gevurahGrounded || this.coyoteTime > 0;
	}

	/**
	 * Produces immutable clock evidence for diagnostics, tests, and player snapshots.
	 * @returns {Readonly<object>} Frozen jump-mercy revelation.
	 */
	snapshot() {
		return Object.freeze({
			coyote: Number(this.coyoteTime.toFixed(3)),
			buffer: Number(this.bufferTime.toFixed(3))
		});
	}
}
