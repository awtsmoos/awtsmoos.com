// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures motion before any renderer moves a bone. This
 * Awtsmoos.com planner is the single locomotion authority: it joins the existing
 * recipe, genome, and body-plan catalog into deterministic, solver-neutral data.
 */
import { normalizeAnimalGenome } from "../morphology/animalGenome.js";
import { resolveAnimalBodyPlan } from "../morphology/bodyPlanCatalog.js";

const DEFAULT_GAITS = Object.freeze({
	quadruped: "walk",
	biped: "walk",
	avian: "flap",
	fish: "swim",
	serpentine: "undulate",
	arthropod: "metachronal",
	custom: "walk"
});

function collectMoverNames(recipe) {
	const names = new Set(recipe.parts || []);
	for (const bone of recipe.rig?.bones || []) {
		names.add(bone.id);
	}
	return [...names].filter((name) => /(leg|limb|arm|wing|fin|foot|hoof|paw|tail|spine)/i.test(name));
}

function quadrupedPhase(name, gait, fallback) {
	const front = /(front|fore)/i.test(name);
	const right = /right/i.test(name);
	if (gait === "trot") return front === right ? 0 : 0.5;
	if (gait === "gallop") return front ? (right ? 0.12 : 0) : (right ? 0.68 : 0.56);
	if (front && !right) return 0;
	if (!front && right) return 0.25;
	if (front && right) return 0.5;
	if (!front && !right) return 0.75;
	return fallback;
}

function phaseForName(name, index, bodyPlan, gait) {
	if (bodyPlan === "quadruped") return quadrupedPhase(name, gait, index * 0.25 % 1);
	if (["biped", "avian"].includes(bodyPlan)) return /right/i.test(name) ? 0.5 : 0;
	return index * 0.17 % 1;
}

function travelingWave(plan, genome, options) {
	const count = Math.max(2, Math.floor(Number(options.segmentCount) || plan.segments.length || 16));
	const amplitude = genome.genes.flexibility * 0.35;
	return Array.from({ length: count }, (_, index) => ({
		segment: index,
		phase: index / Math.max(1, count - 1) * 1.5 % 1,
		amplitude: amplitude * (0.35 + 0.65 * index / Math.max(1, count - 1))
	}));
}

function arthropodGroups(options) {
	const pairCount = Math.max(3, Math.floor(Number(options.legPairs) || 3));
	const groups = [[], []];
	for (let index = 0; index < pairCount; index += 1) {
		groups[index % 2].push(`left_leg_${index + 1}`);
		groups[(index + 1) % 2].push(`right_leg_${index + 1}`);
	}
	return groups.map((members, index) => ({
		id: `alternating_group_${index + 1}`,
		phase: index * 0.5,
		members
	}));
}

function bodyPlanDescriptor(bodyPlan) {
	try {
		return resolveAnimalBodyPlan(bodyPlan);
	} catch {
		return resolveAnimalBodyPlan("custom");
	}
}

export function createAnimalLocomotionPlan(recipe, genomeInput, options = {}) {
	const genome = normalizeAnimalGenome(genomeInput);
	const bodyPlan = recipe.rig?.type || options.bodyPlan || "custom";
	const descriptor = bodyPlanDescriptor(bodyPlan);
	const gait = options.gait || DEFAULT_GAITS[bodyPlan] || "walk";
	const movers = collectMoverNames(recipe);
	const phases = Object.fromEntries(movers.map(
		(name, index) => [name, phaseForName(name, index, bodyPlan, gait)]
	));
	const waveEnabled = ["fish", "serpentine"].includes(bodyPlan) || gait === "undulate";
	return {
		schema: "awtsmoos.animal-locomotion-plan",
		version: "1.1.0",
		genome_id: genome.id,
		body_plan: bodyPlan,
		body_plan_descriptor: descriptor,
		gait,
		cycle_seconds: 1 / genome.genes.gait_frequency,
		stride_scale: genome.genes.gait_stride,
		phases,
		phase_groups: bodyPlan === "arthropod" ? arthropodGroups(options) : [],
		spine_wave: {
			enabled: waveEnabled,
			amplitude: waveEnabled ? genome.genes.flexibility * 0.35 : 0,
			wavelength: 1.5,
			phase_lag: waveEnabled ? 0.16 : 0,
			segments: waveEnabled ? travelingWave(descriptor, genome, options) : []
		},
		status: "plan_only"
	};
}
