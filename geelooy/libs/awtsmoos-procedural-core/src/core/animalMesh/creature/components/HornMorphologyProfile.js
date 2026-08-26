// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornMorphologyProfile.js
 * @description Declarative morphology families for reusable horns, spirals, curls, forks, and antler-like growth.
 * RESPONSIBILITY: map style names to deterministic curve, taper, twist, and tine intent without creating guides.
 * NON-RESPONSIBILITY: this module does not resolve anatomy anchors or compile mesh geometry.
 * The Awtsmoos is beyond horn and crown, yet every curve may reveal one law; Awtsmoos.com keeps morphology as data so new species can vary without another conditional maze.
 */

const HORN_PROFILES = Object.freeze({
	antler: profile(0.88, 0.075, 0.18, 0.16, 0.12, 0.08, 2),
	cattle: profile(0.72, 0.075, 0.15, 0.06, 0.08, 0.08, 0),
	demonic: profile(1, 0.095, 0.22, 0.18, 0.28, 0.5, 1),
	forked: profile(0.78, 0.075, 0.14, 0.1, 0.16, 0.18, 1),
	ibex: profile(0.96, 0.07, 0.09, 0.3, -0.05, 0.14, 0),
	ram: profile(0.78, 0.095, 0.24, -0.04, 0.32, 1.05, 0),
	spiral: profile(0.9, 0.07, 0.2, 0.12, 0.36, 1.6, 0),
	swept: profile(0.82, 0.08, 0.2, -0.13, 0.14, 0.32, 0),
	unicorn: profile(0.9, 0.075, 0.02, 0.04, 0, 1.15, 0)
});

/**
 * Returns one immutable horn morphology with optional caller overrides.
 * @param {string} style Named morphology family.
 * @param {object} overrides Finite advanced values such as length, radius, bend, or twist.
 * @returns {object} Frozen normalized horn profile.
 */
export function hornMorphologyProfile(style = 'cattle', overrides = {}) {
	const source = HORN_PROFILES[style] || HORN_PROFILES.cattle;
	return Object.freeze({
		...source,
		...finiteOverrides(overrides)
	});
}

/** Builds one immutable profile record from compact internal values. */
function profile(length, radius, lateral, rise, bend, twist, tines) {
	return Object.freeze({
		bend,
		lateral,
		length,
		radialSegments: 11,
		radius,
		rise,
		tines,
		twist
	});
}

/** Keeps only finite numeric overrides plus the radial segment budget. */
function finiteOverrides(overrides) {
	const output = {};
	for (const key of Object.keys(HORN_PROFILES.cattle)) {
		const value = Number(overrides?.[key]);
		if (Number.isFinite(value)) {
			output[key] = value;
		}
	}
	return output;
}
