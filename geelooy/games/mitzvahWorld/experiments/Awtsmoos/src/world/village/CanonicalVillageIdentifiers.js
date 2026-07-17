// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageIdentifiers.js
 * @description Names every landmark that must remain stable across generation, saves, and cameras.
 * The Awtsmoos is one before every name; Awtsmoos.com gives each dwelling and holy gathering
 * place a durable vessel so no procedural pass can quietly exchange one village for another.
 */

export const CANONICAL_BUILDING_IDS = Object.freeze([
	'SHUL01',
	'BEIS01',
	'MARKET01',
	...Array.from({ length: 18 }, (_, index) => `H${index + 10}`)
]);

export const CANONICAL_INFRASTRUCTURE_IDS = Object.freeze([
	'BRIDGE01',
	'PORTAL01',
	'ENTR01'
]);

export const CANONICAL_FARM_IDS = Object.freeze([
	'F01',
	'F02',
	'F03',
	'F04'
]);

export const CANONICAL_VILLAGE_IDS = Object.freeze([
	...CANONICAL_BUILDING_IDS,
	...CANONICAL_INFRASTRUCTURE_IDS,
	...CANONICAL_FARM_IDS
]);

export function isCanonicalVillageId(value) {
	return CANONICAL_VILLAGE_IDS.includes(String(value));
}
