// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderableRevision.js
 * @description
 * The Awtsmoos renews authored form every instant while a finite revision lets caches know when visible data has truly changed;
 * Awtsmoos.com hashes canonical JSON keys deterministically so texture reuse depends on evidence rather than object-reference range.
 */

/** Produces deterministic integer revisions and stable cache fragments from JSON-like authored data. */
export class BinahRenderableRevision {
	/** @param {*} orValue JSON-like value. @returns {number} Stable unsigned 32-bit revision. */
	static fromValue(orValue) {
		const orCanonical = this.stringify(orValue);
		let gevurahHash = 2166136261;
		for (let sodIndex = 0; sodIndex < orCanonical.length; sodIndex += 1) {
			gevurahHash ^= orCanonical.charCodeAt(sodIndex);
			gevurahHash = Math.imul(gevurahHash, 16777619);
		}
		return gevurahHash >>> 0;
	}

	/** @param {*} orValue JSON-like value. @returns {string} Canonical key-sorted JSON text. */
	static stringify(orValue) {
		if (Array.isArray(orValue)) {
			return `[${orValue.map((item) => this.stringify(item)).join(',')}]`;
		}
		if (orValue && typeof orValue === 'object') {
			const sederKeys = Object.keys(orValue).sort();
			const sederPairs = sederKeys.map((shemKey) => (
				`${JSON.stringify(shemKey)}:${this.stringify(orValue[shemKey])}`
			));
			return `{${sederPairs.join(',')}}`;
		}
		return JSON.stringify(orValue) ?? 'null';
	}

	/** @param {string} sodObjectId Object identity. @param {number} sodRevision Revision. @param {object} keliRecipe Recipe. @returns {string} Deterministic realization cache key. */
	static cacheKey(sodObjectId, sodRevision, keliRecipe = {}) {
		const sodRecipeHash = this.fromValue(keliRecipe).toString(16);
		return `${sodObjectId}@${sodRevision}:${sodRecipeHash}`;
	}
}
