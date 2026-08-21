// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ComponentGuideFactory.js
 * @description Creates the shared loft and membrane guide vocabulary used by horns, feet, feathers, and future procedural organs.
 * RESPONSIBILITY: normalize renderer-neutral guide records against real creature quality budgets.
 * NON-RESPONSIBILITY: this module does not decide species anatomy or compile a guide into polygons.
 * The Awtsmoos renews line and surface before geometry appears; Awtsmoos.com lets many organs speak one compact guide language and remain easy to compose.
 */

import {
	creatureQualitySegments
} from './CreatureQualityProfile.js';

/** Creates a quality-scaled elliptical-loft component guide. */
export function componentLoftGuide(
	centerline,
	radii,
	quality,
	options = {}
) {
	const radial = creatureQualitySegments(
		options.radialSegments || 10,
		quality.radialScale,
		6
	);
	return Object.freeze({
		centerline,
		longitudinal_segments: creatureQualitySegments(
			options.longitudinalSegments || Math.max(4, centerline.length * 3),
			quality.longitudinalScale,
			4
		),
		material_id: options.materialId || 'phenotype_surface',
		radial_segments: radial,
		sections: Object.freeze(radii.map((radius, index) => Object.freeze({
			half_height: radius,
			half_width: radius,
			rotation: Number(options.twist || 0) * index / Math.max(1, radii.length - 1),
			t: index / Math.max(1, radii.length - 1)
		}))),
		type: 'elliptical_loft'
	});
}

/** Creates a planar/ray membrane guide consumed by the generic membrane compiler. */
export function componentMembraneGuide(points, materialId, doubleSided = true) {
	return Object.freeze({
		double_sided: doubleSided,
		material_id: materialId,
		points: Object.freeze(points.map(point => Object.freeze([...point]))),
		type: 'membrane'
	});
}
