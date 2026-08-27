// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const vector3Schema = Object.freeze({
	type: "array",
	minItems: 3,
	maxItems: 3,
	items: {
		type: "number"
	}
});

export const confidenceSchema = Object.freeze({
	type: "number",
	minimum: 0,
	maximum: 1
});

export const measurementSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"value",
		"confidence"
	],
	properties: {
		value: {
			type: "number",
			minimum: 0
		},
		confidence: confidenceSchema
	}
});

export const referenceSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"reference_id",
		"view",
		"image_file_id"
	],
	properties: {
		reference_id: {
			type: "string"
		},
		view: {
			type: "string"
		},
		image_file_id: {
			type: "string"
		},
		orthographic_confidence: confidenceSchema,
		pose_consistency: confidenceSchema,
		usable_for_width: {
			type: "boolean"
		},
		usable_for_height: {
			type: "boolean"
		},
		usable_for_depth: {
			type: "boolean"
		},
		notes: {
			type: "string"
		}
	}
});
