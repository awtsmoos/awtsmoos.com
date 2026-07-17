// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_OBJECT_SCHEMA,
	PROCEDURAL_OBJECT_SCHEMA_VERSION
} from "../constants/proceduralObjectContract.js";
import {
	hashStableRecipeValue,
	stableRecipeJson
} from "../../recipes/stableRecipeJson.js";

/**
 * Creates a normalized generic procedural-object recipe.
 *
 * @param {object} input Partial recipe declaration.
 * @returns {object} Complete recipe envelope.
 */
export function createProceduralObjectRecipe(input = {}) {
	return {
		schema: PROCEDURAL_OBJECT_SCHEMA,
		schema_version: PROCEDURAL_OBJECT_SCHEMA_VERSION,
		recipe_id: input.recipe_id || `object-${hashStableRecipeValue(input)}`,
		mode: "full_recipe",
		asset: {...input.asset},
		coordinate_system: {
			units: "meters",
			up_axis: "+Z",
			forward_axis: "+Y",
			right_axis: "+X",
			rotations: "degrees",
			...input.coordinate_system
		},
		definitions: {...input.definitions},
		materials: [...(input.materials || [])],
		data_blocks: [...(input.data_blocks || input.dataBlocks || [])],
		links: [...(input.links || [])],
		objects: [...(input.objects || [])],
		commands: [...(input.commands || [])],
		outputs: [...(input.outputs || [])],
		validation: {...input.validation},
		metadata: {...input.metadata},
		uncertainties: [...(input.uncertainties || [])]
	};
}

/**
 * Serializes a recipe into canonical inspectable JSON.
 *
 * @param {object} recipe Recipe.
 * @returns {string} Stable JSON.
 */
export function serializeProceduralObjectRecipe(recipe) {
	return stableRecipeJson(recipe);
}

/**
 * Parses a serialized recipe without executing anything.
 *
 * @param {string} text JSON text.
 * @returns {object} Parsed recipe.
 */
export function deserializeProceduralObjectRecipe(text) {
	return JSON.parse(text);
}

/**
 * Produces a stable recipe identity.
 *
 * @param {object} recipe Recipe.
 * @returns {string} Deterministic hexadecimal hash.
 */
export function hashProceduralObjectRecipe(recipe) {
	return hashStableRecipeValue(recipe);
}
