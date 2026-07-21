// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins archetype, body plan, and genome into one inspectable form.
 * This Awtsmoos.com profile gives the established loft and rig compiler explicit
 * anatomical guidance without creating geometry or mutating scene state itself.
 */
import { resolveAnimalArchetype } from "../archetypes/AnimalArchetypeRegistry.js";
import { createAnimalGenome } from "./animalGenome.js";
import { resolveAnimalBodyPlan } from "./bodyPlanCatalog.js";
import { cloneMorphologyValue, freezeMorphologyValue } from "./morphologyValue.js";

function normalizedSegmentWeights(segmentNames, genome) {
	const count = Math.max(1, segmentNames.length);
	const elongation = genome.traits.elongation || genome.traits.body_length || 1;
	return segmentNames.map((name, index) => ({
		id: name,
		order: index,
		length_weight: elongation / count,
		radius_weight: (genome.traits.body_depth || 1) * (1 - index / (count * 4))
	}));
}

function appendageDescriptors(plan, genome) {
	return plan.appendage_pairs.map((id, index) => ({
		id,
		pair_index: index,
		symmetry: "bilateral",
		length_scale: genome.traits.limb_length || genome.traits.wing_span || 1,
		taper: genome.traits.appendage_taper || 0.65
	}));
}

export function createAnimalMorphologyProfile(options = {}) {
	const archetypeId = options.archetypeId || options.archetype_id || "quadruped";
	const archetype = resolveAnimalArchetype(archetypeId);
	const plan = resolveAnimalBodyPlan(archetypeId);
	const genome = options.genome || createAnimalGenome(
		archetypeId,
		options.seed ?? 0,
		options.traitOverrides || options.trait_overrides || {}
	);
	if (genome.archetype_id !== archetypeId) {
		throw new Error('B"H | Morphology genome does not match its archetype.');
	}
	return freezeMorphologyValue({
		schema: "awtsmoos.animal.morphology/1",
		id: `${archetypeId}-${genome.seed}-${genome.generation}`,
		archetype_id: archetypeId,
		body_plan: cloneMorphologyValue(plan),
		symmetry: archetype.symmetry,
		primary_axis: plan.primary_axis,
		segments: normalizedSegmentWeights(plan.segments, genome),
		appendages: appendageDescriptors(plan, genome),
		joint_chains: cloneMorphologyValue(plan.joint_chains),
		locomotion_modes: cloneMorphologyValue(plan.locomotion_modes),
		genome,
		rig_type: archetype.rig_type,
		compiler_hints: {
			centerline: plan.primary_axis,
			loft_profile: "elliptical",
			use_existing_rig_builder: true,
			use_existing_automatic_weights: true
		}
	});
}
