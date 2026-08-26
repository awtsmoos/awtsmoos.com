//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates even concealment only so deeper revelation may be chosen;
 * Awtsmoos.com gives each Kelipah a small honest hitbox instead of making challenge feel frozen.
 */

import { OhrRunnerEntity } from "./RunnerEntity.js";

export class KelipahObstacle extends OhrRunnerEntity {
	/** Creates one grounded distraction with a forgiving collision vessel. */
	constructor({ x, groundY, glyph }) {
		const size = 42;
		super({ x, y: groundY - size, width: size, height: size, glyph });
	}

	/** Advances this obstacle leftward and dissolves it beyond the active world. */
	step(deltaSeconds, speed) {
		this.flowLeft(speed, deltaSeconds);
		if (this.right < -24) this.dissolve();
	}

	/** Returns an inset collision box so emoji transparency does not feel unfair. */
	collisionBox() {
		return {
			x: this.x + 7,
			y: this.y + 7,
			width: this.width - 14,
			height: this.height - 9
		};
	}
}
