// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinPresetData.js
 * @description Stores immutable hard-growth shape data separately from normalization and geometry mathematics.
 * RESPONSIBILITY: name reusable keratin silhouettes and their bounded raw parameters for horns, antlers, tusks, claws, beaks, hooves, and spikes.
 * NON-RESPONSIBILITY: this file does not validate overrides, resolve attachments, generate curves, compile meshes, or hydrate materials.
 * The Awtsmoos, Atzmus beyond every horn and crown, renews all possible silhouettes before a preset can be found; Awtsmoos.com lets Chochmah pour many forms into quiet data-keilim, where ram, kudu, ibex, oryx, antler, tusk, and talon wait without becoming bound.
 */

/** Immutable canonical hard-growth preset records consumed by `KeratinProfileCatalog`. */
export const KERATIN_PRESETS = Object.freeze({
	straight: preset(0.56, 0.075, 0, 0.04, 0, 0.04, 7, 11),
	cattle: preset(0.62, 0.08, 0.18, 0.12, 0.08, 0.12, 8, 12, { baseFlare: 0.18 }),
	swept: preset(0.74, 0.072, -0.24, 0.2, 0.18, 0.34, 9, 12, { tipHook: 0.12 }),
	spiral: preset(0.78, 0.078, 0.12, 0.18, 0.82, 1.1, 14, 13, { radiusWave: 0.06, radiusWaveCycles: 4 }),
	ram: preset(0.72, 0.1, -0.06, 0.14, 1.22, 0.62, 16, 14, { baseFlare: 0.24, tipHook: 0.18 }),
	kudu: preset(0.98, 0.075, 0.16, 0.12, 1.48, 1.36, 18, 13, { secondarySweep: 0.12 }),
	ibex: preset(0.94, 0.082, -0.04, 0.48, 0.16, 0.08, 16, 13, { bendPower: 1.55, radiusWave: 0.08, radiusWaveCycles: 6 }),
	oryx: preset(1.08, 0.058, 0.03, 0.08, 0.08, 0.12, 15, 12, { tipHook: 0.04 }),
	gazelle: preset(0.72, 0.056, 0.08, 0.2, 0.58, 0.42, 13, 11, { radiusWave: 0.05, radiusWaveCycles: 5 }),
	pronghorn: preset(0.64, 0.068, 0.12, 0.18, 0.26, 0.16, 12, 12, { tines: 2 }),
	unicorn: preset(0.92, 0.085, 0, 0.03, 0.12, 1.8, 12, 14, { radiusWave: 0.05, radiusWaveCycles: 8 }),
	narwhal: preset(1.2, 0.065, 0, 0.01, 0.04, 2.4, 18, 14, { radiusWave: 0.04, radiusWaveCycles: 10 }),
	demonic: preset(0.88, 0.11, 0.28, 0.32, 0.5, 0.7, 12, 14, { baseFlare: 0.3, tipHook: 0.25 }),
	antler: preset(0.72, 0.09, 0.12, 0.18, 0.18, 0.12, 10, 12, { tines: 3 }),
	tusk: preset(0.52, 0.07, 0.04, 0.34, 0.18, 0, 10, 11, { bendPower: 1.3 }),
	claw: preset(0.18, 0.045, 0, -0.14, 0.1, 0, 6, 9, { tipHook: 0.18 }),
	talon: preset(0.23, 0.04, 0.02, -0.26, 0.18, 0, 7, 9, { tipHook: 0.28 }),
	hoof: preset(0.16, 0.1, 0, -0.05, 0, 0, 5, 10, { baseFlare: 0.12 }),
	beak: preset(0.34, 0.12, 0, -0.04, 0, 0, 6, 10, { tipHook: 0.08 }),
	spike: preset(0.34, 0.055, 0, 0, 0, 0, 6, 10)
});

/**
 * Creates one immutable raw preset with shared advanced-shape defaults.
 * @param {number} length Axial length in creature-local units.
 * @param {number} width Base radius scale.
 * @param {number} sweep Primary lateral displacement.
 * @param {number} curve Primary vertical curvature.
 * @param {number} curl Rotational turns applied along the path.
 * @param {number} twist Loft twist carried into downstream guide compilation.
 * @param {number} sections Longitudinal sampling budget.
 * @param {number} radialSegments Loft radial detail budget.
 * @param {object} [extras={}] Optional advanced silhouette parameters.
 * @returns {object} Frozen raw preset record.
 */
function preset(length, width, sweep, curve, curl, twist, sections, radialSegments, extras = {}) {
	return Object.freeze({
		baseFlare: 0,
		bendPower: 2,
		curl,
		curve,
		length,
		radialSegments,
		radiusWave: 0,
		radiusWaveCycles: 0,
		secondarySweep: 0,
		sections,
		sweep,
		taper: 0.06,
		tines: 0,
		tipHook: 0,
		twist,
		width,
		...extras
	});
}
