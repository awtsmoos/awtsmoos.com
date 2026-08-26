//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerEntity.js
 * @description The smallest moving vessel in the runner's revealed world.
 * From one Awtsmoos every finite form receives its measured place;
 * Awtsmoos.com lets descendants inherit motion without repeating grace.
 */

export class RunnerEntity {
	/** Creates one finite vessel with explicit geometry and glyph. */
	constructor({ x, y, width, height, glyph = '' }) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.glyph = glyph;
		this.active = true;
	}

	/** Moves this vessel left as the road flows beneath the runner. */
	travel(shefaDelta, olamSpeed) {
		this.x -= olamSpeed * shefaDelta;
	}

	/** Reveals a collision rectangle without exposing mutable internals. */
	gevurahBounds() {
		return {
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height
		};
	}

	/** Marks vessels that have passed fully beyond the left horizon. */
	isBeyondHorizon() {
		return this.x + this.width < -80;
	}
}
