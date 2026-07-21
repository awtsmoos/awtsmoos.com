// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals many living forms through one existing animal pipeline.
 * These Awtsmoos.com body plans describe anatomy for the current loft, rig,
 * weighting, recipe, and compiler systems; they are not alternate generators.
 */
import { cloneMorphologyValue, freezeMorphologyValue } from "./morphologyValue.js";

const SHARED = {
	body_length: [0.72, 1.42],
	body_depth: [0.62, 1.38],
	head_scale: [0.58, 1.55],
	limb_length: [0.55, 1.62],
	appendage_taper: [0.32, 0.92],
	muscle_mass: [0.45, 1.7]
};

const PLANS = {
	quadruped: {
		id: "four_limb_vertebrate",
		primary_axis: "+Z",
		segments: ["pelvis", "abdomen", "thorax", "neck", "head", "tail"],
		appendage_pairs: ["front_legs", "rear_legs", "ears", "eyes"],
		joint_chains: ["spine", "neck", "tail", "front_left_leg", "front_right_leg", "rear_left_leg", "rear_right_leg"],
		locomotion_modes: ["walk", "trot", "canter", "gallop", "idle"],
		trait_ranges: { ...SHARED, spine_flexibility: [0.25, 1.35], hoof_to_paw: [0, 1] }
	},
	biped: {
		id: "two_limb_upright_vertebrate",
		primary_axis: "+Y",
		segments: ["pelvis", "abdomen", "thorax", "neck", "head"],
		appendage_pairs: ["legs", "arms", "ears", "eyes"],
		joint_chains: ["spine", "neck", "left_leg", "right_leg", "left_arm", "right_arm"],
		locomotion_modes: ["walk", "run", "jump", "idle"],
		trait_ranges: { ...SHARED, torso_upright: [0.72, 1], arm_length: [0.48, 1.55] }
	},
	avian: {
		id: "winged_biped",
		primary_axis: "+Z",
		segments: ["pelvis", "thorax", "neck", "head", "tail"],
		appendage_pairs: ["wings", "legs", "eyes"],
		joint_chains: ["spine", "neck", "left_wing", "right_wing", "left_leg", "right_leg", "tail"],
		locomotion_modes: ["flap", "glide", "walk", "perch", "idle"],
		trait_ranges: { ...SHARED, wing_span: [0.72, 2.4], feather_length: [0.35, 1.8] }
	},
	fish: {
		id: "aquatic_vertebrate",
		primary_axis: "+Z",
		segments: ["head", "thorax", "abdomen", "caudal_peduncle", "tail"],
		appendage_pairs: ["pectoral_fins", "pelvic_fins", "eyes"],
		joint_chains: ["spine", "tail", "left_pectoral_fin", "right_pectoral_fin"],
		locomotion_modes: ["cruise", "burst", "turn", "hover"],
		trait_ranges: { ...SHARED, fin_area: [0.35, 1.9], lateral_wave: [0.3, 1.5] }
	},
	serpentine: {
		id: "elongated_limber_body",
		primary_axis: "+Z",
		segments: ["head", "cervical", "trunk", "tail"],
		appendage_pairs: ["eyes"],
		joint_chains: ["body_chain", "jaw"],
		locomotion_modes: ["slither", "sidewind", "swim", "coil", "idle"],
		trait_ranges: { ...SHARED, elongation: [1.2, 4.8], wave_amplitude: [0.2, 1.4] }
	},
	arthropod: {
		id: "segmented_exoskeleton",
		primary_axis: "+Z",
		segments: ["head", "thorax", "abdomen"],
		appendage_pairs: ["antennae", "mandibles", "legs", "eyes"],
		joint_chains: ["body_chain", "left_leg_rows", "right_leg_rows", "antennae"],
		locomotion_modes: ["tripod_walk", "run", "climb", "idle"],
		trait_ranges: { ...SHARED, leg_pairs: [3, 12], shell_thickness: [0.25, 1.75] }
	},
	custom: {
		id: "user_defined",
		primary_axis: "+Z",
		segments: [],
		appendage_pairs: [],
		joint_chains: [],
		locomotion_modes: ["custom"],
		trait_ranges: { ...SHARED }
	}
};

export const ANIMAL_BODY_PLAN_CATALOG = freezeMorphologyValue(PLANS);

export function resolveAnimalBodyPlan(archetypeId) {
	const plan = ANIMAL_BODY_PLAN_CATALOG[archetypeId];
	if (!plan) {
		throw new Error(`B"H | Unknown animal body plan: ${archetypeId}`);
	}
	return plan;
}

export function listAnimalBodyPlans() {
	return Object.entries(ANIMAL_BODY_PLAN_CATALOG).map(([archetypeId, plan]) => ({
		archetype_id: archetypeId,
		...cloneMorphologyValue(plan)
	}));
}
