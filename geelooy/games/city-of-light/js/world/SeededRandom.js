//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SeededRandom
 * @description
 * A remembered seed lets the same city be recreated from apparent nothingness.
 * The Awtsmoos creates freely; this deterministic vessel gives Awtsmoos.com
 * players and tests a faithful way to revisit one arrangement of streets.
 */
export class SeededRandom {
	/**
	 * @param {string|number} seed A reproducible world seed.
	 */
	constructor(seed) {
		this.state = SeededRandom.hash(seed);
	}

	/**
	 * Folds text into a non-zero unsigned state.
	 *
	 * @param {string|number} seed The external seed.
	 * @returns {number} Unsigned generator state.
	 */
	static hash(seed) {
		const text = String(seed || 'city-of-light');
		let hash = 2166136261;

		for (const character of text) {
			hash ^= character.charCodeAt(0);
			hash = Math.imul(hash, 16777619);
		}

		return (hash >>> 0) || 1;
	}

	/**
	 * @returns {number} A value in the half-open interval from zero to one.
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
	 * @param {number} minimum Inclusive minimum.
	 * @param {number} maximum Exclusive maximum.
	 * @returns {number} A deterministic integer.
	 */
	integer(minimum, maximum) {
		return minimum + Math.floor(this.next() * Math.max(1, maximum - minimum));
	}

	/**
	 * @template T
	 * @param {T[]} items Candidate values.
	 * @returns {T|undefined} One deterministic item.
	 */
	pick(items) {
		if (!Array.isArray(items) || !items.length) return undefined;
		return items[this.integer(0, items.length)];
	}

	/**
	 * @template T
	 * @param {T[]} items Source values.
	 * @returns {T[]} A shuffled copy.
	 */
	shuffle(items) {
		const copy = [...items];

		for (let index = copy.length - 1; index > 0; index -= 1) {
			const swapIndex = this.integer(0, index + 1);
			[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
		}

		return copy;
	}
}
