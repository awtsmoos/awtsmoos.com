// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	vector3Schema
} from "./sharedSchema.js";

export const guideSectionSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"t",
		"half_width",
		"half_height"
	],
	properties: {
		t: {
			type: "number",
			minimum: 0,
			maximum: 1
		},
		half_width: {
			type: "number",
			exclusiveMinimum: 0
		},
		half_height: {
			type: "number",
			exclusiveMinimum: 0
		},
		rotation: {
			type: "number"
		},
		sharpness: {
			type: "number",
			minimum: 0,
			maximum: 1
		}
	}
});

export const anatomicalGuideSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"type",
		"centerline",
		"sections"
	],
	properties: {
		type: {
			enum: [
				"elliptical_loft",
				"profile_loft",
				"tapered_tube"
			]
		},
		centerline: {
			type: "array",
			minItems: 2,
			items: vector3Schema
		},
		sections: {
			type: "array",
			minItems: 2,
			items: guideSectionSchema
		},
		radial_segments: {
			type: "integer",
			minimum: 3,
			maximum: 128
		},
		longitudinal_segments: {
			type: "integer",
			minimum: 1,
			maximum: 256
		},
		symmetry: {
			type: "string"
		},
		metadata: {
			type: "object"
		}
	}
});
