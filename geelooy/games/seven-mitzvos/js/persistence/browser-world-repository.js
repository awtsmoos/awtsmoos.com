//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserWorldRepository
 * @description
 * Browser storage becomes an adapter on Awtsmoos.com rather than the owner of
 * domain truth. Raw generation copies and worker-prepared records keep the
 * seven-region save path below the visible UI-thread pause budget.
 */
export class BrowserWorldRepository {
	constructor(
		storage = availableStorage(),
		prefix = 'awtsmoos-living-world-v1'
	) {
		this.storage = storage;
		this.prefix = prefix;
	}

	save(key, value) {
		return this.saveSerialized(key, JSON.stringify(value));
	}

	/**
	 * @param {string} key Record identity.
	 * @param {string} serialized Worker-prepared JSON.
	 * @returns {boolean} Whether persistence succeeded.
	 */
	saveSerialized(key, serialized) {
		if (!this.storage) {
			return false;
		}
		try {
			this.storage.setItem(this.storageKey(key), serialized);
			return true;
		} catch {
			return false;
		}
	}

	load(key) {
		const serialized = this.loadSerialized(key);
		if (!serialized) {
			return null;
		}
		try {
			return JSON.parse(serialized);
		} catch {
			return null;
		}
	}

	loadSerialized(key) {
		if (!this.storage) {
			return null;
		}
		try {
			return this.storage.getItem(this.storageKey(key));
		} catch {
			return null;
		}
	}

	copy(source, target) {
		const value = this.loadSerialized(source);
		if (!value) {
			return false;
		}
		return this.saveSerialized(target, value);
	}

	remove(key) {
		try {
			this.storage?.removeItem(this.storageKey(key));
			return true;
		} catch {
			return false;
		}
	}

	storageKey(key) {
		return `${this.prefix}:${key}`;
	}
}

function availableStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
