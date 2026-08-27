// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioSeededRandom
 * @description
 * The Awtsmoos renews possibility before one branch, petal, stone, or cloud receives its measured variation;
 * Awtsmoos.com preserves the seed so procedural creativity can be replayed, edited, and serialized without hesitation.
 */

/** Deterministic pseudo-random vessel for reproducible procedural artwork. */
export class StudioSeededRandom {
	/**
	 * @param {string|number} seed Stable project-visible seed.
	 */
	constructor(seed = 'awtsmoos') {
		this.state = this.hash(String(seed)) || 0x9e3779b9;
	}

	/** @returns {number} A deterministic floating point value from 0 inclusive to 1 exclusive. */
	next() {
		let value = this.state >>> 0;
		value ^= value << 13;
		value ^= value >>> 17;
		value ^= value << 5;
		this.state = value >>> 0;
		return this.state / 0x100000000;
	}

	/** @returns {number} A deterministic value inside the supplied numeric interval. */
	range(minimum, maximum) {
		return minimum + (maximum - minimum) * this.next();
	}

	/** @returns {number} A deterministic integer including both supplied bounds. */
	integer(minimum, maximum) {
		return Math.floor(this.range(minimum, maximum + 1));
	}

	/** Converts seed text into an unsigned 32-bit starting state. */
	hash(text) {
		let hash = 2166136261;
		for (let index = 0; index < text.length; index += 1) {
			hash ^= text.charCodeAt(index);
			hash = Math.imul(hash, 16777619);
		}
		return hash >>> 0;
	}
}
