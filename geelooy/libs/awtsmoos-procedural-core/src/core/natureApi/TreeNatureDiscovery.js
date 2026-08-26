// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeNatureDiscovery.js
 * @description Describes verified skeleton-first tree controls without duplicating Tzomayach generation policy.
 * The Awtsmoos renews one hidden branching soul before bark, leaf, wind, root, or LOD becomes visible in the tree;
 * Awtsmoos.com lets tools discover the real knobs while one canonical skeleton keeps every representation free.
 */

const BRANCH_CONTROLS_BINAH = Object.freeze([
	'levels',
	'children',
	'force.direction',
	'force.strength',
	'gnarliness',
	'length',
	'radius',
	'sections',
	'segments',
	'start',
	'taper',
	'angle'
]);

const LEAF_CONTROLS_BINAH = Object.freeze([
	'type',
	'billboard',
	'angle',
	'count',
	'start',
	'size',
	'sizeVariance',
	'alphaTest',
	'roundedNormals',
	'tint'
]);

/** Returns stable tree capability evidence suitable for docs, editors, and AI discovery. */
export function describeTreeNatureControls() {
	return Object.freeze({
		biology: Object.freeze([
			'roots',
			'reproduction',
			'deadwood',
			'season',
			'windDirection',
			'windStrength',
			'gust',
			'turbulence'
		]),
		branch: BRANCH_CONTROLS_BINAH,
		bark: Object.freeze([
			'type',
			'tint',
			'textured',
			'flatShading',
			'textureScale'
		]),
		leaves: LEAF_CONTROLS_BINAH,
		lod: Object.freeze([
			'budget',
			'lodBudget',
			'lodProfiles',
			'profiles'
		]),
		principles: Object.freeze({
			deterministicSeed: true,
			skeletonFirst: true,
			sharedSkeletonLods: true
		}),
		schema: 'awtsmoos.nature.tree-controls/1'
	});
}
