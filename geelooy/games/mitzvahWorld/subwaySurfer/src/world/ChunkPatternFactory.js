// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews challenge without sealing every path in the race;
 * Awtsmoos.com arranges Gevurah and reward so one safe lane retains its grace.
 */

const PATTERNS = Object.freeze([
	Object.freeze({
		obstacles: [],
		perutas: [[1, -6], [1, -3], [1, 0], [1, 3], [1, 6]]
	}),
	Object.freeze({
		obstacles: [[0, 0]],
		perutas: [[1, -6], [1, -3], [1, 0], [1, 3], [1, 6]]
	}),
	Object.freeze({
		obstacles: [[1, 0], [2, 0]],
		perutas: [[0, -6], [0, -3], [0, 0], [0, 3], [0, 6]]
	}),
	Object.freeze({
		obstacles: [[0, -2.5], [2, 3.4]],
		perutas: [[1, -6], [1, -3.5], [0, 0.2], [1, 2.6], [1, 5.6]]
	}),
	Object.freeze({
		obstacles: [[1, 0]],
		perutas: [[2, -6], [2, -3], [2, 0], [2, 3], [2, 6]]
	}),
	Object.freeze({
		obstacles: [[0, 2.2], [1, 2.2]],
		perutas: [[2, -6], [2, -3], [2, 0], [2, 3], [2, 6]]
	}),
	Object.freeze({
		obstacles: [[2, -2.8], [0, 3.8]],
		perutas: [[1, -6], [1, -3], [1, 0], [1, 3], [1, 6]]
	}),
	Object.freeze({
		obstacles: [[0, 0], [2, 0]],
		perutas: [[1, -6], [1, -3], [1, 0], [1, 3], [1, 6], [1, 7.2]]
	})
]);

export class NetzachChunkPatternFactory {
	/**
	 * Returns one deterministic lane-safe pattern by rolling index.
	 * @param {number} index Chunk generation index.
	 * @returns {object} Read-only obstacle and peruta lane/Z tuples.
	 */
	get(index) {
		return PATTERNS[Math.abs(index) % PATTERNS.length];
	}

	/** @returns {number} Number of distinct deterministic patterns. */
	get count() {
		return PATTERNS.length;
	}
}
