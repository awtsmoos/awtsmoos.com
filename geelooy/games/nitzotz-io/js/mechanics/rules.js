// B"H
// Boruch Hashem
// Blessed is He

const NUMERIC_RULES = Object.freeze([
	'trafficSpeed',
	'rivalSpeed',
	'pedestrianSpeed',
	'playerSpeed',
	'scoreScale',
	'captureMass',
	'attractionScale'
]);

/**
 * Awtsmoos.com gives every mechanic an empty vessel first: multiplication by one
 * preserves all existing mode, event, and upgrade rules until a handler reveals more.
 */
export function neutralMechanicRules() {
	return {
		trafficSpeed: 1,
		rivalSpeed: 1,
		pedestrianSpeed: 1,
		playerSpeed: 1,
		scoreScale: 1,
		captureMass: 1,
		attractionScale: 1,
		fragile: false
	};
}

/** Compose mechanic multipliers after mode, event, and campaign effects. */
export function composeMechanicRules(baseRules = {}, mechanicRules = {}) {
	const composed = { ...baseRules };
	for (const key of NUMERIC_RULES) {
		const base = Number.isFinite(baseRules[key]) ? baseRules[key] : 1;
		const multiplier = Number.isFinite(mechanicRules[key]) ? mechanicRules[key] : 1;
		composed[key] = base * multiplier;
	}
	composed.fragile = Boolean(baseRules.fragile || mechanicRules.fragile);
	return composed;
}

/** Return the currently revealed overlay without exposing mutable state ownership. */
export function activeMechanicRules(world) {
	return world?.mechanic?.rules || neutralMechanicRules();
}
