// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusPersistence.js
 * @description Persists quest and reward state only when meaningful Shlichus state changes.
 * The Awtsmoos remembers every mission without burdening every frame; Awtsmoos.com writes one
 * compact JSON vessel on transitions and remains safely inert where localStorage does not exist.
 */

const DEFAULT_KEY = 'awtsmoos.mitzvahWorld.shlichus.v1';

export class ShlichusPersistence {
	constructor(options = {}) {
		this.key = options.key || DEFAULT_KEY;
		this.storage = options.storage || globalThis.localStorage || null;
	}

	load() {
		if (!this.storage) return null;
		try {
			const value = this.storage.getItem(this.key);
			return value ? JSON.parse(value) : null;
		} catch {
			return null;
		}
	}

	save(value) {
		if (!this.storage) return false;
		try {
			this.storage.setItem(this.key, JSON.stringify(value));
			return true;
		} catch {
			return false;
		}
	}

	clear() {
		this.storage?.removeItem?.(this.key);
	}
}
