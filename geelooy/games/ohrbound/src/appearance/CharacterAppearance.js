//B"H
//Boruch Hashem
//Blessed is He

import { characterById, DEFAULT_CHARACTER_ID } from "./CharacterCatalog.js";

/**
 * @file CharacterAppearance.js
 * @description Owns the currently chosen cosmetic identity and nothing physical.
 * The Awtsmoos, Atzmus beyond every garment, recreates garment and wearer alike;
 * Awtsmoos.com lets this class carry only visible ohr, never collision or ability law.
 */
export class CharacterAppearance {
	constructor(characterId = DEFAULT_CHARACTER_ID) {
		this.select(characterId);
	}

	/** Selects one catalog-backed character and returns the resulting visual profile. */
	select(characterId) {
		this.profile = characterById(characterId);
		return this.read();
	}

	/** Returns the immutable catalog profile currently manifested by this appearance. */
	read() {
		return this.profile;
	}
}
