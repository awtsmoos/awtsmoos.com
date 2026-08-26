// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornMorphologyProfilesNatural.js
 * @description Defines reusable keratin horn families found across bovids, caprines, antelopes, and rhinocerotids.
 * The Awtsmoos lets strength bend into crescent, spear, curl, helix, lyre, or recurved crown;
 * Awtsmoos.com keeps each natural morphology as data so any creature may inherit the form without claiming the profile alone.
 */

export const NATURAL_HORN_PROFILES = Object.freeze({
	straight: horn("straight", 0.9, 0.075, 0, 0.08, 0, 0, 0),
	cattle: horn("swept", 0.78, 0.085, 0.18, 0.12, 0.1, 0.08, 0),
	buffalo: horn("crescent", 0.92, 0.1, 0.28, 0.06, 0.34, 0.14, 0),
	goat: horn("swept", 0.82, 0.068, 0.1, 0.28, -0.06, 0.08, 0),
	ram: horn("curl", 0.82, 0.1, 0.18, -0.02, 0.44, 1.1, 0),
	bighorn: horn("curl", 0.94, 0.12, 0.2, -0.04, 0.5, 1.2, 0),
	mouflon: horn("curl", 0.86, 0.09, 0.16, 0.04, 0.4, 0.96, 0),
	ibex: horn("recurved", 1.02, 0.075, 0.08, 0.34, -0.08, 0.12, 0),
	kudu: horn("helix", 1.18, 0.07, 0.2, 0.28, 0.18, 2.2, 0),
	oryx: horn("straight", 1.2, 0.052, 0.02, 0.14, 0.02, 0.06, 0),
	gazelle: horn("lyre", 0.94, 0.06, 0.2, 0.22, 0.16, 0.3, 0),
	antelope: horn("lyre", 1.0, 0.064, 0.24, 0.26, 0.14, 0.36, 0),
	scimitar: horn("recurved", 1.08, 0.062, 0.14, 0.18, -0.2, 0.18, 0),
	pronghorn: horn("swept", 0.72, 0.072, 0.12, 0.22, 0.12, 0.18, 1),
	rhino: horn("straight", 0.76, 0.12, 0, 0.18, 0.02, 0, 0)
});

/** Creates one compact natural horn profile while preserving legacy numeric keys. */
function horn(curveFamily, length, radius, lateral, rise, bend, twist, tines) {
	return Object.freeze({
		bend,
		curveFamily,
		lateral,
		length,
		radialSegments: 11,
		radius,
		ridgeDepth: 0.08,
		ridgeFrequency: 7,
		rise,
		taperPower: 0.82,
		tines,
		twist
	});
}
