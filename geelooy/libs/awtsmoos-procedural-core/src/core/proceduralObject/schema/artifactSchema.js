// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_OBJECT_ARTIFACT_SCHEMA,
	PROCEDURAL_OBJECT_SCHEMA_VERSION
} from "../constants/proceduralObjectContract.js";
import {
	geometryDeclarationSchema
} from "./geometrySchema.js";
import {
	proceduralSceneObjectSchema
} from "./objectSchema.js";

export const proceduralObjectArtifactSchema = Object.freeze({
	$schema: "https://json-schema.org/draft/2020-12/schema",
	$id: "awtsmoos.procedural-object-artifact.schema.json",
	title: "Awtsmoos Procedural Object Artifact",
	type: "object",
	required: [
		"schema",
		"schema_version",
		"geometries",
		"objects",
		"rootObjectIds",
		"materials",
		"dataBlocks",
		"links",
		"armatures",
		"animations",
		"deferredCommands"
	],
	additionalProperties: true,
	properties: {
		schema: {
			const: PROCEDURAL_OBJECT_ARTIFACT_SCHEMA
		},
		schema_version: {
			const: PROCEDURAL_OBJECT_SCHEMA_VERSION
		},
		recipe_id: {
			type: ["string", "null"]
		},
		geometries: {
			type: "object",
			additionalProperties: geometryDeclarationSchema
		},
		objects: {
			type: "object",
			additionalProperties: proceduralSceneObjectSchema
		},
		rootObjectIds: {
			type: "array",
			items: {
				type: "string"
			}
		},
		materials: {
			type: "object"
		},
		dataBlocks: {
			type: "object"
		},
		links: {
			type: "array"
		},
		armatures: {
			type: "object"
		},
		animations: {
			type: "object"
		},
		deferredCommands: {
			type: "array"
		}
	}
});
