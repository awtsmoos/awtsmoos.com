// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringPresetData.js
 * @description Stores immutable biological defaults for renderer-neutral creature coverings separately from normalization and distribution planning.
 * RESPONSIBILITY: define density, dimensions, variance, lay, stiffness, overlap, layering, instance budgets, and preferred realization hints for canonical covering families.
 * NON-RESPONSIBILITY: this file does not sample surfaces, place instances, generate fibers, compile shaders, normalize user overrides, or hydrate renderer resources.
 * The Awtsmoos, Atzmus beyond every hair, vane, scale, and quill, renews abundance before number can claim it; Awtsmoos.com lets Chochmah pour many garments into quiet data-keilim, where fur may curl, down may soften, and flight feathers may align without burdening the world that receives them.
 */

/** Immutable canonical covering presets consumed by `CoveringLayerProfile`. */
export const COVERING_PRESETS = Object.freeze({
	fur: preset(0.72, 0.038, 0.006, 0.22, 0.18, 0.2, 0.1, 1, 7200, 'shell_or_instances'),
	mane: preset(0.62, 0.18, 0.012, 0.28, 0.22, 0.3, 0.08, 3, 1800, 'strand_instances'),
	whiskers: preset(0.22, 0.24, 0.002, 0.18, 0.1, 0.02, 0.02, 1, 420, 'curve_instances'),
	feather_field: preset(0.7, 0.09, 0.028, 0.18, 0.12, 0.08, 0.34, 2, 2200, 'feather_instances'),
	contour_feathers: preset(0.78, 0.085, 0.03, 0.16, 0.1, 0.08, 0.38, 3, 2800, 'feather_instances'),
	down_feathers: preset(0.9, 0.035, 0.034, 0.28, 0.26, 0.42, 0.14, 2, 3600, 'cards_or_instances'),
	flight_feathers: preset(0.46, 0.32, 0.075, 0.12, 0.08, 0.02, 0.58, 1, 720, 'feather_instances'),
	tail_feathers: preset(0.4, 0.38, 0.09, 0.14, 0.1, 0.04, 0.52, 1, 420, 'feather_instances'),
	scales: preset(0.78, 0.018, 0.014, 0.18, 0.12, 0.02, 0.48, 2, 4200, 'surface_instances'),
	quills: preset(0.54, 0.14, 0.009, 0.22, 0.14, 0.04, 0.76, 1, 1600, 'curve_instances')
});

/**
 * Creates one immutable raw covering preset.
 * @param {number} density Normalized population density.
 * @param {number} length Mean element length.
 * @param {number} width Mean element width.
 * @param {number} lengthVariance Normalized length variation.
 * @param {number} orientationVariance Normalized directional variation.
 * @param {number} clumping Normalized clustering tendency.
 * @param {number} stiffness Normalized resistance to bending.
 * @param {number} layers Biological/visual layer count.
 * @param {number} maxInstances Maximum pre-quality distribution budget.
 * @param {string} representation Preferred portable realization strategy.
 * @returns {object} Frozen preset record.
 */
function preset(
	density,
	length,
	width,
	lengthVariance,
	orientationVariance,
	clumping,
	stiffness,
	layers,
	maxInstances,
	representation
) {
	return Object.freeze({
		clumping,
		curl: 0,
		density,
		layers,
		lay: Object.freeze([0, 0, 1]),
		length,
		lengthVariance,
		maxInstances,
		orientation: 'surface_normal',
		orientationVariance,
		overlap: 0.12,
		representation,
		stiffness,
		width,
		widthVariance: lengthVariance * 0.7
	});
}
