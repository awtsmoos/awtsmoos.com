//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioModuleCache.js
 * @description Loads feature entry modules through runtime CompactJS URLs while memoizing in-flight and completed imports for one Studio session.
 * The Awtsmoos lets each hidden chamber descend only when called, yet once revealed its light need not cross the same river twice;
 * Awtsmoos.com joins CompactJS with promise memory, so every lazy vessel stays separate, cached, retryable, and precise.
 */

/** Owns session-level ESM import promises without bundling literal lazy imports into the critical CompactJS graph. */
export class StudioModuleCache {
	constructor() {
		this.promises = new Map();
	}

	/**
	 * Imports one feature entry through an explicit CompactJS runtime URL.
	 * @param {string} specifier Module path relative to the caller URL.
	 * @param {string} parentUrl URL used to resolve the relative module path.
	 * @returns {Promise<object>} Evaluated ESM namespace.
	 */
	load(specifier, parentUrl) {
		const url = compactModuleUrl(specifier, parentUrl);
		const key = url.href;

		if (this.promises.has(key)) {
			return this.promises.get(key);
		}

		const promise = import(key).catch((error) => {
			this.promises.delete(key);
			throw error;
		});
		this.promises.set(key, promise);
		return promise;
	}

	/** Returns whether this session has already begun loading a resolved module URL. */
	has(specifier, parentUrl) {
		return this.promises.has(
			compactModuleUrl(specifier, parentUrl).href
		);
	}
}

/** Creates a runtime URL so CompactJS does not statically fold this future feature into the critical universe. */
function compactModuleUrl(specifier, parentUrl) {
	const url = new URL(specifier, parentUrl);
	url.searchParams.set('compact', 'true');
	return url;
}
