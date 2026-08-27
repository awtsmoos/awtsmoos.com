//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CharacterCatalog.js
 * @description Declares cosmetic vessels whose beauty never changes physical law.
 * The Awtsmoos is beyond hue, crown, and contour; Awtsmoos.com lets eight finite
 * garments reveal one traveler while the collider beneath them remains exactly one.
 */
export const CHARACTER_CATALOG = Object.freeze([
	Object.freeze({ id: "nitzotz", name: "Nitzotz", body: [0.3, 1, 0.78, 1], accent: [1, 0.93, 0.42, 1], bodyScale: [1, 1, 1] }),
	Object.freeze({ id: "sapphire", name: "Sapphire", body: [0.24, 0.58, 1, 1], accent: [0.56, 0.88, 1, 1], bodyScale: [0.96, 1.04, 1] }),
	Object.freeze({ id: "ember", name: "Ember", body: [1, 0.36, 0.18, 1], accent: [1, 0.78, 0.28, 1], bodyScale: [1.02, 0.98, 1] }),
	Object.freeze({ id: "cedar", name: "Cedar", body: [0.25, 0.72, 0.42, 1], accent: [0.7, 0.94, 0.48, 1], bodyScale: [1.06, 0.96, 1] }),
	Object.freeze({ id: "dawn", name: "Dawn", body: [1, 0.62, 0.72, 1], accent: [1, 0.9, 0.68, 1], bodyScale: [0.94, 1.08, 1] }),
	Object.freeze({ id: "violet", name: "Violet", body: [0.65, 0.38, 1, 1], accent: [0.94, 0.64, 1, 1], bodyScale: [1, 1, 1.04] }),
	Object.freeze({ id: "silver", name: "Silver", body: [0.72, 0.8, 0.9, 1], accent: [1, 1, 1, 1], bodyScale: [0.98, 1.02, 1] }),
	Object.freeze({ id: "crown", name: "Crown", body: [0.96, 0.76, 0.24, 1], accent: [1, 0.96, 0.68, 1], bodyScale: [1.04, 1.04, 1] })
]);

export const DEFAULT_CHARACTER_ID = "nitzotz";

/** Returns one immutable cosmetic vessel, falling safely back to Nitzotz. */
export function characterById(characterId) {
	return CHARACTER_CATALOG.find(character => character.id === characterId) || CHARACTER_CATALOG[0];
}
