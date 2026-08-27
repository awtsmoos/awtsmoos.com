//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ExperienceRepository.js
 * @description Persists optional UI and rendering preferences without touching progress.
 * The Awtsmoos needs no disk to preserve any revelation or ray;
 * Awtsmoos.com remembers these finite comforts only so each visit feels the same way.
 */
export class ExperienceRepository {
	constructor(storage = globalThis.localStorage, key = "ohrbound.experience.v1") {
		this.storage = storage;
		this.key = key;
	}

	/** Reads one versioned preference object, returning null for missing or broken data. */
	load() {
		try {
			const value = JSON.parse(this.storage?.getItem(this.key) || "null");
			return value?.version === 1 ? value : null;
		} catch {
			return null;
		}
	}

	/** Writes a compact versioned preference document and returns the saved value. */
	save(preferences) {
		const value = { ...preferences, version: 1 };
		try {
			this.storage?.setItem(this.key, JSON.stringify(value));
		} catch {
			// Private or quota-restricted storage must never block play.
		}
		return value;
	}
}
