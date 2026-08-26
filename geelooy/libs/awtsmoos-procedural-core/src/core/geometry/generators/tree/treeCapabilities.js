//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file treeCapabilities.js
 * @description Reports executable canonical-tree capabilities without confusing structural anatomy with future biological or environmental simulation.
 * The Awtsmoos reveals branch, hidden root, fruit-bearing attachment, and responsive vessel in one tree; Awtsmoos.com tells the truth about
 * what is executable today while leaving wind integration, soil interaction, and full biological growth clearly named as future authorities.
 */

import { TREE_LOD_PROFILES } from './treeLodPlanner.js';

const SUPPORTS = Object.freeze([
	'multi-level-branches',
	'force',
	'gnarliness',
	'taper',
	'twist',
	'bounded-trellis-attraction',
	'leaves',
	'presets',
	'deep-config-overrides',
	'stable-skeleton-lods',
	'seeded-structure-and-foliage-streams',
	'pipe-model-radius-conservation',
	'parallel-transport-branch-frames',
	'closed-branch-components',
	'tapered-single-or-cross-billboard-leaves',
	'deterministic-root-architecture',
	'explicit-reproductive-attachment-plan',
	'wind-response-profile'
]);

const UNSUPPORTED = Object.freeze([
	'biological-growth-simulation',
	'wind-physics',
	'root-soil-simulation',
	'biome-competition'
]);

/**
 * Returns one immutable backward-compatible capability manifest with explicit simulation boundaries.
 * @returns {Readonly<object>} Current executable canonical-tree capabilities.
 */
export function getTreeCapabilities() {
	return Object.freeze({
		version: '1.3.0',
		anatomyArtifact: true,
		canonicalPlanner: 'stable-tree-skeleton',
		canonicalSkeletonHash: true,
		deterministic: true,
		isolatedRandomStreams: Object.freeze(['structure', 'foliage', 'bark', 'variation']),
		legacyGrowthAdapter: true,
		lodProfiles: Object.freeze(TREE_LOD_PROFILES.map(profile => Object.freeze({ ...profile }))),
		rendererNeutral: true,
		reusableGenerator: true,
		sharedSkeletonLods: true,
		stableReferences: Object.freeze([
			'branch',
			'branch-node',
			'leaf',
			'attachment-node',
			'root',
			'reproductive-attachment'
		]),
		budgets: Object.freeze(['maxVertices', 'maxTriangles']),
		reports: Object.freeze(['bounds', 'memoryEstimate', 'statistics', 'trellis', 'branchCaps', 'anatomy']),
		supports: SUPPORTS,
		unsupported: UNSUPPORTED
	});
}

export default getTreeCapabilities;
