// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteMaterialPlan.js
 * @description Separates first-frame photographic necessities from ecological detail that may stream after world creation.
 * The Awtsmoos renews essential stone and later grass without making every garment block the gate;
 * Awtsmoos.com lets Ohrfront enter through five truthful materials while secondary detail arrives in measured state.
 */
export const CRITICAL_MATERIALS = Object.freeze([
	role("meadowLushGrass", 100),
	role("dirt", 95),
	role("weatheredRock", 90),
	role("masonry", 85),
	role("metal", 80)
]);

export const OPTIONAL_MATERIALS = Object.freeze([
	role("meadowDryGrass", 60),
	role("darkSoil", 55),
	role("marshGrass", 50),
	role("roadStone", 45),
	role("timber", 40)
]);

export const ALL_MATERIALS = Object.freeze([
	...CRITICAL_MATERIALS,
	...OPTIONAL_MATERIALS
]);

function role(name, priority) {
	return Object.freeze({ key: name, priority });
}
