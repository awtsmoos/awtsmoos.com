// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_COORDINATE_SYSTEM,
	ANIMAL_MESH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../constants/animalMeshContract.js";

const REQUIRED_KEYS = [
	"schema",
	"schema_version",
	"recipe_id",
	"mode",
	"asset",
	"references",
	"coordinate_system",
	"measurements",
	"landmarks",
	"anatomical_guides",
	"materials",
	"parts",
	"commands",
	"rig",
	"validation",
	"uncertainties"
];

const ALLOWED_KEYS = new Set(REQUIRED_KEYS);

export function validateRecipeEnvelope(recipe, result) {
	for (const key of REQUIRED_KEYS) {
		if (!(key in recipe)) {
			result.addError(`/${key}`, "required", "Required field is missing.");
		}
	}
	for (const key of Object.keys(recipe)) {
		if (!ALLOWED_KEYS.has(key)) {
			result.addError(
				`/${key}`,
				"unknown_field",
				"Unknown top-level recipe field."
			);
		}
	}
	if (recipe.schema !== ANIMAL_MESH_SCHEMA) {
		result.addError("/schema", "schema", "Unknown recipe schema.");
	}
	if (recipe.schema_version !== ANIMAL_MESH_SCHEMA_VERSION) {
		result.addError(
			"/schema_version",
			"version",
			"Unsupported schema version."
		);
	}
	if (recipe.mode !== "full_recipe") {
		result.addError(
			"/mode",
			"mode",
			"Full recipes must use full_recipe mode."
		);
	}
	if (!recipe.recipe_id || typeof recipe.recipe_id !== "string") {
		result.addError(
			"/recipe_id",
			"recipe_id",
			"Recipe id must be a non-empty string."
		);
	}
	validateCoordinateSystem(recipe.coordinate_system, result);
}

function validateCoordinateSystem(coordinateSystem, result) {
	for (const [key, expectedValue] of Object.entries(
		ANIMAL_MESH_COORDINATE_SYSTEM
	)) {
		if (coordinateSystem?.[key] !== expectedValue) {
			result.addError(
				`/coordinate_system/${key}`,
				"coordinate_system",
				`Coordinate convention must be ${expectedValue}.`
			);
		}
	}
}
