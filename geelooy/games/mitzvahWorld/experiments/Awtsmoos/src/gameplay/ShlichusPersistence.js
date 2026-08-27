// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShlichusPersistence.js
 * @description Persists compact Shlichus state on transitions and reports storage health.
 */

const DEFAULT_KEY = 'awtsmoos.mitzvahWorld.shlichus.v1';

export class ShlichusPersistence {
	constructor(options = {}) {
		this.key = options.key || DEFAULT_KEY;
		this.storage = resolveStorage(options);
		this.diagnostics = { clears: 0, failures: 0, reads: 0, restored: false, writes: 0 };
	}

	load() {
		this.diagnostics.reads += 1;
		if (!this.storage) return null;
		try {
			const value = this.storage.getItem(this.key);
			const restored = value ? JSON.parse(value) : null;
			this.diagnostics.restored = Boolean(restored);
			return restored;
		} catch {
			this.diagnostics.failures += 1;
			return null;
		}
	}

	save(value) {
		if (!this.storage) return false;
		try {
			this.storage.setItem(this.key, JSON.stringify(value));
			this.diagnostics.writes += 1;
			return true;
		} catch {
			this.diagnostics.failures += 1;
			return false;
		}
	}

	clear() {
		try {
			this.storage?.removeItem?.(this.key);
			this.diagnostics.clears += 1;
			return true;
		} catch {
			this.diagnostics.failures += 1;
			return false;
		}
	}

	snapshot() {
		return { ...this.diagnostics, available: Boolean(this.storage), key: this.key };
	}
}

function resolveStorage(options) {
	if ('storage' in options) return options.storage;
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
