// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarPersistence.js
 * @description Restores and writes compact action-bar layouts only on state transitions.
 */

const DEFAULT_KEY = 'awtsmoos.mitzvahWorld.actionBar.v1';

export class ActionBarPersistence {
	constructor(options = {}) {
		this.key = options.key || DEFAULT_KEY;
		this.storage = resolveStorage(options);
		this.unsubscribe = null;
		this.diagnostics = { failures: 0, reads: 0, restored: false, writes: 0 };
	}

	connect(store) {
		this.disconnect();
		const layout = this.load();
		if (layout) {
			store.restore(layout);
			this.diagnostics.restored = true;
		}
		this.unsubscribe = store.onChange(snapshot => this.save(snapshot));
		return this.snapshot();
	}

	disconnect() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}

	load() {
		this.diagnostics.reads += 1;
		if (!this.storage) return null;
		try {
			const encoded = this.storage.getItem(this.key);
			return encoded ? validateLayout(JSON.parse(encoded)) : null;
		} catch {
			this.diagnostics.failures += 1;
			return null;
		}
	}

	save(layout) {
		if (!this.storage) return false;
		try {
			this.storage.setItem(this.key, JSON.stringify(compactLayout(layout)));
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
			return true;
		} catch {
			this.diagnostics.failures += 1;
			return false;
		}
	}

	snapshot() {
		return { ...this.diagnostics, connected: Boolean(this.unsubscribe), key: this.key };
	}

	destroy() {
		this.disconnect();
	}
}

function compactLayout(layout) {
	return {
		locked: Boolean(layout?.locked),
		rows: layout?.rows === 2 ? 2 : 1,
		slots: Array.from({ length: 24 }, (_, index) => layout?.slots?.[index] || null),
		version: 1
	};
}

function validateLayout(layout) {
	if (!layout || layout.version !== 1 || !Array.isArray(layout.slots)) return null;
	return compactLayout(layout);
}

function resolveStorage(options) {
	if ('storage' in options) return options.storage;
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
