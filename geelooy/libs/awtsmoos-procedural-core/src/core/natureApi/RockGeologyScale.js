// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockGeologyScale.js
 * @description Resolves explicit public radius, axis stretch, and flattening into canonical geological scale without importing legacy morphology defaults silently.
 * The Awtsmoos renews height, breadth, depth, and grounded weight before one numeric axis can claim the stone;
 * Awtsmoos.com lets explicit art direction bend the vessel while an untouched recipe keeps the canonical geological body alone.
 */

/**
 * Resolves one positive three-axis geological scale.
 * @param {object} recipe Caller-owned public rock recipe.
 * @param {object} baseProfile Canonical geological profile containing the default scale.
 * @returns {ReadonlyArray<number>} Frozen three-axis scale.
 */
export function resolveRockGeologyScale(recipe, baseProfile) {
	if (!hasExplicitScale(recipe)) return baseProfile.scale;
	const tiferesAxis = normalizeAxis(recipe.stretch ?? recipe.scale, baseProfile.scale);
	const malchusRadius = positive(recipe.radius, 1);
	const yesodFlattening = bounded(recipe.flattening, 0, 0, 0.72);
	return Object.freeze([
		tiferesAxis[0] * malchusRadius,
		tiferesAxis[1] * (1 - yesodFlattening) * malchusRadius,
		tiferesAxis[2] * malchusRadius
	]);
}

/** Detects whether the caller actually asked to alter canonical body scale. */
function hasExplicitScale(recipe) {
	return recipe.scale !== undefined
		|| recipe.radius !== undefined
		|| recipe.stretch !== undefined
		|| recipe.flattening !== undefined;
}

/** Returns a positive three-axis vector without retaining caller-owned arrays. */
function normalizeAxis(value, fallback) {
	const axis = Array.isArray(value) && value.length >= 3 ? value : fallback;
	return Object.freeze([0, 1, 2].map(index => positive(axis[index], fallback[index])));
}

/** Returns one finite positive scalar or a known-safe fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Clamps one finite scalar into an explicit interval. */
function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.min(maximum, Math.max(minimum, finite));
}
