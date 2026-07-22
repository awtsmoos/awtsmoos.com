// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins archetype, body plan, and genome into one inspectable
 * morphology profile. This Awtsmoos.com contract guides the established loft,
 * rig, weighting, recipe, and compiler systems without creating geometry.
 */

import { resolveAnimalArchetype } from "../archetypes/AnimalArchetypeRegistry.js";
import { createAnimalGenome, normalizeAnimalGenome } from "./animalGenome.js";
import { resolveAnimalBodyPlan } from "./bodyPlanCatalog.js";
import { cloneMorphologyValue, freezeMorphologyValue } from "./morphologyValue.js";

function resolveGenome(archetypeId, options) {
	if (options.genome) {
		const genome = normalizeAnimalGenome(options.genome);
		if (genome.archetype_id !== archetypeId && genome.archetype_id !== "custom") {
			throw new Error('B"H | Morphology genome does not match its archetype.');
		}
		return genome.archetype_id === "custom"
			? normalizeAnimalGenome({ ...genome, archetype_id: archetypeId })
			: genome;
	}
	return createAnimalGenome(
		archetypeId,
		options.seed ?? 0,
		options.traitOverrides || options.trait_overrides || {}
	);
}

function segmentDescriptors(names, genome) {
	const count = Math.max(1, names.length);
	const elongation = genome.traits.elongation || genome.traits.body_length;
	return names.map((id, order) => ({
		id,
		order,
		length_weight: elongation / count,
		radius_weight: genome.traits.body_depth * (1 - order / (count * 4))
	}));
}

function appendageDescriptors(plan, genome) {
	return plan.appendage_pairs.map((id, pairIndex) => ({
		id,
		pair_index: pairIndex,
		symmetry: "bilateral",
		length_scale: genome.traits.limb_length || genome.traits.wing_span,
		taper: genome.traits.appendage_taper
	}));
}

export function createAnimalMorphologyProfile(options = {}) {
	const archetypeId = options.archetypeId || options.archetype_id || "quadruped";
	const archetype = resolveAnimalArchetype(archetypeId);
	const plan = resolveAnimalBodyPlan(archetypeId);
	const genome = resolveGenome(archetypeId, options);
	return freezeMorphologyValue({
		schema: "awtsmoos.animal.morphology/1",
		id: `${archetypeId}-${genome.seed}-${genome.generation}`,
		archetype_id: archetypeId,
		body_plan: cloneMorphologyValue(plan),
		symmetry: archetype.symmetry,
		primary_axis: plan.primary_axis,
		segments: segmentDescriptors(plan.segments, genome),
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
