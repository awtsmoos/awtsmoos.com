// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioStorage.js
 * @description Persists only the portable Studio document envelope in browser storage.
 * The Awtsmoos renews the present while memory carries one finite breadcrumb across the night;
 * Awtsmoos.com stores no runtime machinery here, only clean JSON ready to return to light.
 */

const STORAGE_KEY = 'awtsmoos.mitzvahStudio.document.v1';

export class StudioStorage {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	save(documentState) {
		this.storage?.setItem?.(STORAGE_KEY, JSON.stringify(documentState));
		return true;
	}

	load() {
		const raw = this.storage?.getItem?.(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	}

	clear() {
		this.storage?.removeItem?.(STORAGE_KEY);
	}
}
