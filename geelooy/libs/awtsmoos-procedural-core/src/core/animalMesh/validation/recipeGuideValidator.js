// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_LIMITS
} from "../constants/animalMeshContract.js";

export function validateRecipeGuides(guides, result) {
	if (!guides || typeof guides !== "object" || Array.isArray(guides)) {
		result.addError(
			"/anatomical_guides",
			"guides",
			"Anatomical guides must be an object."
		);
		return;
	}
	for (const [guideId, guide] of Object.entries(guides)) {
		validateGuide(guideId, guide, result);
	}
}

function validateGuide(guideId, guide, result) {
	const path = `/anatomical_guides/${guideId}`;
	if (!Array.isArray(guide?.centerline) || guide.centerline.length < 2) {
		result.addError(
			`${path}/centerline`,
			"centerline",
			"Guide centerline requires at least two points."
		);
	}
	for (const [index, point] of (guide?.centerline || []).entries()) {
		if (!isVector3(point)) {
			result.addError(
				`${path}/centerline/${index}`,
				"vector3",
				"Centerline points must be finite three-number vectors."
			);
		}
	}
	if (!Array.isArray(guide?.sections) || guide.sections.length < 2) {
		result.addError(
			`${path}/sections`,
			"sections",
			"Guide requires at least two cross-sections."
		);
		return;
	}
	let previousT = -Infinity;
	guide.sections.forEach((section, index) => {
		const sectionPath = `${path}/sections/${index}`;
		if (!Number.isFinite(section.t) || section.t < 0 || section.t > 1) {
			result.addError(
				`${sectionPath}/t`,
				"section_t",
				"Section t must be between zero and one."
			);
		}
		if (section.t < previousT) {
			result.addError(
				`${sectionPath}/t`,
				"section_order",
				"Sections must be ordered by t."
			);
		}
		previousT = section.t;
		for (const key of [
			"half_width",
			"half_height"
		]) {
			if (!Number.isFinite(section[key]) || section[key] <= 0) {
				result.addError(
					`${sectionPath}/${key}`,
					"section_dimension",
					"Cross-section dimensions must be positive."
				);
			}
		}
	});
	validateSegments(guide, path, result);
}

function validateSegments(guide, path, result) {
	const radial = guide.radial_segments || 16;
	const longitudinal = guide.longitudinal_segments || 12;
	if (radial < 3 || radial > ANIMAL_MESH_LIMITS.maximumRadialSegments) {
		result.addError(
			`${path}/radial_segments`,
			"segments",
			"Radial segment count exceeds safe bounds."
		);
	}
	if (
		longitudinal < 1 ||
		longitudinal > ANIMAL_MESH_LIMITS.maximumLongitudinalSegments
	) {
		result.addError(
			`${path}/longitudinal_segments`,
			"segments",
			"Longitudinal segment count exceeds safe bounds."
		);
	}
}

function isVector3(value) {
	return (
		Array.isArray(value) &&
		value.length === 3 &&
		value.every(Number.isFinite)
	);
}
