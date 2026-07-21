// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos turns ordered anatomy into ordered time without owning animation.
 * This Awtsmoos.com module emits deterministic phase metadata for the existing
 * animation, rig, constraint, or external solver layers to evaluate explicitly.
 */
import { resolveAnimalBodyPlan } from "../morphology/bodyPlanCatalog.js";
import { freezeMorphologyValue } from "../morphology/morphologyValue.js";

const wrapPhase = (value) => ((value % 1) + 1) % 1;

const LIMB_PHASES = {
	quadruped: {
		walk: { front_left: 0, rear_right: 0.25, front_right: 0.5, rear_left: 0.75 },
		trot: { front_left: 0, rear_right: 0, front_right: 0.5, rear_left: 0.5 },
		canter: { rear_left: 0, rear_right: 0.18, front_left: 0.43, front_right: 0.58 },
		gallop: { rear_left: 0, rear_right: 0.12, front_left: 0.5, front_right: 0.62 }
	},
	biped: {
		walk: { left_leg: 0, right_leg: 0.5, left_arm: 0.5, right_arm: 0 },
		run: { left_leg: 0, right_leg: 0.5, left_arm: 0.5, right_arm: 0 }
	},
	avian: {
		flap: { left_wing: 0, right_wing: 0 },
		walk: { left_leg: 0, right_leg: 0.5 }
	}
};

function travelingWave(segmentCount, wavelength = 1.5) {
	const count = Math.max(2, Math.floor(Number(segmentCount) || 2));
	return Array.from({ length: count }, (_, index) => ({
		segment: index,
		phase: wrapPhase(index / Math.max(1, count - 1) * wavelength),
		amplitude: 0.35 + 0.65 * index / Math.max(1, count - 1)
	}));
}

function arthropodTripods(pairCount) {
	const count = Math.max(3, Math.floor(Number(pairCount) || 3));
	const groups = [[], []];
	for (let index = 0; index < count; index += 1) {
		groups[index % 2].push(`left_leg_${index + 1}`);
		groups[(index + 1) % 2].push(`right_leg_${index + 1}`);
	}
	return groups.map((members, index) => ({
		id: `tripod_${index + 1}`,
		phase: index * 0.5,
		members
	}));
}

export function createAnimalLocomotionProfile(options = {}) {
	const archetypeId = options.archetypeId || options.archetype_id || "quadruped";
	const plan = resolveAnimalBodyPlan(archetypeId);
	const mode = options.mode || plan.locomotion_modes[0];
	if (!plan.locomotion_modes.includes(mode)) {
		throw new Error(`B"H | ${mode} is not declared for ${archetypeId}.`);
	}
	const cycleDuration = Math.max(0.01, Number(options.cycleDuration ?? options.cycle_duration ?? 1));
	const base = {
		schema: "awtsmoos.animal.locomotion/1",
		archetype_id: archetypeId,
		mode,
		cycle_duration: cycleDuration,
		loop: mode !== "glide" && mode !== "idle",
		deterministic: true
	};
	if (archetypeId === "fish" || archetypeId === "serpentine") {
		return freezeMorphologyValue({
			...base,
			type: "traveling_wave",
			segments: travelingWave(options.segmentCount || options.segment_count || 16)
		});
	}
	if (archetypeId === "arthropod") {
		return freezeMorphologyValue({
			...base,
			type: "alternating_groups",
			groups: arthropodTripods(options.legPairs || options.leg_pairs || 3)
		});
	}
	const phases = LIMB_PHASES[archetypeId]?.[mode] || {};
	return freezeMorphologyValue({ ...base, type: "limb_phase_map", phases });
}
