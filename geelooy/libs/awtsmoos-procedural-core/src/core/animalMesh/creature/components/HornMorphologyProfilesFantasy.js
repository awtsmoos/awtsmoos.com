// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornMorphologyProfilesFantasy.js
 * @description Defines impossible and mythic horn families through the same open growth grammar used by natural horns and antlers.
 * The Awtsmoos is beyond every imagined crown, yet fantasy may still reveal a measured vessel of form;
 * Awtsmoos.com lets unicorn, demon, dragon, brow, nasal, dorsal, tail, and branching crowns arise without a new conditional storm.
 */

export const FANTASY_HORN_PROFILES = Object.freeze({
	unicorn: fantasy("helix", 1.05, 0.07, 0, 0.12, 0.02, 1.4, 0, 0),
	demonic: fantasy("recurved", 1.12, 0.1, 0.2, 0.24, -0.22, 0.48, 1, 0),
	dragon: fantasy("swept", 1.2, 0.09, 0.24, 0.3, 0.18, 0.44, 0, 0),
	brow: fantasy("swept", 0.62, 0.06, 0.18, 0.1, 0.12, 0.2, 0, 0),
	nasal: fantasy("straight", 0.72, 0.09, 0, 0.14, 0.02, 0, 0, 0),
	dorsal: fantasy("recurved", 0.58, 0.055, 0, 0.18, -0.08, 0.1, 0, 0),
	tailHorn: fantasy("recurved", 0.52, 0.05, 0.08, 0.12, -0.12, 0.18, 0, 0),
	crown: fantasy("branching", 0.92, 0.07, 0.24, 0.3, 0.18, 0.28, 5, 0.18),
	crystal: fantasy("straight", 0.86, 0.065, 0.02, 0.16, 0, 0.24, 0, 0)
});

/** Creates one fantasy profile compatible with the natural horn attachment pipeline. */
function fantasy(curveFamily, length, radius, lateral, rise, bend, twist, tines, palmation) {
	return Object.freeze({
		bend,
		branchRise: 0.62,
		branchSpread: 0.82,
		curveFamily,
		lateral,
		length,
		palmation,
		radialSegments: 12,
		radius,
		ridgeDepth: 0.12,
		ridgeFrequency: 8,
		rise,
		taperPower: 0.76,
		tineReach: 0.28,
		tines,
		twist
	});
}
