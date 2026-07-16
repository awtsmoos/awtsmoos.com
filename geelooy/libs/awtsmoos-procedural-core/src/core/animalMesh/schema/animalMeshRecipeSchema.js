// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../constants/animalMeshContract.js";
import {
	assetSchema
} from "./assetSchema.js";
import {
	coordinateSystemSchema
} from "./coordinateSchema.js";
import {
	anatomicalGuideSchema
} from "./guideSchema.js";
import {
	materialSchema
} from "./materialSchema.js";
import {
	measurementSchema,
	vector3Schema
} from "./sharedSchema.js";
import {
	commandSchema,
	referencesArraySchema,
	rigSchema
} from "./sectionsSchema.js";
import {
	meshValidationRequestSchema,
	uncertaintySchema
} from "./validationSchema.js";

export const animalMeshRecipeSchema = Object.freeze({
	$id: `${ANIMAL_MESH_SCHEMA}/${ANIMAL_MESH_SCHEMA_VERSION}`,
	type: "object",
	additionalProperties: false,
	required: [
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
	],
	properties: {
		schema: {
			const: ANIMAL_MESH_SCHEMA
		},
		schema_version: {
			const: ANIMAL_MESH_SCHEMA_VERSION
		},
		recipe_id: {
			type: "string",
			minLength: 1
		},
		mode: {
			const: "full_recipe"
		},
		asset: assetSchema,
		references: referencesArraySchema,
		coordinate_system: coordinateSystemSchema,
		measurements: {
			type: "object",
			additionalProperties: measurementSchema
		},
		landmarks: {
			type: "object",
			additionalProperties: vector3Schema
		},
		anatomical_guides: {
			type: "object",
			additionalProperties: anatomicalGuideSchema
		},
		materials: {
			type: "array",
			items: materialSchema
		},
		parts: {
			type: "array",
			items: {
				type: "string"
			}
		},
		commands: {
			type: "array",
			items: commandSchema
		},
		rig: rigSchema,
		validation: meshValidationRequestSchema,
		uncertainties: {
			type: "array",
			items: uncertaintySchema
		}
	}
});

export default animalMeshRecipeSchema;
