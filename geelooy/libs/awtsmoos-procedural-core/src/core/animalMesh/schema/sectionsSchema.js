// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	confidenceSchema,
	referenceSchema,
	vector3Schema
} from "./sharedSchema.js";

export const commandSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"index",
		"id",
		"op",
		"target",
		"depends_on",
		"args",
		"confidence",
		"source_basis"
	],
	properties: {
		index: {
			type: "integer",
			minimum: 1
		},
		id: {
			type: "string"
		},
		op: {
			type: "string"
		},
		target: {
			type: "string"
		},
		depends_on: {
			type: "array",
			items: {
				type: "string"
			}
		},
		args: {
			type: "object"
		},
		confidence: confidenceSchema,
		source_basis: {
			type: "array",
			items: {
				type: "string"
			}
		}
	}
});

export const rigSchema = Object.freeze({
	type: "object",
	required: [
		"enabled"
	],
	properties: {
		enabled: {
			type: "boolean"
		},
		type: {
			type: "string"
		},
		bones: {
			type: "array",
			items: {
				type: "object",
				required: [
					"id",
					"parent",
					"head",
					"tail"
				],
				properties: {
					id: {
						type: "string"
					},
					parent: {
						type: [
							"string",
							"null"
						]
					},
					head: vector3Schema,
					tail: vector3Schema
				}
			}
		},
		weighting: {
			type: "object"
		}
	}
});

export const referencesArraySchema = Object.freeze({
	type: "array",
	minItems: 1,
	maxItems: 6,
	items: referenceSchema
});
