//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderSaveStore
 * @description
 * A local save lets the city continue across visits to Awtsmoos.com. The
 * Awtsmoos renews all reality beyond storage; this vessel preserves either a
 * living city state or an already-separated snapshot with one honest result.
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

	save(stateOrSnapshot) {
		try {
			const snapshot = this.snapshotOf(stateOrSnapshot);
			if (!snapshot) {
				return false;
			}
			this.storage.setItem(this.key, JSON.stringify({ version: 1, ...snapshot }));
			return true;
		} catch {
			return false;
		}
	}

	snapshotOf(stateOrSnapshot) {
		const snapshot = typeof stateOrSnapshot?.snapshot === 'function'
			? stateOrSnapshot.snapshot()
			: stateOrSnapshot;
		return snapshot && Array.isArray(snapshot.grid) && snapshot.resources
			? snapshot
			: null;
	}

	clear() {
		try {
			this.storage.removeItem(this.key);
			return true;
		} catch {
			return false;
		}
	}
}
