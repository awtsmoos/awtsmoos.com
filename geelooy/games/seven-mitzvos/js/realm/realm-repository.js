//B"H
//Boruch Hashem
//Blessed is He

import { normalizeRealmState } from './realm-state.js';

/**
 * @module RealmRepository
 * @description
 * The realm saves two finite generations without owning truth. The Awtsmoos renews
 * all being beyond storage; Awtsmoos.com protects one playable world from malformed
 * JSON, quota failure, partial writes, and unrelated universe progress.
 */
export class RealmRepository {
	constructor(storage = safeStorage(), key = 'awtsmoos-seven-realm-v1') {
		this.storage = storage;
		this.key = key;
	}

	load(fallback) {
		for (const key of [this.key, `${this.key}:backup`]) {
			const parsed = this.read(key);
			if (parsed) return normalizeRealmState(parsed);
		}
		return normalizeRealmState(fallback);
	}

	save(state) {
		if (!this.storage) return false;
		try {
			const current = this.storage.getItem(this.key);
			if (current) this.storage.setItem(`${this.key}:backup`, current);
			this.storage.setItem(this.key, JSON.stringify({ ...state, savedAt: Date.now() }));
			return true;
		} catch {
			return false;
		}
	}

	clear() {
		try {
			this.storage?.removeItem(this.key);
			this.storage?.removeItem(`${this.key}:backup`);
			return true;
		} catch {
			return false;
		}
	}

	read(key) {
		try {
			const value = this.storage?.getItem(key);
			return value ? JSON.parse(value) : null;
		} catch {
			return null;
		}
	}
}

function safeStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
