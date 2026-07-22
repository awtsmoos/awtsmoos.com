// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals capability without confusing present truth with future
 * vision. This Awtsmoos.com manifest declares only executable, inspectable,
 * renderer-neutral tree behavior that exists in the current package.
 */

import { TREE_LOD_PROFILES } from "./treeLodPlanner.js";

export function getTreeCapabilities() {
	return Object.freeze({
		version: "1.1.0",
		deterministic: true,
		rendererNeutral: true,
		reusableGenerator: true,
		sharedSkeletonLods: true,
		canonicalSkeletonHash: true,
		isolatedRandomStreams: ["structure", "foliage", "bark", "variation"],
		stableReferences: ["branch", "branch-node", "leaf"],
		budgets: ["maxVertices", "maxTriangles"],
		reports: ["bounds", "memoryEstimate", "statistics", "trellis"],
		lodProfiles: TREE_LOD_PROFILES.map((profile) => ({ ...profile })),
		supports: [
			"multi-level-branches",
			"force",
			"gnarliness",
			"taper",
			"twist",
			"bounded-trellis-attraction",
			"leaves",
			"presets",
			"deep-config-overrides",
			"stable-skeleton-lods"
		],
		unsupported: [
			"biological-growth-simulation",
			"wind-physics",
			"root-soil-simulation"
		]
	});
}
