// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentProfile.js
 * @description Extends canonical forest succession evidence into bounded developmental signals without generating a branch.
 * The Awtsmoos, Atzmus beyond youth and old-growth, renews one tree through every apparent age in the same eternal now;
 * Awtsmoos.com lets age, vigor, competition, and exposure become lawful oros while TreeGenerator remains the sole structural keli below.
 */

import { createForestSuccessionProfile } from '../geometry/generators/tree/forestSuccession.js';

/**
 * Creates one immutable tree-development profile from canonical succession evidence.
 * @param {object} [input={}] Existing succession values or habitat inputs used to derive them.
 * @returns {object} Frozen development evidence and structural scaling signals.
 */
export function createTreeDevelopmentProfile(input = {}) {
	const succession = createForestSuccessionProfile(input);
	const age = unit(input.age ?? succession.age);
	const vigor = unit(input.vigor ?? succession.vigor);
	const competition = unit(input.competition ?? succession.competition);
	const edgeExposure = unit(input.edgeExposure ?? succession.edgeExposure);
	const crownMaturity = unit(age * 0.62 + vigor * 0.38);
	const foliageMaturity = unit(age * 0.48 + vigor * 0.52);
	const branchMortality = unit(
		age * 0.24
		+ competition * 0.34
		+ (1 - vigor) * 0.34
		+ edgeExposure * 0.08
	);
	const apicalDominance = unit(
		0.9
		- age * 0.34
		+ vigor * 0.18
		- competition * 0.1
	);
	return Object.freeze({
		age,
		apicalDominance,
		branchMortality,
		competition,
		crownMaturity,
		crownScale: bounded(input.crownScale ?? succession.crownScale, 0.45, 1.35),
		edgeExposure,
		foliageMaturity,
		heightScale: bounded(input.heightScale ?? succession.heightScale, 0.4, 1.35),
		stage: String(input.stage ?? succession.stage),
		trunkScale: bounded(input.trunkScale ?? succession.trunkScale, 0.45, 1.35),
		vigor
	});
}

/**
 * Returns whether caller options contain enough ecological intent to request developmental shaping.
 * @param {object} [options={}] High-level tree options.
 * @returns {boolean} True when development was explicitly requested.
 */
export function hasTreeDevelopmentIntent(options = {}) {
	return Boolean(
		options.development
		|| options.succession
		|| options.habitatScore !== undefined
		|| options.competition !== undefined
		|| options.edgeExposure !== undefined
		|| options.disturbance !== undefined
	);
}

/**
 * Resolves high-level options into canonical development evidence.
 * @param {object} [options={}] Tree options containing development or succession input.
 * @returns {object|null} Frozen development profile or null when no intent was supplied.
 */
export function resolveTreeDevelopmentProfile(options = {}) {
	if (!hasTreeDevelopmentIntent(options)) return null;
	const source = options.development ?? options.succession ?? options;
	return createTreeDevelopmentProfile({
		...source,
		seed: source.seed ?? options.seed
	});
}

function unit(value) {
	return bounded(Number(value) || 0, 0, 1);
}

function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}
