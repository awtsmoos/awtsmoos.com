// B"H
// Boruch Hashem
// Blessed is He

/**
 * A deterministic random vessel: every stream is named, reproducible, and
 * isolated, as distinct branches reveal one source without stealing state.
 */
export class TreeRNG {
	/**
	 * @param {number|string} seed Stable seed.
	 */
	constructor(seed = 12345) {
		this.seed = normalizeTreeSeed(seed);
		this.state = this.seed || 12345;
	}

	/**
	 * @param {number} min Inclusive lower range.
	 * @param {number} max Exclusive upper range.
	 * @returns {number} Deterministic sample.
	 */
	random(min = 0, max = 1) {
		this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
		return min + (this.state / 4294967296) * (max - min);
	}

	/**
	 * Creates an independent stream without consuming this stream.
	 * @param {string} label Stream identity.
	 * @returns {TreeRNG} Forked stream.
	 */
	fork(label) {
		return new TreeRNG(`${this.seed}:${label}`);
	}
}

/**
 * @param {number|string} seed Seed-like value.
 * @returns {number} Unsigned deterministic seed.
 */
export function normalizeTreeSeed(seed) {
	if (Number.isFinite(Number(seed))) {
		return Number(seed) >>> 0;
	}
	let hash = 2166136261;
	for (const character of String(seed)) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
