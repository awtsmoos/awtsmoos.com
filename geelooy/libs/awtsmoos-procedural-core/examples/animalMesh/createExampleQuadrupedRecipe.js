// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	createAnimalMeshRecipe
} from "../../src/core/animalMesh/index.js";
import {
	createExampleAnimalCommands
} from "./exampleCommands.js";
import {
	createExampleAnimalGuides
} from "./exampleGuides.js";
import {
	createExampleAnimalReferences
} from "./exampleReferences.js";
import {
	createExampleAnimalRig
} from "./exampleRig.js";

export function createExampleQuadrupedRecipe() {
	return createAnimalMeshRecipe({
		asset: {
			name: "reference_quadruped_01",
			species: "Example species",
			common_name: "Reference quadruped",
			pose: "neutral_standing",
			style: "realistic_game_ready",
			target_triangle_count: 24000,
			maximum_triangle_count: 32000,
			texture_resolution: 2048,
			generate_rig: true,
			generate_uvs: true,
			generate_lods: true
		},
		references: createExampleAnimalReferences(),
		measurements: {
			overall_length: {
				value: 2.2,
				confidence: 0.8
			},
			shoulder_height: {
				value: 1.3,
				confidence: 0.86
			}
		},
		landmarks: {
			withers: [
				0,
				0.4,
				1.3
			],
			pelvis_center: [
				0,
				-0.7,
				1.2
			],
			front_left_hoof: [
				-0.25,
				0.45,
				0.04
			],
			front_right_hoof: [
				0.25,
				0.45,
				0.04
			]
		},
		anatomical_guides: createExampleAnimalGuides(),
		materials: [
			{
				id: "coat",
				type: "principled",
				base_color: [
					0.35,
					0.22,
					0.12,
					1
				],
				roughness: 0.78,
				metallic: 0
			}
		],
		parts: [
			"torso",
			"front_left_leg",
			"front_right_leg"
		],
		commands: createExampleAnimalCommands(),
		rig: createExampleAnimalRig(),
		validation: {
			must_be_manifold: true,
			must_be_watertight: true,
			maximum_bone_influences: 4,
			maximum_triangle_count: 32000,
			required_named_parts: [
				"torso",
				"front_left_leg",
				"front_right_leg"
			]
		},
		uncertainties: [
			{
				region: "right_flank",
				reason: "No right-side image was supplied.",
				resolution: "Mirror the left-side base geometry.",
				confidence: 0.58
			}
		]
	});
}
