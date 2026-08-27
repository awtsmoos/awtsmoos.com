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
	proceduralCommandSchema
} from "./commandSchema.js";

export const proceduralObjectRecipeSchema = Object.freeze({
	$schema: "https://json-schema.org/draft/2020-12/schema",
	$id: "awtsmoos.procedural-object-recipe.schema.json",
	title: "Awtsmoos Procedural Object Recipe",
	type: "object",
	required: [
		"schema",
		"schema_version",
		"recipe_id",
		"mode",
		"asset",
		"coordinate_system",
		"definitions",
		"materials",
		"data_blocks",
		"links",
		"objects",
		"commands",
		"outputs",
		"validation"
	],
	additionalProperties: false,
	properties: {
		schema: {
			const: PROCEDURAL_OBJECT_SCHEMA
		},
		schema_version: {
			const: PROCEDURAL_OBJECT_SCHEMA_VERSION
		},
		recipe_id: {
			type: "string",
			minLength: 1
		},
		mode: {
			const: "full_recipe"
		},
		asset: {
			type: "object"
		},
		coordinate_system: {
			type: "object"
		},
		definitions: {
			type: "object"
		},
		materials: {
			type: "array"
		},
		data_blocks: {
			type: "array"
		},
		links: {
			type: "array"
		},
		objects: {
			type: "array"
		},
		commands: {
			type: "array",
			items: proceduralCommandSchema
		},
		outputs: {
			type: "array"
		},
		validation: {
			type: "object"
		},
		metadata: {
			type: "object"
		},
		uncertainties: {
			type: "array"
		}
	}
});
