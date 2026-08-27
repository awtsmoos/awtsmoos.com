// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_OBJECT_PATCH_SCHEMA,
	PROCEDURAL_OBJECT_SCHEMA_VERSION
} from "../constants/proceduralObjectContract.js";

export const proceduralObjectPatchSchema = Object.freeze({
	$schema: "https://json-schema.org/draft/2020-12/schema",
	$id: "awtsmoos.procedural-object-recipe-patch.schema.json",
	type: "object",
	required: [
		"schema",
		"schema_version",
		"recipe_id",
		"mode",
		"patch_id",
		"operations"
	],
	properties: {
		schema: {
			const: PROCEDURAL_OBJECT_PATCH_SCHEMA
		},
		schema_version: {
			const: PROCEDURAL_OBJECT_SCHEMA_VERSION
		},
		recipe_id: {
			type: "string"
		},
		mode: {
			const: "patch"
		},
		patch_id: {
			type: "string"
		},
		operations: {
			type: "array",
			minItems: 1,
			items: {
				type: "object",
				required: ["op", "path", "reason"],
				properties: {
					op: {
						enum: ["add", "replace", "remove"]
					},
					path: {
						type: "string"
					},
					reason: {
						type: "string"
					}
				}
			}
		}
	}
});
