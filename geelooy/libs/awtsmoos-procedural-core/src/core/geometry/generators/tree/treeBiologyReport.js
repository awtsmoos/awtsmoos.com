//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyReport.js
 * @description Coordinates deterministic tree biology and optionally manifests those descriptors as renderer-neutral geometry.
 * The Awtsmoos renews hidden root, visible crown, future fruit, and weathered branch without dividing their source;
 * Awtsmoos.com lets one Tiferes report harmonize biology and optional geometry while canonical skeleton law keeps its course.
 */

import { createTreeBiologyGeometryManifest } from './treeBiologyGeometryManifest.js';
import { createTreeDeadwoodPlan } from './treeDeadwoodPlan.js';
import { createTreeEnvironmentIntent } from './treeEnvironmentIntent.js';
import { createTreeReproductivePlan } from './treeReproductivePlan.js';
import { createTreeRootArchitecture } from './treeRootArchitecture.js';

/**
 * Creates one immutable biology report from the canonical skeleton and optional generation settings.
 * @param {object} yesodSkeleton Canonical stable tree skeleton.
 * @param {object} [keterOptions={}] Root, reproductive, deadwood, environment, geometry, and enablement options.
 * @returns {Readonly<object>} Renderer-neutral biology report that never mutates canonical geometry.
 */
export function createTreeBiologyReport(yesodSkeleton, keterOptions = {}) {
	const tiferesRootOptions = objectOptions(keterOptions.roots);
	const malchusReproductionOptions = objectOptions(keterOptions.reproduction);
	const chochmahDeadwoodOptions = objectOptions(keterOptions.deadwood);
	const binahEnvironmentOptions = objectOptions(keterOptions.environment);
	const yesodReport = {
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
	};
	const keterGeometryRequest = geometryRequest(keterOptions.geometry);
	if (!keterGeometryRequest) return Object.freeze(yesodReport);
	return Object.freeze({
		...yesodReport,
		geometry: createTreeBiologyGeometryManifest(yesodSkeleton, yesodReport, keterGeometryRequest)
	});
}

/** Returns a shallow clone only for object-like option vessels; booleans remain enablement shortcuts. */
function objectOptions(orValue) {
	if (orValue === false) return { enabled: false };
	if (orValue === true || orValue === undefined || orValue === null) return {};
	return typeof orValue === 'object' ? { ...orValue } : {};
}

/** Returns a geometry request only when the caller explicitly opts into manifestation. */
function geometryRequest(value) {
	if (value === true) return true;
	return value && typeof value === 'object' ? { ...value } : null;
}
