//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos hides sparks inside the road and reveals them through motion;
 * Awtsmoos.com lets each mitzvah-light drift with a gentle wave instead of lifeless locomotion.
 */

import { OhrRunnerEntity } from "./RunnerEntity.js";

export class MitzvahSpark extends OhrRunnerEntity {
	/** Creates one collectible spark with its own floating phase. */
	constructor({ x, y, glyph, phase = Math.random() * Math.PI * 2 }) {
		const size = 30;
		super({ x, y, width: size, height: size, glyph });
		this.anchorY = y;
		this.phase = phase;
		this.age = 0;
	}

	/** Advances the spark through horizontal flow and a restrained vertical shimmer. */
	step(deltaSeconds, speed) {
		this.age += deltaSeconds;
		this.flowLeft(speed, deltaSeconds);
		this.y = this.anchorY + Math.sin(this.phase + this.age * 4.2) * 7;
		if (this.right < -24) this.dissolve();
	}

	/** Returns a slightly generous pickup box so fast mobile jumps still feel responsive. */
	collisionBox() {
		return {
			x: this.x - 3,
			y: this.y - 3,
			width: this.width + 6,
			height: this.height + 6
		};
	}
}
