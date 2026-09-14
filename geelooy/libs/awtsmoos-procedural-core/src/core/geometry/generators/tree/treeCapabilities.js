//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeCapabilities.js
 * @description Truthful machine-readable capabilities for the canonical renderer-neutral tree authority.
 * Capability claims name executable behavior only; future biological simulation remains explicitly separated from implemented structural and dynamic features.
 */

import { TREE_LOD_PROFILES } from "./treeLodPlanner.js";

const STRUCTURAL_SUPPORT = Object.freeze([
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
	"tapered-single-or-cross-billboard-leaves",
	"stratified-permuted-attachment-sampling",
	"interpolated-branch-attachments",
	"fine-foliage-twig-hierarchy",
	"radius-scaled-bark-uvs",
	"rounded-leaf-normals",
	"lod-billboard-overrides",
	"renderer-neutral-raw-geometry",
	"caller-supplied-material-identities"
]);

const BIOLOGY_SUPPORT = Object.freeze([
	"deterministic-root-architecture",
	"explicit-reproductive-attachment-plan",
	"deterministic-deadwood-plan",
	"seasonal-intent",
	"wind-response-profile",
	"renderer-neutral-hierarchical-wind-dynamics",
	"distance-lod-intent"
]);

const UNSUPPORTED = Object.freeze([
	"biological-growth-simulation",
	"full-aeroelastic-wind-physics",
	"root-soil-simulation",
	"biome-competition",
	"fruit-or-flower-mesh-generation",
	"deadwood-mesh-removal"
]);

/**
 * Returns immutable executable capability truth for tools, tests, docs, and runtime feature negotiation.
 * @returns {Readonly<object>} Current canonical-tree capability manifest.
 */
export function getTreeCapabilities() {
	return Object.freeze({
		version: "1.5.0",
		anatomyArtifact: true,
		biologyArtifact: Object.freeze({
			derivedFromCanonicalSkeleton: true,
			geometryMutating: false,
			optInOnGeometryOutput: true,
			supports: BIOLOGY_SUPPORT
		}),
		canonicalPlanner: "stable-tree-skeleton",
		canonicalSkeletonHash: true,
		deterministic: true,
		isolatedRandomStreams: Object.freeze([
			"structure",
			"foliage",
			"bark",
			"variation"
		]),
		legacyGrowthAdapter: true,
		lodProfiles: Object.freeze(
			TREE_LOD_PROFILES.map(profile => Object.freeze({ ...profile }))
		),
		rendererNeutral: true,
		reusableGenerator: true,
		sharedSkeletonLods: true,
		stableReferences: Object.freeze([
			"branch",
			"branch-node",
			"leaf",
			"root",
			"reproductive-attachment",
			"deadwood-feature"
		]),
		budgets: Object.freeze(["maxVertices", "maxTriangles"]),
		reports: Object.freeze([
			"bounds",
			"memoryEstimate",
			"statistics",
			"trellis",
			"branchCaps",
			"anatomy",
			"biology"
		]),
		supports: Object.freeze([
			...STRUCTURAL_SUPPORT,
			...BIOLOGY_SUPPORT
		]),
		unsupported: UNSUPPORTED
	});
}

export default getTreeCapabilities;
