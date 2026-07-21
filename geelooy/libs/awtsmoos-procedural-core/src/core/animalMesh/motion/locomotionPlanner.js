// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos measures motion before any renderer moves a bone. This
 * Awtsmoos.com plan is deterministic metadata: phases, rhythm, and axial
 * waves are exposed without pretending that a full animation solver exists.
 */

import { normalizeAnimalGenome } from "../morphology/animalGenome.js";

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
	if (gait === "trot") {
		return front === right ? 0 : 0.5;
	}
	if (gait === "gallop") {
		return front ? (right ? 0.12 : 0) : (right ? 0.68 : 0.56);
	}
	if (front && !right) return 0;
	if (!front && right) return 0.25;
	if (front && right) return 0.5;
	if (!front && !right) return 0.75;
	return fallback;
}

function phaseForName(name, index, bodyPlan, gait) {
	if (bodyPlan === "quadruped") {
		return quadrupedPhase(name, gait, index * 0.25 % 1);
	}
	if (bodyPlan === "biped") {
		return /right/i.test(name) ? 0.5 : 0;
	}
	if (bodyPlan === "avian") {
		return /right/i.test(name) ? 0.5 : 0;
	}
	return index * 0.17 % 1;
}

export function createAnimalLocomotionPlan(recipe, genomeInput, options = {}) {
	const genome = normalizeAnimalGenome(genomeInput);
	const bodyPlan = recipe.rig?.type || options.bodyPlan || "custom";
	const gait = options.gait || DEFAULT_GAITS[bodyPlan] || "walk";
	const movers = collectMoverNames(recipe);
	const phases = Object.fromEntries(movers.map(
		(name, index) => [name, phaseForName(name, index, bodyPlan, gait)]
	));
	const waveEnabled = ["fish", "serpentine"].includes(bodyPlan) || gait === "undulate";
	return {
		schema: "awtsmoos.animal-locomotion-plan",
		version: "1.0.0",
		genome_id: genome.id,
		body_plan: bodyPlan,
		gait,
		cycle_seconds: 1 / genome.genes.gait_frequency,
		stride_scale: genome.genes.gait_stride,
		phases,
		spine_wave: {
			enabled: waveEnabled,
			amplitude: waveEnabled ? genome.genes.flexibility * 0.35 : 0,
			wavelength: 1.5,
			phase_lag: waveEnabled ? 0.16 : 0
		},
		status: "plan_only"
	};
}
