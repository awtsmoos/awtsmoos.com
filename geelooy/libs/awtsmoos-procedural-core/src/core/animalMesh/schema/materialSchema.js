// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const materialSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"id",
		"type",
		"base_color",
		"roughness",
		"metallic"
	],
	properties: {
		id: {
			type: "string",
			minLength: 1
		},
		type: {
			enum: [
				"principled",
				"basic",
				"lambert",
				"phong",
				"standard"
			]
		},
		base_color: {
			type: "array",
			minItems: 4,
			maxItems: 4,
			items: {
				type: "number",
				minimum: 0,
				maximum: 1
			}
		},
		roughness: {
			type: "number",
			minimum: 0,
			maximum: 1
		},
		metallic: {
			type: "number",
			minimum: 0,
			maximum: 1
		},
		normal_strength: {
			type: "number",
			minimum: 0
		},
		mask_id: {
			type: "string"
		},
		texture_slots: {
			type: "object",
			additionalProperties: false,
			properties: {
				base_color: {
					type: "string"
				},
				normal: {
					type: "string"
				},
				roughness: {
					type: "string"
				},
				metallic: {
					type: "string"
				},
				ambient_occlusion: {
					type: "string"
				},
				alpha: {
					type: "string"
				}
			}
		}
	}
});
