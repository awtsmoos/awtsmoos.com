// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	transformSchema
} from "./sharedSchema.js";

export const proceduralSceneObjectSchema = Object.freeze({
	type: "object",
	required: ["id"],
	additionalProperties: true,
	properties: {
		id: {
			type: "string",
			minLength: 1
		},
		type: {
			type: "string"
		},
		name: {
			type: "string"
		},
		parentId: {
			type: ["string", "null"]
		},
		children: {
			type: "array",
			items: {
				type: "string"
			}
		},
		geometryId: {
			type: ["string", "null"]
		},
		dataBlockId: {
			type: ["string", "null"]
		},
		materialIds: {
			type: "array",
			items: {
				type: "string"
			}
		},
		transform: transformSchema,
		visible: {
			type: "boolean"
		},
		layers: {
			type: "array"
		},
		tags: {
			type: "array"
		},
		constraints: {
			type: "array"
		},
		metadata: {
			type: "object"
		}
	}
});
