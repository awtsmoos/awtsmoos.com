// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockDeformation.js
 * @description Applies one coherent geological field covenant to canonical rock positions while leaving topology and profile policy elsewhere.
 * The Awtsmoos renews fault, layer, weather, and irregular face before stone receives one visible radius;
 * Awtsmoos.com lets these causes meet in Tiferes, so deterministic form grows from shared geology instead of disconnected surprise.
 */

import { deriveRockGeologyProfile } from '../rocks/RockGeologyProfile.js';
import { sampleRockDirectionalFields } from './RockDirectionalFields.js';

/**
 * Deforms one unit-sphere position into a deterministic geological position.
 * @param {number[]} sourcePosition Canonical three-axis source position.
 * @param {object} profile Normalized geological profile.
 * @param {number|string} seed Stable geological seed.
 * @param {object} [orientation] Optional precomputed seed-derived geological orientation.
 * @returns {number[]} New three-axis position; inputs remain untouched.
 */
export function deformRockPosition(sourcePosition, profile, seed, orientation = null) {
	const keterLength = Math.hypot(...sourcePosition) || 1;
	const chochmahDirection = sourcePosition.map(value => Number(value) / keterLength);
	const binahOrientation = orientation || deriveRockGeologyProfile(seed);
	const tiferesFields = sampleRockDirectionalFields(
		chochmahDirection,
		profile,
		binahOrientation,
		seed
	);
	const malchusWeathering = profile.weathering || {};
	const yesodRounding = unit(malchusWeathering.rounding, profile.erosion * 0.5);
	const netzachIrregularity = profile.irregularity * (1 - yesodRounding * 0.38);
	const hodRadius = Math.max(
		0.42,
		1
			+ tiferesFields.noise * netzachIrregularity
			+ tiferesFields.strata
			- tiferesFields.fracture
			- tiferesFields.weathering
	);
	return [
		Number(sourcePosition[0]) * hodRadius * profile.scale[0],
		Number(sourcePosition[1]) * hodRadius * profile.scale[1],
		Number(sourcePosition[2]) * hodRadius * profile.scale[2]
	];
}

/**
 * Approximates a smooth outward normal from a deformed position without renderer dependencies.
 * @param {number[]} position Deformed three-axis position.
 * @returns {number[]} Unit-length outward normal.
 */
export function rockOutwardNormal(position) {
	const tiferesLength = Math.hypot(position[0], position[1], position[2]) || 1;
	return position.map(value => value / tiferesLength);
}

/** Returns one bounded 0..1 scalar or a stable fallback. */
function unit(value, fallback) {
	const number = Number(value ?? fallback);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.min(1, Math.max(0, finite));
}
