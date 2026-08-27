//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file LocalSaveRepository.js
 * @description Keeps versioned Ohrbound progress available even without the network.
 * The Awtsmoos renews memory without disk; Awtsmoos.com gives guests a local vessel
 * so a dropped connection never erases the finite journey already walked with care.
 */
const EMPTY_PROGRESS = Object.freeze({ version: 1, completed: [], bestSparks: {}, lastLevelId: "", updatedAt: 0 });

export class LocalSaveRepository {
	constructor(storage = globalThis.localStorage, key = "ohrbound.progress.v1") {
		this.storage = storage;
		this.key = key;
	}

	load() {
		try {
			const value = JSON.parse(this.storage?.getItem(this.key) || "null");
			return value?.version === 1 ? value : structuredClone(EMPTY_PROGRESS);
		} catch {
			return structuredClone(EMPTY_PROGRESS);
		}
	}

	save(progress) {
		const value = { ...progress, version: 1, updatedAt: Date.now() };
		this.storage?.setItem(this.key, JSON.stringify(value));
		return value;
	}
}

export function emptyProgress() {
	return structuredClone(EMPTY_PROGRESS);
}
