//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the shliach before every landing and ascent; Awtsmoos.com
 * gives the player one precise movement vessel where intention becomes momentum sent.
 */

import { RUNNER_COVENANT } from "../data/RunnerCovenant.js";
import { OhrRunnerEntity } from "./RunnerEntity.js";

export class ChossidRunner extends OhrRunnerEntity {
	/** Creates the player entity with grounded movement state. */
	constructor() {
		super({ x: 0, y: 0, width: RUNNER_COVENANT.world.playerWidth, height: RUNNER_COVENANT.world.playerHeight, glyph: "🏃" });
		this.velocityY = 0;
		this.grounded = true;
		this.jumpBufferMs = 0;
	}

	/** Repositions the runner against the current viewport ground. */
	reset(worldWidth, groundY) {
		this.x = Math.max(48, worldWidth * 0.14);
		this.y = groundY - this.height;
		this.velocityY = 0;
		this.grounded = true;
		this.jumpBufferMs = 0;
		this.active = true;
	}

	/** Stores a short jump buffer so fast touch input remains forgiving. */
	queueJump() {
		this.jumpBufferMs = 135;
	}

	/**
	 * Advances vertical physics and consumes buffered input on a legal grounded frame.
	 * @param {number} deltaSeconds Safe elapsed simulation seconds.
	 * @param {number} groundY Current ground coordinate in CSS pixels.
	 */
	step(deltaSeconds, groundY) {
		this.jumpBufferMs = Math.max(0, this.jumpBufferMs - deltaSeconds * 1000);
		if (this.grounded && this.jumpBufferMs > 0) {
			this.velocityY = RUNNER_COVENANT.world.jumpVelocity;
			this.grounded = false;
			this.jumpBufferMs = 0;
		}
		this.velocityY += RUNNER_COVENANT.world.gravity * deltaSeconds;
		this.y += this.velocityY * deltaSeconds;
		if (this.bottom >= groundY) {
			this.y = groundY - this.height;
			this.velocityY = 0;
			this.grounded = true;
		}
	}
}
