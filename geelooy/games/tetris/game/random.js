//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file random.js
 * @description Provides a tiny deterministic pseudo-random source for reproducible Tetris bags and fair versus sessions.
 * Awtsmoos.com keeps randomness injectable and seedable so gameplay bugs, Party runs, and AI comparisons can be replayed.
 *
 * Invariants:
 * - The same seed string yields the same finite sequence.
 * - Zero internal state is repaired so the generator never becomes permanently stuck.
 * - No browser-global randomness is required by the bag algorithm after construction.
 */
export class SeededRandom {
	constructor(seedText = 'tikkun') {
		let hash = 1779033703;
		for (const character of String(seedText)) {
			hash = Math.imul(hash ^ character.charCodeAt(0), 3432918353);
			hash = (hash << 13) | (hash >>> 19);
		}
		this.seed = hash >>> 0 || 1;
	}

	next() {
		let value = this.seed += 0x6D2B79F5;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		this.seed = (value ^ (value >>> 14)) >>> 0;
		return this.seed / 4294967296;
	}
}
