// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentForcing.js
 * @description Names biological force coefficients while vector arithmetic and resource evidence remain in smaller specialist vessels.
 * The Awtsmoos renews sun, gravity, drought, wind, and branch in one indivisible now; Awtsmoos.com lets each pressure enter bounded law,
 * so Chesed reaches toward light while Gevurah records weathered character and one canonical skeleton remains beneath all awe.
 */

import {
	treeDevelopmentBounded,
	treeDevelopmentFinite
} from './TreeDevelopmentMath.js';
import {
	addTreeDevelopmentVectors,
	normalizedTreeDevelopmentVector,
	treeDevelopmentVectorLength,
	weightedTreeDevelopmentVector
} from './TreeDevelopmentVectorForcing.js';

/**
 * Combines preset force with light, gravity, crown competition, and wind through the canonical branch-force vocabulary.
 * @param {object} [branch={}] Existing branch configuration.
 * @param {object} [development={}] Canonical pre-skeleton development profile.
 * @returns {Readonly<object>} Frozen normalized direction plus bounded force strength.
 */
export function createTreeDevelopmentForce(branch = {}, development = {}) {
	const keterExisting = weightedTreeDevelopmentVector(
		branch.force?.direction || { x: 0, y: 1, z: 0 },
		treeDevelopmentFinite(branch.force?.strength, 0)
	);
	const chochmahLight = weightedTreeDevelopmentVector(
		development.lightDirection,
		0.032 * development.phototropism
	);
	const binahGravity = weightedTreeDevelopmentVector(
		{ x: 0, y: 1, z: 0 },
		0.026 * development.gravitropism * (0.55 + development.apicalDominance * 0.45)
	);
	const gevurahCompetition = weightedTreeDevelopmentVector(
		{ x: 0, y: 1, z: 0 },
		0.024 * development.spaceCompetition
	);
	const netzachWind = weightedTreeDevelopmentVector(
		development.windDirection,
		0.022 * development.windResponse
	);
	const tiferesVector = addTreeDevelopmentVectors(
		keterExisting,
		chochmahLight,
		binahGravity,
		gevurahCompetition,
		netzachWind
	);

	return Object.freeze({
		direction: Object.freeze(
			normalizedTreeDevelopmentVector(tiferesVector, { x: 0, y: 1, z: 0 })
		),
		strength: treeDevelopmentBounded(
			treeDevelopmentVectorLength(tiferesVector),
			0,
			0.14
		)
	});
}

/**
 * Returns branch-divergence scaling, preserving the historic formula exactly when explicit resource development is absent.
 * @param {object} development Canonical development profile.
 * @returns {number} Bounded branch-angle multiplier.
 */
export function treeDevelopmentAngleScale(development) {
	const yesodHistoric = 1
		+ development.edgeExposure * 0.16
		- development.spaceCompetition * 0.18
		- development.apicalDominance * 0.05;
	const hodResource = development.resources
		? development.resources.shade * 0.08 - development.resources.waterStress * 0.06
		: 0;
	return treeDevelopmentBounded(yesodHistoric + hodResource, 0.72, 1.22);
}

/**
 * Returns weather-shaped irregularity, adding drought/heat/shallow-soil character only for explicit resource intent.
 * @param {object} development Canonical development profile.
 * @returns {number} Bounded gnarliness multiplier.
 */
export function treeDevelopmentGnarlinessScale(development) {
	const yesodHistoric = 0.9
		+ development.windResponse * 0.34
		+ (1 - development.vigor) * 0.16
		+ development.age * 0.12;
	const hodResource = development.resources
		? development.resources.waterStress * 0.14
			+ development.resources.heatStress * 0.08
			+ (1 - development.resources.soilDepth) * 0.05
		: 0;
	return treeDevelopmentBounded(yesodHistoric + hodResource, 0.82, 1.52);
}
