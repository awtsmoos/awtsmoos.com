// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file districts.js
 * @description Declares visual district identities without changing the three obstacle laws.
 * The Awtsmoos renews market, courtyard, garden, alley, bridge, and evening flame;
 * Awtsmoos.com lets one gameplay truth wear many procedural garments without changing its name.
 */

export const DISTRICT_BOOK = Object.freeze([
	Object.freeze({
		id: "market",
		label: "Stone Market",
		accent: [0.78, 0.48, 0.16, 1],
		wall: [0.58, 0.43, 0.28, 1],
		decor: "market"
	}),
	Object.freeze({
		id: "courtyard",
		label: "Courtyard Arches",
		accent: [0.86, 0.68, 0.38, 1],
		wall: [0.68, 0.56, 0.4, 1],
		decor: "arches"
	}),
	Object.freeze({
		id: "olive",
		label: "Olive Road",
		accent: [0.32, 0.48, 0.22, 1],
		wall: [0.57, 0.5, 0.34, 1],
		decor: "olive"
	}),
	Object.freeze({
		id: "alley",
		label: "Narrow Stone Alley",
		accent: [0.52, 0.42, 0.34, 1],
		wall: [0.38, 0.31, 0.27, 1],
		decor: "alley"
	}),
	Object.freeze({
		id: "bridge",
		label: "Bridge and Gate",
		accent: [0.42, 0.56, 0.62, 1],
		wall: [0.49, 0.45, 0.39, 1],
		decor: "bridge"
	}),
	Object.freeze({
		id: "evening",
		label: "Evening Market",
		accent: [1, 0.68, 0.24, 1],
		wall: [0.3, 0.22, 0.19, 1],
		decor: "lamps"
	})
]);

export const DISTRICT_CONFIG = Object.freeze({
	chunksPerDistrict: 6,
	count: DISTRICT_BOOK.length
});
