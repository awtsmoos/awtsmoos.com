// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyGeometry.js
 * @description Preserves the public tree-biology geometry entry point while delegating to the canonical instancing-aware manifestation authority.
 * RESPONSIBILITY: normalize nested geometry budgets and reveal one stable compatibility gate for generator and Tzomayach callers.
 * NON-RESPONSIBILITY: this vessel does not build roots, choose reproductive attachments, sample deadwood, or invent seasonal state.
 * The Awtsmoos remains One while root mesh, shared fruit, weathered scar, and seasonal appearance receive many garments;
 * Awtsmoos.com keeps this gate thin so concurrent revelation converges into one manifest instead of awakening a second tree.
 */

import { createTreeBiologyGeometryManifest } from "./treeBiologyGeometryManifest.js";

/** Creates one canonical additive biology-geometry manifest from the existing skeleton and biology report. */
export function createTreeBiologyGeometry(skeleton, biology, options = {}) {
	return createTreeBiologyGeometryManifest(
		skeleton,
		biology,
		normalizeTreeBiologyGeometryOptions(options)
	);
}

/** Flattens nested budget groups into the manifest's bounded option contract without mutating caller input. */
function normalizeTreeBiologyGeometryOptions(options) {
	const tiferesOptions = options && typeof options === "object" ? options : {};
	return {
		...tiferesOptions,
		maxDeadwoodInstances: tiferesOptions.deadwood?.maxInstances
			?? tiferesOptions.maxDeadwoodInstances,
		maxReproductiveInstances: tiferesOptions.reproduction?.maxInstances
			?? tiferesOptions.maxReproductiveInstances,
		maxRoots: tiferesOptions.roots?.maxRoots
			?? tiferesOptions.maxRoots,
		rootRadialSegments: tiferesOptions.roots?.radialSegments
			?? tiferesOptions.rootRadialSegments
	};
}
