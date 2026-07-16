// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export const BUILTIN_ANIMAL_ARCHETYPES = Object.freeze([
	{
		id: "quadruped",
		body_plan: "four_limb_vertebrate",
		symmetry: "bilateral",
		required_guides: [
			"torso",
			"neck",
			"head",
			"front_left_leg",
			"rear_left_leg"
		],
		rig_type: "quadruped",
		mirror_pairs: [
			[
				"front_left_leg",
				"front_right_leg"
			],
			[
				"rear_left_leg",
				"rear_right_leg"
			]
		]
	},
	{
		id: "biped",
		body_plan: "two_limb_upright_vertebrate",
		symmetry: "bilateral",
		required_guides: [
			"torso",
			"neck",
			"head",
			"left_leg"
		],
		rig_type: "biped"
	},
	{
		id: "avian",
		body_plan: "winged_biped",
		symmetry: "bilateral",
		required_guides: [
			"torso",
			"neck",
			"head",
			"left_wing",
			"left_leg"
		],
		rig_type: "avian"
	},
	{
		id: "fish",
		body_plan: "aquatic_vertebrate",
		symmetry: "bilateral",
		required_guides: [
			"body",
			"head",
			"tail",
			"left_fin"
		],
		rig_type: "fish"
	},
	{
		id: "serpentine",
		body_plan: "elongated_limber_body",
		symmetry: "bilateral",
		required_guides: [
			"body",
			"head",
			"tail"
		],
		rig_type: "spline_chain"
	},
	{
		id: "arthropod",
		body_plan: "segmented_exoskeleton",
		symmetry: "bilateral",
		required_guides: [
			"thorax",
			"abdomen",
			"left_leg_01"
		],
		rig_type: "arthropod"
	},
	{
		id: "custom",
		body_plan: "user_defined",
		symmetry: "optional",
		required_guides: [],
		rig_type: "custom"
	}
]);
