// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentConfig.js
 * @description Applies one canonical development profile to cloned tree-generator configuration before the sole shared skeleton is born.
 * The Awtsmoos renews hidden pattern before branch length, crown spread, or leaf can appear; Awtsmoos.com lets each specialist supply one law,
 * so this Tiferes coordinator joins them without creating a rival skeleton, rival LOD path, or tangled configuration maw.
 */

import {
	createTreeDevelopmentForce,
	treeDevelopmentAngleScale,
	treeDevelopmentGnarlinessScale
} from './TreeDevelopmentForcing.js';
import {
	scaleTreeLevelValues,
	scaledTreeLeafCount,
	treeCrownDensity,
	treeLeafSizeScale,
	treeSecondaryRadiusScale
} from './TreeDevelopmentScaling.js';

/**
 * Applies bounded pre-skeleton development to the existing generator vocabulary and leaves neutral configurations unchanged.
 * @param {object} config Cloned mutable generator configuration.
 * @param {Readonly<object>|null} development Canonical development profile or null.
 * @returns {object} The same config object after deterministic development application.
 */
export function applyTreeDevelopmentConfig(config, development) {
	if (!development) {
		return config;
	}

	config.branch = createDevelopmentBranchConfig(config.branch || {}, development);
	config.leaves = createDevelopmentLeafConfig(config.leaves || {}, development);
	config.development = development;
	return config;
}

/**
 * Applies height, crown, radius, divergence, force, child-density, and weather-character scaling to branch configuration.
 * @param {object} branch Existing branch configuration.
 * @param {Readonly<object>} development Canonical development profile.
 * @returns {object} New branch configuration using only established generator keys.
 */
function createDevelopmentBranchConfig(branch, development) {
	return {
		...branch,
		angle: scaleTreeLevelValues(
			branch.angle,
			(yesodLevel) => yesodLevel === 0 ? 1 : treeDevelopmentAngleScale(development)
		),
		children: scaleTreeLevelValues(
			branch.children,
			(yesodLevel) => yesodLevel === 0 ? 1 : treeCrownDensity(development),
			true
		),
		force: createTreeDevelopmentForce(branch, development),
		gnarliness: scaleTreeLevelValues(
			branch.gnarliness,
			() => treeDevelopmentGnarlinessScale(development)
		),
		length: scaleTreeLevelValues(
			branch.length,
			(yesodLevel) => yesodLevel === 0
				? development.heightScale
				: development.crownScale
		),
		radius: scaleTreeLevelValues(
			branch.radius,
			(yesodLevel) => yesodLevel === 0
				? development.trunkScale
				: treeSecondaryRadiusScale(development)
		)
	};
}

/**
 * Applies deterministic foliage abundance and leaf-size development while retaining the generator's existing leaf schema.
 * @param {object} leaves Existing leaf configuration.
 * @param {Readonly<object>} development Canonical development profile.
 * @returns {object} New leaf configuration.
 */
function createDevelopmentLeafConfig(leaves, development) {
	return {
		...leaves,
		count: scaledTreeLeafCount(leaves.count, development),
		size: Number(leaves.size ?? 2) * treeLeafSizeScale(development)
	};
}
