// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembranePresetData.js
 * @description Stores immutable biological defaults for thin anatomical membranes without tying them to one species, renderer, or mesh implementation.
 * RESPONSIBILITY: define span, depth, lift, camber, ray count, tip bias, edge shaping, material role, surface role, and sidedness for canonical membrane families.
 * NON-RESPONSIBILITY: this file does not resolve anatomy, scale caller values, generate polygon points, triangulate membranes, mirror geometry, or hydrate textures.
 * The Awtsmoos, Atzmus beyond boundary and surface, renews finger and web, wing and patagium, fin and frill in one instant; Awtsmoos.com lets Chochmah pour these living sheets into bounded data-keilim, where every membrane may differ without multiplying the laws that hold it.
 */

/** Immutable canonical membrane presets consumed by `MembraneComponentProfile`. */
export const MEMBRANE_PRESETS = Object.freeze({
	webbing: preset(0.42, 0.5, 0, 0.025, 4, 0.74, 0.02, 'webbing_surface', 'webbing'),
	webbed_hand: preset(0.5, 0.54, 0.015, 0.035, 5, 0.7, 0.03, 'webbing_surface', 'webbing'),
	webbed_foot: preset(0.46, 0.52, 0.01, 0.03, 4, 0.72, 0.025, 'webbing_surface', 'webbing'),
	fin: preset(0.44, 0.72, 0.04, 0.07, 5, 0.58, 0.05, 'webbing_surface', 'fin'),
	flipper: preset(0.5, 0.82, 0.035, 0.06, 6, 0.62, 0.035, 'webbing_surface', 'fin'),
	frill: preset(0.62, 0.46, 0.1, 0.14, 7, 0.66, 0.08, 'frill_surface', 'frill'),
	wing_membrane: preset(0.82, 0.92, 0.05, 0.09, 8, 0.52, 0.04, 'wing_membrane_surface', 'membrane'),
	patagium: preset(0.72, 0.78, 0.045, 0.08, 7, 0.56, 0.045, 'wing_membrane_surface', 'membrane'),
	ear_membrane: preset(0.32, 0.36, 0.05, 0.1, 5, 0.62, 0.06, 'ear_membrane_surface', 'membrane'),
	membrane: preset(0.5, 0.56, 0.02, 0.05, 5, 0.68, 0.03, 'membrane_surface', 'webbing')
});

/**
 * Creates one immutable raw membrane preset.
 * @returns {object} Frozen renderer-neutral membrane defaults.
 */
function preset(
	span,
	depth,
	lift,
	camber,
	rays,
	tipBias,
	edgeScallop,
	materialId,
	surfaceRole
) {
	return Object.freeze({
		camber,
		depth,
		doubleSided: true,
		edgeScallop,
		lift,
		materialId,
		rays,
		span,
		surfaceRole,
		tipBias
	});
}
