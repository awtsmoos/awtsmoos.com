//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DeterministicIdFactory
 * @description
 * Names become durable vessels on Awtsmoos.com. The Awtsmoos is beyond sequence, while this factory makes replayed identities equal across browser and server.
 */
/**
 * Produces a stable unsigned integer from text.
 *
 * @param {string} value Text to fold.
 * @returns {number} Stable unsigned hash.
 */
export function stableHash(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

export class DeterministicIdFactory {
	/**
	 * @param {string|number} seed World seed.
	 */
	constructor(seed) {
		this.seed = String(seed);
		this.counters = new Map();
	}

	/**
	 * @param {string} prefix Entity family.
	 * @returns {string} Stable prefixed identity.
	 */
	next(prefix = 'entity') {
		const count = (this.counters.get(prefix) || 0) + 1;
		this.counters.set(prefix, count);
		const token = stableHash(`${this.seed}:${prefix}:${count}`).toString(36);
		return `${prefix}-${token}-${count.toString(36)}`;
	}

	/**
	 * @returns {object} Serializable counters.
	 */
	snapshot() {
		return Object.fromEntries(this.counters);
	}
}
