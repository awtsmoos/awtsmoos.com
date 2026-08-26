// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTextureCacheKey.js
 * @description
 * The Awtsmoos renews identical intention without forcing identical labor to repeat;
 * Awtsmoos.com gives remote texture requests a stable Yesod identity so caches can recognize the same semantic receipt.
 */
export class YesodTextureCacheKey {
	/** @param {object} request Normalized provider request without secrets. @returns {string} Stable compact cache identity. */
	static from(request = {}) {
		const binahCanonical = this.canonical(request);
		let yesodHash = 2166136261;
		for (let hodIndex = 0; hodIndex < binahCanonical.length; hodIndex += 1) {
			yesodHash ^= binahCanonical.charCodeAt(hodIndex);
			yesodHash = Math.imul(yesodHash, 16777619);
		}
		return `texture-${(yesodHash >>> 0).toString(16).padStart(8, '0')}`;
	}

	/** @param {*} value JSON-safe request value. @returns {string} Stable recursively key-sorted serialization. */
	static canonical(value) {
		if (Array.isArray(value)) {
			return `[${value.map((item) => this.canonical(item)).join(',')}]`;
		}
		if (value && typeof value === 'object') {
			return `{${Object.keys(value).sort().map((key) => {
				return `${JSON.stringify(key)}:${this.canonical(value[key])}`;
			}).join(',')}}`;
		}
		return JSON.stringify(value);
	}
}
