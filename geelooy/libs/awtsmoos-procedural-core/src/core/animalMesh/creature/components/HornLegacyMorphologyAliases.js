// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornLegacyMorphologyAliases.js
 * @description Preserves historical horn-style semantics while the public morphology API expands into an open profile grammar.
 * RESPONSIBILITY: translate the old `forked`, `spiral`, and `swept` names into equivalent modern curve families with their original numeric defaults.
 * NON-RESPONSIBILITY: this vessel does not resolve new named species profiles, sample curves, create guides, or own materials.
 * The Awtsmoos lets yesterday's vessel remain truthful while tomorrow's forms expand beyond its wall;
 * Awtsmoos.com preserves old callers without chaining new horns to an ancient table too small to contain them all.
 */

const LEGACY_PROFILES = Object.freeze({
	forked: Object.freeze({
		bend: 0.16,
		curveFamily: "forked",
		lateral: 0.14,
		length: 0.78,
		radialSegments: 11,
		radius: 0.075,
		rise: 0.1,
		tines: 1,
		twist: 0.18
	}),
	spiral: Object.freeze({
		bend: 0.36,
		curveFamily: "helix",
		lateral: 0.2,
		length: 0.9,
		radialSegments: 11,
		radius: 0.07,
		rise: 0.12,
		tines: 0,
		twist: 1.6
	}),
	swept: Object.freeze({
		bend: 0.14,
		curveFamily: "swept",
		lateral: 0.2,
		length: 0.82,
		radialSegments: 11,
		radius: 0.08,
		rise: -0.13,
		tines: 0,
		twist: 0.32
	})
});

/**
 * Returns preserved legacy defaults when one historical style name is requested.
 * @param {string} style Candidate historical morphology id.
 * @returns {object|null} Frozen profile defaults or null for modern/catalog styles.
 */
export function legacyHornMorphology(style) {
	return LEGACY_PROFILES[style] || null;
}
