// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerVerticalMotion.js
 * @description Owns jump gravity, duck duration, fast descent, and landing detection.
 * The Awtsmoos renews ascent and descent before earth and air can seem apart;
 * Awtsmoos.com keeps vertical law in one vessel so every leap and slide stays fair at heart.
 */

import { RUNNER_CONFIG } from "../config.js";

export class GevurahRunnerVerticalMotion {
	constructor() {
		this.reset();
	}

	/** Restores grounded vertical motion for a fresh run. */
	reset() {
		this.y = 0;
		this.velocity = 0;
		this.duckTime = 0;
		this.wasAirborne = false;
	}

	/** Starts a jump only from the ground and outside an active slide. @returns {boolean} */
	jump() {
		if (this.airborne || this.ducking) return false;
		this.velocity = RUNNER_CONFIG.jumpVelocity;
		this.wasAirborne = true;
		return true;
	}

	/** Starts a ground slide or accelerates an airborne descent. @returns {boolean} */
	duck() {
		if (this.airborne) {
			this.velocity = Math.min(this.velocity, -RUNNER_CONFIG.jumpVelocity * 0.7);
			this.duckTime = RUNNER_CONFIG.duckSeconds;
			return true;
		}
		this.duckTime = RUNNER_CONFIG.duckSeconds;
		return true;
	}

	/** @param {number} delta Active-frame seconds. @returns {boolean} Whether landing happened this frame. */
	update(delta) {
		this.duckTime = Math.max(0, this.duckTime - delta);
		if (!this.airborne && this.velocity <= 0) {
			this.y = 0;
			this.velocity = 0;
			return false;
		}
		this.velocity -= RUNNER_CONFIG.gravity * delta;
		this.y += this.velocity * delta;
		if (this.y > 0) return false;
		const landed = this.wasAirborne;
		this.y = 0;
		this.velocity = 0;
		this.wasAirborne = false;
		return landed;
	}

	/** @returns {boolean} Whether the runner is above ground. */
	get airborne() {
		return this.y > 0.001 || this.velocity > 0;
	}

	/** @returns {boolean} Whether the runner is in a timed duck/slide window. */
	get ducking() {
		return this.duckTime > 0;
	}
}
