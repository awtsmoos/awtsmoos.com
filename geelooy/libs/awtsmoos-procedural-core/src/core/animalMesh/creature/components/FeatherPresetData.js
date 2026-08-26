// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherPresetData.js
 * @description Stores immutable biological silhouette defaults for explicit creature feathers independently from attachment, repetition, guide generation, and rendering.
 * RESPONSIBILITY: describe canonical contour, down, flight, tail, display, and plume proportions through reusable raw data.
 * NON-RESPONSIBILITY: this file does not normalize overrides, transform anatomical frames, create shafts or vanes, distribute feather fields, compile meshes, or hydrate materials.
 * The Awtsmoos, Atzmus beyond every shaft and vane, renews softness, lift, display, and flight before a feather receives measure; Awtsmoos.com lets Chochmah pour many feather forms into quiet keilim, where each silhouette can differ without multiplying the laws that build it.
 */

/** Immutable feather silhouette presets consumed by `FeatherProfile`. */
export const FEATHER_PRESETS = Object.freeze({
	contour: preset(0.34, 0.12, 0.018, 0.02, 0.1, 0.12, 0.46, 0.08, 0.04),
	down: preset(0.18, 0.16, 0.026, 0, 0.04, 0.2, 0.34, 0.02, 0.16),
	flight: preset(0.62, 0.16, 0.014, 0.035, 0.08, 0.08, 0.58, 0.24, 0.02),
	tail: preset(0.72, 0.19, 0.012, 0.02, 0.12, 0.08, 0.62, 0.08, 0.01),
	display: preset(0.78, 0.26, 0.035, 0.04, 0.15, 0.1, 0.54, 0.14, 0.05),
	plume: preset(0.56, 0.21, 0.06, 0.08, 0.18, 0.16, 0.48, 0.05, 0.12)
});

/**
 * Creates one immutable raw feather silhouette.
 * @param {number} length Axial feather length.
 * @param {number} width Maximum vane width.
 * @param {number} lift Frame-local elevation.
 * @param {number} sweep Lateral tip sweep.
 * @param {number} spacing Fan-member spacing.
 * @param {number} vaneStart Normalized shaft amount where the vane begins.
 * @param {number} vanePeak Normalized shaft amount where the vane reaches maximum width.
 * @param {number} asymmetry Left/right vane width imbalance.
 * @param {number} shaftCurve Mid-shaft forward/up curvature intensity.
 * @returns {object} Frozen raw feather preset.
 */
function preset(
	length,
	width,
	lift,
	sweep,
	spacing,
	vaneStart,
	vanePeak,
	asymmetry,
	shaftCurve
) {
	return Object.freeze({
		asymmetry,
		length,
		lift,
		shaftCurve,
		spacing,
		sweep,
		vanePeak,
		vaneStart,
		width
	});
}
