// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentProfile.js
 * @description Reconciles succession, directional intent, and explicit resource causes into one immutable pre-skeleton development profile.
 * The Awtsmoos, Atzmus beyond youth and drought, renews tree, sun, soil, gravity, and wind in one eternal now;
 * Awtsmoos.com lets those oros enter measured vessels while one canonical skeleton remains the sole living tree beneath every LOD somehow.
 */

import { createForestSuccessionProfile } from '../geometry/generators/tree/forestSuccession.js';
import {
	treeDevelopmentBounded,
	treeDevelopmentUnit,
	treeDevelopmentVector
} from './TreeDevelopmentMath.js';
import { createTreeResourceDevelopment } from './TreeResourceDevelopment.js';
import { applyTreeResourceDevelopmentEffects } from './TreeResourceDevelopmentEffects.js';

/**
 * Creates one immutable development profile whose resource effects activate only for explicitly supplied resource fields.
 * @param {object} [input={}] Succession, age, vigor, competition, light, wind, and optional soil-resource intent.
 * @returns {Readonly<object>} Canonical pre-skeleton development evidence.
 */
export function createTreeDevelopmentProfile(input = {}) {
	const keterSuccession = createForestSuccessionProfile(input);
	const chochmahAge = treeDevelopmentUnit(input.age ?? keterSuccession.age);
	const binahVigor = treeDevelopmentUnit(input.vigor ?? keterSuccession.vigor);
	const gevurahCompetition = treeDevelopmentUnit(input.competition ?? keterSuccession.competition);
	const tiferesEdge = treeDevelopmentUnit(input.edgeExposure ?? keterSuccession.edgeExposure);
	const yesodResources = createTreeResourceDevelopment(input);
	const netzachCrown = treeDevelopmentUnit(chochmahAge * 0.62 + binahVigor * 0.38);
	const hodFoliage = treeDevelopmentUnit(chochmahAge * 0.48 + binahVigor * 0.52);
	const malchusMortality = treeDevelopmentUnit(
		chochmahAge * 0.24
		+ gevurahCompetition * 0.34
		+ (1 - binahVigor) * 0.34
		+ tiferesEdge * 0.08
	);
	const tiferesEffects = applyTreeResourceDevelopmentEffects({
		branchMortality: malchusMortality,
		crownScale: treeDevelopmentBounded(input.crownScale ?? keterSuccession.crownScale, 0.45, 1.35),
		foliageMaturity: hodFoliage,
		heightScale: treeDevelopmentBounded(input.heightScale ?? keterSuccession.heightScale, 0.4, 1.35),
		phototropism: treeDevelopmentUnit(input.phototropism ?? 0.22 + binahVigor * 0.28 + tiferesEdge * 0.24),
		trunkScale: treeDevelopmentBounded(input.trunkScale ?? keterSuccession.trunkScale, 0.45, 1.35)
	}, yesodResources);
	const malchusProfile = {
		age: chochmahAge,
		apicalDominance: treeDevelopmentUnit(0.9 - chochmahAge * 0.34 + binahVigor * 0.18 - gevurahCompetition * 0.1),
		branchMortality: tiferesEffects.branchMortality,
		competition: gevurahCompetition,
		crownMaturity: netzachCrown,
		crownScale: tiferesEffects.crownScale,
		edgeExposure: tiferesEdge,
		foliageMaturity: tiferesEffects.foliageMaturity,
		gravitropism: treeDevelopmentUnit(input.gravitropism ?? 0.38 + binahVigor * 0.32),
		heightScale: tiferesEffects.heightScale,
		lightDirection: treeDevelopmentVector(input.lightDirection ?? input.sunDirection, { x: 0, y: 1, z: 0 }),
		phototropism: tiferesEffects.phototropism,
		spaceCompetition: treeDevelopmentUnit(input.spaceCompetition ?? gevurahCompetition * 0.72 + (1 - tiferesEdge) * 0.14),
		stage: String(input.stage ?? keterSuccession.stage),
		trunkScale: tiferesEffects.trunkScale,
		vigor: binahVigor,
		windDirection: treeDevelopmentVector(input.windDirection, { x: 0, y: 0, z: 0 }),
		windResponse: treeDevelopmentUnit(input.windResponse ?? tiferesEdge * 0.38)
	};
	if (yesodResources) {
		malchusProfile.resources = yesodResources;
	}
	return Object.freeze(malchusProfile);
}

/**
 * Reports whether high-level options contain pre-skeleton ecological, directional, or resource development intent.
 * @param {object} [options={}] Tree creation options.
 * @returns {boolean} True when development should be resolved before skeleton generation.
 */
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

/**
 * Merges environment beneath explicit development/succession values and resolves one canonical development profile.
 * @param {object} [options={}] High-level tree options.
 * @returns {Readonly<object>|null} Development profile or null when no intent exists.
 */
export function resolveTreeDevelopmentProfile(options = {}) {
	if (!hasTreeDevelopmentIntent(options)) {
		return null;
	}
	const chochmahEnvironment = options.environment || {};
	const binahSource = options.development ?? options.succession ?? options;
	return createTreeDevelopmentProfile({
		...chochmahEnvironment,
		...binahSource,
		seed: binahSource.seed ?? options.seed
	});
}
