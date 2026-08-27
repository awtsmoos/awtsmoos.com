// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

function command(config) {
	return {
		confidence: 1,
		source_basis: [],
		args: {},
		depends_on: [],
		...config
	};
}

export function createExampleAnimalCommands() {
	return [
		command({
			index: 1,
			id: "torso_mesh",
			op: "loft_elliptical_sections",
			target: "torso",
			args: {
				guide: "torso",
				cap_start: true,
				cap_end: true,
				material_id: "coat"
			},
			confidence: 0.91,
			source_basis: [
				"front_01",
				"left_01"
			]
		}),
		command({
			index: 2,
			id: "left_front_leg",
			op: "loft_profile_sections",
			target: "front_left_leg",
			depends_on: [
				"torso_mesh"
			],
			args: {
				guide: "front_left_leg",
				cap_start: true,
				cap_end: true,
				material_id: "coat"
			},
			confidence: 0.89,
			source_basis: [
				"front_01",
				"left_01"
			]
		}),
		command({
			index: 3,
			id: "right_front_leg",
			op: "mirror_geometry",
			target: "front_right_leg",
			depends_on: [
				"left_front_leg"
			],
			args: {
				source: "front_left_leg",
				plane: "X",
				offset: 0,
				material_id: "coat"
			},
			confidence: 0.95,
			source_basis: [
				"front_01"
			]
		}),
		command({
			index: 4,
			id: "validate_all",
			op: "validate_mesh",
			target: "animal",
			depends_on: [
				"torso_mesh",
				"left_front_leg",
				"right_front_leg"
			]
		})
	];
}
