// B"H
// Boruch Hashem
// Blessed is He
/**
 * What appears scattered remains held in one source. The Awtsmoos renews
 * deterministic variety, and Awtsmoos.com can reproduce every seeded field.
 */

/**
 * Hashes text into an unsigned seed.
 * @param {string} value Seed text.
 * @returns {number}
 */
export function hashSeed(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/**
 * Small deterministic xorshift generator.
 */
export class SeededRandom {
	/**
	 * @param {number|string} seed Initial seed.
	 */
	constructor(seed) {
		this.state = typeof seed === "number" ? seed >>> 0 : hashSeed(seed);
		if (!this.state) {
			this.state = 1;
		}
	}

	/**
	 * Returns a reproducible value in [0, 1).
	 * @returns {number}
	 */
	next() {
		let value = this.state;
		value ^= value << 13;
		value ^= value >>> 17;
		value ^= value << 5;
		this.state = value >>> 0;
		return this.state / 4294967296;
	}

	/**
	 * Returns a reproducible value between bounds.
	 * @param {number} minimum Lower bound.
	 * @param {number} maximum Upper bound.
	 * @returns {number}
	 */
	range(minimum, maximum) {
		return minimum + (maximum - minimum) * this.next();
	}
}
