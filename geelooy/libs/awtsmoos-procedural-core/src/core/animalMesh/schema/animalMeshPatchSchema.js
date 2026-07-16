// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_PATCH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../constants/animalMeshContract.js";

export const animalMeshPatchSchema = Object.freeze({
	$id: `${ANIMAL_MESH_PATCH_SCHEMA}/${ANIMAL_MESH_SCHEMA_VERSION}`,
	type: "object",
	additionalProperties: false,
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
			const: ANIMAL_MESH_PATCH_SCHEMA
		},
		schema_version: {
			const: ANIMAL_MESH_SCHEMA_VERSION
		},
		recipe_id: {
			type: "string",
			minLength: 1
		},
		mode: {
			const: "patch"
		},
		patch_id: {
			type: "string",
			minLength: 1
		},
		operations: {
			type: "array",
			minItems: 1,
			items: {
				type: "object",
				additionalProperties: false,
				required: [
					"op",
					"path",
					"reason"
				],
				properties: {
					op: {
						enum: [
							"add",
							"replace",
							"remove"
						]
					},
					path: {
						type: "string",
						pattern: "^/"
					},
					old_value: {},
					new_value: {},
					reason: {
						type: "string"
					}
				}
			}
		},
		regenerate_from_command: {
			type: "string"
		}
	}
});

export default animalMeshPatchSchema;
