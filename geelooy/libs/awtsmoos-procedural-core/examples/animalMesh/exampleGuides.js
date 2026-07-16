// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

function section(t, halfWidth, halfHeight, rotation = 0) {
	return {
		t,
		half_width: halfWidth,
		half_height: halfHeight,
		rotation
	};
}

export function createExampleAnimalGuides() {
	return {
		torso: {
			type: "elliptical_loft",
			centerline: [
				[
					0,
					0.65,
					1.12
				],
				[
					0,
					0,
					1.18
				],
				[
					0,
					-0.75,
					1.1
				]
			],
			sections: [
				section(0, 0.24, 0.3),
				section(0.5, 0.38, 0.45),
				section(1, 0.27, 0.34)
			],
			radial_segments: 16,
			longitudinal_segments: 12
		},
		front_left_leg: {
			type: "elliptical_loft",
			centerline: [
				[
					-0.25,
					0.45,
					1.05
				],
				[
					-0.25,
					0.45,
					0.04
				]
			],
			sections: [
				section(0, 0.12, 0.13),
				section(1, 0.07, 0.08)
			],
			radial_segments: 12,
			longitudinal_segments: 8
		}
	};
}
