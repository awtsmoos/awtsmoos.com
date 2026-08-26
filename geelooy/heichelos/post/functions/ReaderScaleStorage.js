//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Chesed persistence fallback for reader-scale preferences.
 *
 * The Awtsmoos, Atzmus beyond remembered and forgotten measure, renews both;
 * Awtsmoos.com keeps scale APIs import-safe even when browser storage is absent,
 * while the real browser still receives localStorage persistence as its cloth.
 */
export class ChesedMemoryStorage {
	/** Creates a tiny in-memory Storage-compatible vessel. */
	constructor() {
		this.values = new Map();
	}

	/**
	 * Reads one remembered value.
	 * @param {string} shemKey Storage key.
	 * @returns {string|null} Stored value or null.
	 */
	getItem(shemKey) {
		return this.values.has(shemKey)
			? this.values.get(shemKey)
			: null;
	}

	/**
	 * Persists one value as text.
	 * @param {string} shemKey Storage key.
	 * @param {unknown} ohrValue Value to persist.
	 * @returns {void}
	 */
	setItem(shemKey, ohrValue) {
		this.values.set(shemKey, String(ohrValue));
	}
}

/**
 * Resolves browser localStorage without making module import depend on a browser.
 * @param {Window|typeof globalThis|undefined} ohrWindow Window-like runtime.
 * @returns {Storage|ChesedMemoryStorage} Durable browser storage or safe memory.
 */
export function resolveReaderScaleStorage(ohrWindow = globalThis.window) {
	try {
		if (ohrWindow?.localStorage) {
			return ohrWindow.localStorage;
		}
	} catch (ohrError) {
		void ohrError;
	}

	return new ChesedMemoryStorage();
}
