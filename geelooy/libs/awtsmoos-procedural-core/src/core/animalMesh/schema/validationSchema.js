// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const meshValidationRequestSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"must_be_manifold",
		"must_be_watertight",
		"maximum_bone_influences",
		"maximum_triangle_count",
		"required_named_parts"
	],
	properties: {
		must_be_manifold: {
			type: "boolean"
		},
		must_be_watertight: {
			type: "boolean"
		},
		allow_internal_faces: {
			type: "boolean"
		},
		allow_nonuniform_negative_scale: {
			type: "boolean"
		},
		maximum_bone_influences: {
			type: "integer",
			minimum: 1,
			maximum: 4
		},
		maximum_triangle_count: {
			type: "integer",
			minimum: 1
		},
		minimum_triangle_count: {
			type: "integer",
			minimum: 0
		},
		minimum_ground_clearance: {
			type: "number"
		},
		maximum_ground_penetration: {
			type: "number",
			minimum: 0
		},
		required_named_parts: {
			type: "array",
			items: {
				type: "string"
			}
		}
	}
});

export const uncertaintySchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"region",
		"reason",
		"resolution",
		"confidence"
	],
	properties: {
		region: {
			type: "string"
		},
		reason: {
			type: "string"
		},
		resolution: {
			type: "string"
		},
		confidence: {
			type: "number",
			minimum: 0,
			maximum: 1
		}
	}
});
