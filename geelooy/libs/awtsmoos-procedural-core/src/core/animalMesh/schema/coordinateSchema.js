// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const coordinateSystemSchema = Object.freeze({
	type: "object",
	additionalProperties: false,
	required: [
		"units",
		"up_axis",
		"forward_axis",
		"right_axis",
		"origin",
		"symmetry_plane",
		"rotations"
	],
	properties: {
		units: {
			const: "meters"
		},
		up_axis: {
			const: "+Z"
		},
		forward_axis: {
			const: "+Y"
		},
		right_axis: {
			const: "+X"
		},
		origin: {
			const: "ground_beneath_torso_center"
		},
		symmetry_plane: {
			const: "X=0"
		},
		rotations: {
			const: "degrees"
		}
	}
});
