// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export const finiteNumberSchema = Object.freeze({
	type: "number"
});

export const vector3Schema = Object.freeze({
	type: "array",
	items: finiteNumberSchema,
	minItems: 3,
	maxItems: 3
});

export const transformSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	properties: {
		position: vector3Schema,
		rotation_euler: vector3Schema,
		scale: vector3Schema,
		matrix: {
			type: "array",
			items: finiteNumberSchema,
			minItems: 16,
			maxItems: 16
		}
	}
});
