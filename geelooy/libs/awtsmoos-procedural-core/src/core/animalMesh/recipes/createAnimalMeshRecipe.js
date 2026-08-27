// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	hashStableRecipeValue,
	stableRecipeJson
} from "../../recipes/stableRecipeJson.js";
import {
	ANIMAL_MESH_COORDINATE_SYSTEM,
	ANIMAL_MESH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../constants/animalMeshContract.js";
import {
	animalMeshRecipeValidator
} from "../validation/AnimalMeshRecipeValidator.js";

function cloneJson(value) {
	return JSON.parse(JSON.stringify(value));
}

/**
 * Creates a normalized, deterministic animal recipe without inventing uploads.
 *
 * @param {Object} input User or vision-model recipe data.
 * @returns {Object} Validated recipe with stable identity.
 */
export function createAnimalMeshRecipe(input) {
	const recipe = {
		schema: ANIMAL_MESH_SCHEMA,
		schema_version: ANIMAL_MESH_SCHEMA_VERSION,
		recipe_id: input.recipe_id || "",
		mode: "full_recipe",
		asset: cloneJson(input.asset || {}),
		references: cloneJson(input.references || []),
		coordinate_system: {
			...ANIMAL_MESH_COORDINATE_SYSTEM,
			...(input.coordinate_system || {})
		},
		measurements: cloneJson(input.measurements || {}),
		landmarks: cloneJson(input.landmarks || {}),
		anatomical_guides: cloneJson(input.anatomical_guides || {}),
		materials: cloneJson(input.materials || []),
		parts: cloneJson(input.parts || []),
		commands: cloneJson(input.commands || []),
		rig: cloneJson(input.rig || {
			enabled: false,
			bones: []
		}),
		validation: cloneJson(input.validation || {}),
		uncertainties: cloneJson(input.uncertainties || [])
	};
	if (!recipe.recipe_id) {
		recipe.recipe_id = `animal_${hashAnimalMeshRecipe(recipe)}`;
	}
	animalMeshRecipeValidator.assertValid(recipe);
	return recipe;
}

/**
 * Produces canonical JSON for storage, comparison, and revision history.
 *
 * @param {Object} recipe Recipe.
 * @returns {string} Canonical JSON.
 */
export function serializeAnimalMeshRecipe(recipe) {
	animalMeshRecipeValidator.assertValid(recipe);
	return stableRecipeJson(recipe);
}

/**
 * Returns a stable identity while excluding the identity field itself.
 *
 * @param {Object} recipe Recipe-like value.
 * @returns {string} Stable hexadecimal identity.
 */
export function hashAnimalMeshRecipe(recipe) {
	const identityValue = {
		...cloneJson(recipe),
		recipe_id: ""
	};
	return hashStableRecipeValue(identityValue);
}

/**
 * Parses and validates a serialized recipe.
 *
 * @param {string} text JSON text.
 * @returns {Object} Normalized recipe.
 */
export function deserializeAnimalMeshRecipe(text) {
	return createAnimalMeshRecipe(JSON.parse(text));
}
