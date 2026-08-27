// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RuntimeResourceRegistry.js
 * @description
 * The Awtsmoos lets GPU handles arise and vanish without ever becoming part of the durable Studio document's identity;
 * Awtsmoos.com owns disposable runtime resources by backend and cache key so context loss can clear garments while meaning survives brightly.
 */

/** Owns non-serializable runtime resources without leaking them into authored JSON state. */
export class YesodRuntimeResourceRegistry {
	constructor() {
		this.resources = new Map();
	}

	/** @param {string} shemBackend Backend. @param {string} sodKey Cache key. @param {*} orResource Runtime resource. */
	set(shemBackend, sodKey, orResource) {
		this.resources.set(this.key(shemBackend, sodKey), orResource);
		return orResource;
	}

	/** @param {string} shemBackend Backend. @param {string} sodKey Cache key. @returns {*} Resource or null. */
	get(shemBackend, sodKey) {
		return this.resources.get(this.key(shemBackend, sodKey)) ?? null;
	}

	/** @param {string} shemBackend Backend identity. @param {Function} mitzvahDispose Optional disposer. */
	clearBackend(shemBackend, mitzvahDispose = null) {
		for (const [sodKey, orResource] of this.resources) {
			if (!sodKey.startsWith(`${shemBackend}:`)) continue;
			mitzvahDispose?.(orResource);
			this.resources.delete(sodKey);
		}
	}

	/** @param {Function} mitzvahDispose Optional disposer. */
	clear(mitzvahDispose = null) {
		for (const orResource of this.resources.values()) {
			mitzvahDispose?.(orResource);
		}
		this.resources.clear();
	}

	/** @param {string} shemBackend Backend. @param {string} sodKey Key. @returns {string} Namespaced key. */
	key(shemBackend, sodKey) {
		return `${shemBackend}:${sodKey}`;
	}
}
