// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos.com capability record reports executable tree behavior without
 * erasing earlier machine contracts. Existing fields remain stable while the
 * one canonical planner and its compatibility adapter are declared explicitly.
 */

import { TREE_LOD_PROFILES } from "./treeLodPlanner.js";

const SUPPORTS = Object.freeze([
	"multi-level-branches",
	"force",
	"gnarliness",
	"taper",
	"twist",
	"bounded-trellis-attraction",
	"leaves",
	"presets",
	"deep-config-overrides",
	"stable-skeleton-lods",
	"seeded-structure-and-foliage-streams",
	"pipe-model-radius-conservation",
	"parallel-transport-branch-frames",
	"closed-branch-components",
	"tapered-single-or-cross-billboard-leaves"
]);

const UNSUPPORTED = Object.freeze([
	"biological-growth-simulation",
	"wind-physics",
	"root-soil-simulation",
	"biome-competition"
]);

/**
 * Returns one immutable, backward-compatible capability manifest. Complexity is
 * O(number of LOD profiles); the function performs no I/O or mutable side effects.
 *
 * @returns {Readonly<Object>} Current executable tree capabilities.
 */
export function getTreeCapabilities() {
	return Object.freeze({
		version: "1.2.0",
		deterministic: true,
		rendererNeutral: true,
		reusableGenerator: true,
		sharedSkeletonLods: true,
		canonicalSkeletonHash: true,
		canonicalPlanner: "stable-tree-skeleton",
		legacyGrowthAdapter: true,
		isolatedRandomStreams: Object.freeze([
			"structure",
			"foliage",
			"bark",
			"variation"
		]),
		stableReferences: Object.freeze([
			"branch",
			"branch-node",
			"leaf",
			"attachment-node"
		]),
		budgets: Object.freeze(["maxVertices", "maxTriangles"]),
		reports: Object.freeze([
			"bounds",
			"memoryEstimate",
			"statistics",
			"trellis",
			"branchCaps"
		]),
		lodProfiles: Object.freeze(TREE_LOD_PROFILES.map((profile) => Object.freeze({
			...profile
		}))),
		supports: SUPPORTS,
		unsupported: UNSUPPORTED
	});
}

export default getTreeCapabilities;
