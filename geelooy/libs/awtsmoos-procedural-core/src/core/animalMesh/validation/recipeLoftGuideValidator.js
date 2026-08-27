// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recipeLoftGuideValidator.js
 * @description Validates centerline loft anatomy, ordered cross-sections, and bounded radial/longitudinal work budgets.
 * RESPONSIBILITY: enforce the full elliptical-loft guide contract while shared point validation owns finite coordinate checks.
 * NON-RESPONSIBILITY: this module does not validate membranes, compile polygons, or judge biological plausibility.
 * The Awtsmoos stretches living form along a finite line while section follows section in measured time; Awtsmoos.com keeps each loft bounded, ordered, and sublime.
 */

import { ANIMAL_MESH_LIMITS } from '../constants/animalMeshContract.js';
import { anatomicalGuidePoints } from './anatomicalGuidePoints.js';
import { validateRecipeGuidePoints } from './recipeGuidePointValidator.js';

/** Validates one loft guide at its canonical recipe path. */
export function validateRecipeLoftGuide(guide, path, result) {
	const points = anatomicalGuidePoints(guide);
	if (points.length < 2) {
		result.addError(
			`${path}/centerline`,
			'centerline',
			'Loft guide centerline requires at least two points.'
		);
	}
	validateRecipeGuidePoints(points, `${path}/centerline`, result);
	if (!Array.isArray(guide.sections) || guide.sections.length < 2) {
		result.addError(
			`${path}/sections`,
			'sections',
			'Loft guide requires at least two cross-sections.'
		);
		return;
	}
	validateSections(guide.sections, path, result);
	validateSegments(guide, path, result);
}

function validateSections(sections, path, result) {
	let previousT = -Infinity;
	sections.forEach((section, index) => {
		const sectionPath = `${path}/sections/${index}`;
		validateSectionTime(section, sectionPath, previousT, result);
		previousT = section.t;
		validateSectionDimensions(section, sectionPath, result);
	});
}

function validateSectionTime(section, path, previousT, result) {
	if (!Number.isFinite(section.t) || section.t < 0 || section.t > 1) {
		result.addError(
			`${path}/t`,
			'section_t',
			'Section t must be between zero and one.'
		);
	}
	if (section.t < previousT) {
		result.addError(
			`${path}/t`,
			'section_order',
			'Sections must be ordered by t.'
		);
	}
}

function validateSectionDimensions(section, path, result) {
	for (const key of ['half_width', 'half_height']) {
		if (Number.isFinite(section[key]) && section[key] > 0) {
			continue;
		}
		result.addError(
			`${path}/${key}`,
			'section_dimension',
			'Cross-section dimensions must be positive.'
		);
	}
}

function validateSegments(guide, path, result) {
	const radial = guide.radial_segments || 16;
	const longitudinal = guide.longitudinal_segments || 12;
	if (radial < 3 || radial > ANIMAL_MESH_LIMITS.maximumRadialSegments) {
		result.addError(
			`${path}/radial_segments`,
			'segments',
			'Radial segment count exceeds safe bounds.'
		);
	}
	if (
		longitudinal < 1
		|| longitudinal > ANIMAL_MESH_LIMITS.maximumLongitudinalSegments
	) {
		result.addError(
			`${path}/longitudinal_segments`,
			'segments',
			'Longitudinal segment count exceeds safe bounds.'
		);
	}
}
