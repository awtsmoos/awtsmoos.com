// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_COMPONENT_TYPES,
	PROCEDURAL_TOPOLOGY_MODES
} from "../constants/proceduralObjectContract.js";

export const attributeSchema = Object.freeze({
	type: "object",
	required: ["itemSize", "array"],
	additionalProperties: true,
	properties: {
		itemSize: {
			type: "integer",
			minimum: 1,
			maximum: 16
		},
		componentType: {
			enum: PROCEDURAL_COMPONENT_TYPES
		},
		normalized: {
			type: "boolean"
		},
		domain: {
			enum: ["vertex", "corner", "face", "instance", "object", "custom"]
		},
		array: {
			type: "array",
			items: {
				type: "number"
			}
		}
	}
});

export const geometryDeclarationSchema = Object.freeze({
	type: "object",
	additionalProperties: true,
	properties: {
		topology: {
			enum: PROCEDURAL_TOPOLOGY_MODES
		},
		attributes: {
			type: "object",
			additionalProperties: attributeSchema
		},
		indices: {
			oneOf: [
				{
					type: "array",
					items: {
						type: "integer",
						minimum: 0
					}
				},
				{
					type: "object"
				},
				{
					type: "null"
				}
			]
		},
		groups: {
			type: "array"
		},
		morphTargets: {
			type: "object"
		}
	}
});
