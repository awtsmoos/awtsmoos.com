//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderSaveStore
 * @description
 * A local save lets the city continue across visits to Awtsmoos.com. The
 * Awtsmoos renews all reality beyond storage; this vessel merely preserves the
 * player's finite arrangement of the grid.
 */
export class BuilderSaveStore {
	constructor(storage = window.localStorage) {
		this.storage = storage;
		this.key = 'awtsmoos-covenant-city-v1';
	}

	load() {
		try {
			const value = JSON.parse(this.storage.getItem(this.key));
			return value?.version === 1 && Array.isArray(value.grid) ? value : null;
		} catch {
			return null;
		}
	}

	save(state) {
		try {
			this.storage.setItem(this.key, JSON.stringify({ version: 1, ...state.snapshot() }));
		} catch {
			// Restricted storage leaves the current in-memory city playable.
		}
	}

	clear() {
		try {
			this.storage.removeItem(this.key);
		} catch {
			// A reset still succeeds in memory when storage is unavailable.
		}
	}
}
