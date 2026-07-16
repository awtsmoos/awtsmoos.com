// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const assetSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"name",
		"species",
		"common_name",
		"pose",
		"style",
		"target_triangle_count",
		"maximum_triangle_count",
		"texture_resolution",
		"generate_rig",
		"generate_uvs",
		"generate_lods"
	],
	properties: {
		name: {
			type: "string",
			minLength: 1
		},
		species: {
			type: "string",
			minLength: 1
		},
		common_name: {
			type: "string",
			minLength: 1
		},
		sex: {
			type: "string"
		},
		age_class: {
			type: "string"
		},
		pose: {
			type: "string"
		},
		style: {
			type: "string"
		},
		target_triangle_count: {
			type: "integer",
			minimum: 1
		},
		maximum_triangle_count: {
			type: "integer",
			minimum: 1
		},
		texture_resolution: {
			type: "integer",
			minimum: 64
		},
		generate_rig: {
			type: "boolean"
		},
		generate_uvs: {
			type: "boolean"
		},
		generate_lods: {
			type: "boolean"
		}
	}
});
