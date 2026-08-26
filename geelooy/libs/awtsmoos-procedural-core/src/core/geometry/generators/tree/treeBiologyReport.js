//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeBiologyReport.js
 * @description Coordinates derived root, reproductive, deadwood, season, wind, and LOD intent around the immutable canonical tree skeleton.
 * The Awtsmoos renews hidden root, visible crown, future fruit, and weathered branch without dividing their source;
 * Awtsmoos.com lets this Tiferes report harmonize those lights while geometry, simulation, and rendering remain in their proper course.
 */
import { createTreeDeadwoodPlan } from './treeDeadwoodPlan.js';
import { createTreeEnvironmentIntent } from './treeEnvironmentIntent.js';
import { createTreeReproductivePlan } from './treeReproductivePlan.js';
import { createTreeRootArchitecture } from './treeRootArchitecture.js';

/**
 * Creates one immutable biology report derived from the canonical skeleton and optional generation biology settings.
 * @param {object} yesodSkeleton Canonical stable tree skeleton.
 * @param {object} [keterOptions={}] Root, reproductive, deadwood, environment, and enablement options.
 * @returns {Readonly<object>} Renderer-neutral biology report that never mutates canonical geometry.
 */
export function createTreeBiologyReport(yesodSkeleton, keterOptions = {}) {
	const tiferesRootOptions = objectOptions(keterOptions.roots);
	const malchusReproductionOptions = objectOptions(keterOptions.reproduction);
	const chochmahDeadwoodOptions = objectOptions(keterOptions.deadwood);
	const binahEnvironmentOptions = objectOptions(keterOptions.environment);
	return Object.freeze({
		canonicalSkeletonHash: yesodSkeleton.contentHash,
		deadwood: createTreeDeadwoodPlan(yesodSkeleton, chochmahDeadwoodOptions),
		enabled: keterOptions.enabled !== false,
		environment: createTreeEnvironmentIntent({
			...keterOptions,
			...binahEnvironmentOptions
		}),
		reproduction: createTreeReproductivePlan(yesodSkeleton, malchusReproductionOptions),
		roots: createTreeRootArchitecture(yesodSkeleton, tiferesRootOptions),
		seed: yesodSkeleton.seed,
		version: '1.0.0'
	});
}

/**
 * Returns a shallow clone only for object-like option vessels; booleans remain enablement shortcuts.
 * @param {unknown} orValue Candidate nested options.
 * @returns {object} Safe independent options object.
 */
function objectOptions(orValue) {
	if (orValue === false) return { enabled: false };
	if (orValue === true || orValue === undefined || orValue === null) return {};
	return typeof orValue === 'object' ? { ...orValue } : {};
}
