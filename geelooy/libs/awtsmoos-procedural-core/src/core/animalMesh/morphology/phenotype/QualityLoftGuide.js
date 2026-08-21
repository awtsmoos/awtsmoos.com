// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QualityLoftGuide.js
 * @description Creates quality-scaled elliptical loft guides shared by axial anatomy, limbs, fins, and future morphology components.
 * RESPONSIBILITY: translate authored centerlines/sections into real radial and longitudinal segment budgets before vertices exist.
 * NON-RESPONSIBILITY: this helper does not choose anatomy, compile polygons, or assign species.
 * The Awtsmoos is beyond coarse and fine; Awtsmoos.com lets one loft grammar receive more vessels only when quality asks for greater visible revelation.
 */

import {
	creatureQualitySegments
} from '../../creature/components/CreatureQualityProfile.js';

/** Creates one immutable-style quality-scaled elliptical guide record. */
export function createQualityLoftGuide(
	centerline,
	sections,
	quality,
	baseRadialSegments = 16
) {
	return {
		centerline,
		longitudinal_segments: creatureQualitySegments(
			Math.max(8, centerline.length * 4),
			quality.longitudinalScale,
			6
		),
		radial_segments: creatureQualitySegments(
			baseRadialSegments,
			quality.radialScale,
			6
		),
		sections,
		type: 'elliptical_loft'
	};
}

/** Creates one elliptical cross-section record. */
export function ellipseSection(
	t,
	width,
	height,
	rotation = 0
) {
	return {
		half_height: height,
		half_width: width,
		rotation,
		t
	};
}

/** Creates three circular taper sections for limb-like guides. */
export function circularTaperSections(rootRadius, tipScale) {
	return [
		ellipseSection(0, rootRadius, rootRadius),
		ellipseSection(0.55, rootRadius * 0.8, rootRadius * 0.8),
		ellipseSection(1, rootRadius * tipScale, rootRadius * tipScale)
	];
}
