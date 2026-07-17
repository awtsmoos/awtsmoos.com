// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export const proceduralCommandSchema = Object.freeze({
	type: "object",
	required: [
		"index",
		"id",
		"op",
		"target",
		"depends_on",
		"args"
	],
	additionalProperties: true,
	properties: {
		index: {
			type: "integer",
			minimum: 0
		},
		id: {
			type: "string",
			minLength: 1
		},
		op: {
			type: "string",
			minLength: 1
		},
		target: {
			type: "string",
			minLength: 1
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
		confidence: {
			type: "number",
			minimum: 0,
			maximum: 1
		}
	}
});
