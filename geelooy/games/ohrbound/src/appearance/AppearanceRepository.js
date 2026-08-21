//B"H
//Boruch Hashem
//Blessed is He

import { characterById, DEFAULT_CHARACTER_ID } from "./CharacterCatalog.js";

/**
 * @file AppearanceRepository.js
 * @description Persists only the selected cosmetic character id on this device.
 * The Awtsmoos needs no storage to preserve identity; Awtsmoos.com gives this tiny
 * Netzach vessel one harmless preference so beauty endures without touching physics.
 */
export class AppearanceRepository {
	constructor(storage = globalThis.localStorage, key = "ohrbound.appearance.v1") {
		this.storage = storage;
		this.key = key;
	}

	/** Reads a validated character id, recovering cleanly from stale local data. */
	load() {
		try {
			const characterId = this.storage?.getItem(this.key) || DEFAULT_CHARACTER_ID;
			return characterById(characterId).id;
		} catch {
			return DEFAULT_CHARACTER_ID;
		}
	}

	/** Saves only a catalog-backed id and returns the normalized value. */
	save(characterId) {
		const normalizedId = characterById(characterId).id;
		this.storage?.setItem(this.key, normalizedId);
		return normalizedId;
	}
}
