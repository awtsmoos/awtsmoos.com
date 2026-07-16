// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_VIEWS
} from "../constants/animalMeshContract.js";
import {
	isKnownAnimalLandmark
} from "../landmarks/landmarkCatalog.js";

export function validateRecipeReferences(references, result) {
	if (!Array.isArray(references) || references.length < 1 || references.length > 6) {
		result.addError(
			"/references",
			"reference_count",
			"Provide one to six references."
		);
		return;
	}
	const ids = new Set();
	references.forEach((reference, index) => {
		if (!ANIMAL_MESH_VIEWS.includes(reference?.view)) {
			result.addError(
				`/references/${index}/view`,
				"view",
				"Unknown reference view."
			);
		}
		if (!reference?.image_file_id) {
			result.addError(
				`/references/${index}/image_file_id`,
				"file_id",
				"Uploaded file id is required."
			);
		}
		if (!reference?.reference_id || ids.has(reference.reference_id)) {
			result.addError(
				`/references/${index}/reference_id`,
				"duplicate",
				"Reference id must be present and unique."
			);
		}
		ids.add(reference?.reference_id);
	});
}

export function validateRecipeLandmarks(landmarks, result) {
	for (const [name, point] of Object.entries(landmarks || {})) {
		if (!isKnownAnimalLandmark(name)) {
			result.addError(
				`/landmarks/${name}`,
				"landmark",
				"Landmark name is not standardized."
			);
		}
		if (
			!Array.isArray(point) ||
			point.length !== 3 ||
			!point.every(Number.isFinite)
		) {
			result.addError(
				`/landmarks/${name}`,
				"vector3",
				"Landmark must be a finite three-number vector."
			);
		}
	}
}
