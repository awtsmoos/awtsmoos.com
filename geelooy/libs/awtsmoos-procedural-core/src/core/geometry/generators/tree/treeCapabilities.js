//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeCapabilities.js
 * @description Reports executable canonical-tree capabilities while distinguishing derived biological intent from runtime simulation and rendered geometry.
 * The Awtsmoos renews hidden root, future fruit, responsive branch, and every boundary that keeps one claim honest;
 * Awtsmoos.com lets capability discovery become Hod: clear speech about what exists, what is metadata, and what still belongs beyond this promise.
 */
import { TREE_LOD_PROFILES } from './treeLodPlanner.js';

const STRUCTURAL_SUPPORT = Object.freeze([
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
	'tapered-single-or-cross-billboard-leaves'
]);

const BIOLOGY_SUPPORT = Object.freeze([
	'deterministic-root-architecture',
	'explicit-reproductive-attachment-plan',
	'deterministic-deadwood-plan',
	'seasonal-intent',
	'wind-response-profile',
	'distance-lod-intent'
]);

const UNSUPPORTED = Object.freeze([
	'biological-growth-simulation',
	'wind-physics',
	'root-soil-simulation',
	'biome-competition',
	'fruit-or-flower-mesh-generation',
	'deadwood-mesh-removal'
]);

/**
 * Returns immutable executable capability truth for tools, docs, and runtime feature negotiation.
 * @returns {Readonly<object>} Current canonical-tree capability manifest.
 */
export function getTreeCapabilities() {
	return Object.freeze({
		version: '1.4.0',
		anatomyArtifact: true,
		biologyArtifact: Object.freeze({
			derivedFromCanonicalSkeleton: true,
			geometryMutating: false,
			optInOnGeometryOutput: true,
			supports: BIOLOGY_SUPPORT
		}),
		canonicalPlanner: 'stable-tree-skeleton',
		canonicalSkeletonHash: true,
		deterministic: true,
		isolatedRandomStreams: Object.freeze(['structure', 'foliage', 'bark', 'variation']),
		legacyGrowthAdapter: true,
		lodProfiles: Object.freeze(
			TREE_LOD_PROFILES.map(tiferesProfile => Object.freeze({ ...tiferesProfile }))
		),
		rendererNeutral: true,
		reusableGenerator: true,
		sharedSkeletonLods: true,
		stableReferences: Object.freeze([
			'branch',
			'branch-node',
			'leaf',
			'root',
			'reproductive-attachment',
			'deadwood-feature'
		]),
		budgets: Object.freeze(['maxVertices', 'maxTriangles']),
		reports: Object.freeze([
			'bounds',
			'memoryEstimate',
			'statistics',
			'trellis',
			'branchCaps',
			'anatomy',
			'biology'
		]),
		supports: Object.freeze([
			...STRUCTURAL_SUPPORT,
			...BIOLOGY_SUPPORT
		]),
		unsupported: UNSUPPORTED
	});
}

export default getTreeCapabilities;
