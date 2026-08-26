// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentProfile.js
 * @description Converts succession and environment intent into immutable structural and directional growth evidence.
 * The Awtsmoos, Atzmus beyond youth and old-growth, renews tree, sun, gravity, and wind in the same eternal now;
 * Awtsmoos.com lets those oros enter a measured profile while TreeGenerator remains the sole structural keli beneath every LOD.
 */

import { createForestSuccessionProfile } from '../geometry/generators/tree/forestSuccession.js';

/** Creates one immutable tree-development profile from canonical succession and environment evidence. */
export function createTreeDevelopmentProfile(input = {}) {
	const keterSuccession = createForestSuccessionProfile(input);
	const chochmahAge = unit(input.age ?? keterSuccession.age);
	const binahVigor = unit(input.vigor ?? keterSuccession.vigor);
	const gevurahCompetition = unit(input.competition ?? keterSuccession.competition);
	const tiferesEdge = unit(input.edgeExposure ?? keterSuccession.edgeExposure);
	const netzachCrown = unit(chochmahAge * 0.62 + binahVigor * 0.38);
	const hodFoliage = unit(chochmahAge * 0.48 + binahVigor * 0.52);
	const yesodMortality = unit(
		chochmahAge * 0.24
		+ gevurahCompetition * 0.34
		+ (1 - binahVigor) * 0.34
		+ tiferesEdge * 0.08
	);
	const malchusApical = unit(0.9 - chochmahAge * 0.34 + binahVigor * 0.18 - gevurahCompetition * 0.1);
	return Object.freeze({
		age: chochmahAge,
		apicalDominance: malchusApical,
		branchMortality: yesodMortality,
		competition: gevurahCompetition,
		crownMaturity: netzachCrown,
		crownScale: bounded(input.crownScale ?? keterSuccession.crownScale, 0.45, 1.35),
		edgeExposure: tiferesEdge,
		foliageMaturity: hodFoliage,
		gravitropism: unit(input.gravitropism ?? 0.38 + binahVigor * 0.32),
		heightScale: bounded(input.heightScale ?? keterSuccession.heightScale, 0.4, 1.35),
		lightDirection: vector(input.lightDirection ?? input.sunDirection, { x: 0, y: 1, z: 0 }),
		phototropism: unit(input.phototropism ?? 0.22 + binahVigor * 0.28 + tiferesEdge * 0.24),
		spaceCompetition: unit(input.spaceCompetition ?? gevurahCompetition * 0.72 + (1 - tiferesEdge) * 0.14),
		stage: String(input.stage ?? keterSuccession.stage),
		trunkScale: bounded(input.trunkScale ?? keterSuccession.trunkScale, 0.45, 1.35),
		vigor: binahVigor,
		windDirection: vector(input.windDirection, { x: 0, y: 0, z: 0 }),
		windResponse: unit(input.windResponse ?? tiferesEdge * 0.38)
	});
}

/** Returns whether caller options contain ecological or directional development intent. */
export function hasTreeDevelopmentIntent(options = {}) {
	return Boolean(
		options.development
		|| options.environment
		|| options.succession
		|| options.habitatScore !== undefined
		|| options.competition !== undefined
		|| options.edgeExposure !== undefined
		|| options.disturbance !== undefined
		|| options.lightDirection
		|| options.windDirection
	);
}

/** Resolves high-level options into canonical development evidence. */
export function resolveTreeDevelopmentProfile(options = {}) {
	if (!hasTreeDevelopmentIntent(options)) return null;
	const chochmahEnvironment = options.environment || {};
	const binahSource = options.development ?? options.succession ?? options;
	return createTreeDevelopmentProfile({
		...chochmahEnvironment,
		...binahSource,
		seed: binahSource.seed ?? options.seed
	});
}

function vector(value, fallback) {
	const source = Array.isArray(value)
		? { x: value[0], y: value[1], z: value[2] }
		: (value || fallback);
	return Object.freeze({
		x: finite(source.x, fallback.x),
		y: finite(source.y, fallback.y),
		z: finite(source.z, fallback.z)
	});
}

function unit(value) {
	return bounded(Number(value) || 0, 0, 1);
}

function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, finite(value, minimum)));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
