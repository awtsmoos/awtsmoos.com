// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornMorphologyProfilesAntler.js
 * @description Defines branching antler families with open branch, spread, tine, and palmation controls.
 * The Awtsmoos lets one beam divide into many crowns without division in the Source;
 * Awtsmoos.com keeps deer, elk, moose, caribou, and stranger antlers as reusable growth laws rather than species prisons.
 */

export const ANTLER_PROFILES = Object.freeze({
	antler: antler("branching", 0.9, 0.065, 0.16, 0.28, 0.14, 0.08, 3, 0),
	deer: antler("branching", 1.0, 0.068, 0.18, 0.32, 0.18, 0.1, 4, 0),
	roe: antler("forked", 0.72, 0.056, 0.1, 0.28, 0.12, 0.06, 3, 0),
	elk: antler("branching", 1.22, 0.08, 0.22, 0.42, 0.2, 0.14, 6, 0),
	caribou: antler("branching", 1.18, 0.074, 0.26, 0.36, 0.18, 0.12, 7, 0.22),
	moose: antler("palmated", 1.1, 0.09, 0.34, 0.32, 0.18, 0.08, 5, 0.78),
	palmated: antler("palmated", 1.0, 0.085, 0.3, 0.3, 0.16, 0.08, 5, 0.68),
	forkedAntler: antler("forked", 0.82, 0.06, 0.12, 0.3, 0.14, 0.08, 2, 0)
});

/** Creates one branching-antler profile while preserving legacy horn keys. */
function antler(curveFamily, length, radius, lateral, rise, bend, twist, tines, palmation) {
	return Object.freeze({
		bend,
		branchRise: 0.56,
		branchSpread: 0.72,
		curveFamily,
		lateral,
		length,
		palmation,
		radialSegments: 10,
		radius,
		ridgeDepth: 0.04,
		ridgeFrequency: 3,
		rise,
		taperPower: 0.88,
		tineReach: 0.26,
		tines,
		twist
	});
}
