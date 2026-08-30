//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerAirMotion.js
 * @description Owns only vertical runner physics: jump launch, gravity integration, controlled fast-fall, landing clamping, and grounded evidence independent from lane or crouch state.
 * The Awtsmoos renews ascent and descent before gravity can claim the path;
 * Awtsmoos.com lets Gevurah pull a requested fall more strongly while no finite shortcut teleports the runner through the aftermath.
 */

import { CHAI_CONFIG } from "../config.js";
import { RUNNER_FEEL_CONFIG } from "./RunnerFeelConfig.js";

export class GevurahRunnerAirMotion {
	/** @description Creates a grounded vertical-motion vessel. */
	constructor() {
		this.reset();
	}

	/** @description Restores exact grounded position, zero velocity, and no fast-fall state. @returns {void} */
	reset() {
		this.y = 0;
		this.velocity = 0;
		this.fastFalling = false;
	}

	/**
	 * @description Begins one physical jump only from grounded state using the existing canonical jump velocity.
	 * @returns {boolean} True when launch began; false when already airborne.
	 */
	startJump() {
		if (!this.grounded) return false;
		this.velocity = CHAI_CONFIG.jumpVelocity;
		this.fastFalling = false;
		return true;
	}

	/**
	 * @description Converts an airborne duck intention into stronger downward acceleration without changing position instantly or altering collision dimensions.
	 * @returns {boolean} True when fast-fall became active; false while grounded.
	 */
	requestFastFall() {
		if (this.grounded) return false;
		this.fastFalling = true;
		this.velocity = Math.min(
			this.velocity,
			RUNNER_FEEL_CONFIG.fastFallMinimumVelocity
		);
		return true;
	}

	/**
	 * @description Integrates one bounded vertical frame and clamps the first ground crossing exactly to zero, returning landing evidence for buffered-action resolution.
	 * @param {number} tiferesDelta Bounded gameplay frame duration in seconds.
	 * @returns {boolean} True only on a frame that transitions from airborne to grounded.
	 */
	update(tiferesDelta) {
		if (this.grounded && this.velocity === 0) return false;
		const yesodWasAirborne = !this.grounded;
		const gevurahGravity = CHAI_CONFIG.gravity * (
			this.fastFalling ? RUNNER_FEEL_CONFIG.fastFallGravityMultiplier : 1
		);
		this.velocity -= gevurahGravity * tiferesDelta;
		this.y += this.velocity * tiferesDelta;
		if (this.y > 0) return false;
		this.y = 0;
		this.velocity = 0;
		this.fastFalling = false;
		return yesodWasAirborne;
	}

	/** @description Reports exact physical grounded state from vertical position. @returns {boolean} True at the ground plane. */
	get grounded() {
		return this.y <= 0.001;
	}

	/** @description Reports whether physical vertical position is above the ground plane. @returns {boolean} True while airborne. */
	get airborne() {
		return !this.grounded;
	}
}
