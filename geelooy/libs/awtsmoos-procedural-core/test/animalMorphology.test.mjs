// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews bounded variation through one public animal pipeline.
 * These Awtsmoos.com tests reject duplicate profiles while proving body plans,
 * breeding, recipe evolution, and locomotion metadata remain deterministic.
 */
import assert from "node:assert/strict";
import {
	ANIMAL_GENOME_RULES,
	breedAnimalGenomes,
	createAnimalGenome,
	createAnimalLocomotionPlan,
	createAnimalMorphologyVariant,
	createAnimalVariationSet,
	listAnimalArchetypes,
	resolveAnimalBodyPlan
} from "../src/core/animalMesh/index.js";
import { createExampleQuadrupedRecipe } from "../examples/animalMesh/createExampleQuadrupedRecipe.js";

for (const archetype of listAnimalArchetypes()) {
	assert.equal(archetype.morphology.id, resolveAnimalBodyPlan(archetype.id).id);
	assert.ok(Object.isFrozen(archetype.morphology));
}

const first = createAnimalGenome({ seed: 5784 });
const repeated = createAnimalGenome({ seed: 5784 });
const varied = createAnimalGenome({ seed: 5785 });
assert.deepEqual(first, repeated);
assert.notDeepEqual(first.genes, varied.genes);
for (const [name, value] of Object.entries(first.genes)) {
	const rule = ANIMAL_GENOME_RULES[name];
	assert.ok(value >= rule.minimum && value <= rule.maximum, `${name} escaped its range.`);
}

const parentSnapshot = JSON.stringify(first);
const childA = breedAnimalGenomes(first, varied, { seed: 33, mutationRate: 1 });
const childB = breedAnimalGenomes(first, varied, { seed: 33, mutationRate: 1 });
assert.deepEqual(childA, childB);
assert.equal(JSON.stringify(first), parentSnapshot, "Breeding must not mutate a parent genome.");

const baseRecipe = createExampleQuadrupedRecipe();
const recipeSnapshot = JSON.stringify(baseRecipe);
const variant = createAnimalMorphologyVariant(baseRecipe, first, { locomotion: { gait: "trot" } });
assert.equal(JSON.stringify(baseRecipe), recipeSnapshot, "Variation must not mutate the base recipe.");
assert.equal(variant.locomotion.body_plan_descriptor.id, "four_limb_vertebrate");
assert.equal(variant.locomotion.phases.front_left_leg, 0.5);
assert.equal(variant.locomotion.phases.front_right_leg, 0);
assert.notEqual(variant.locomotion.phases.front_left_leg, variant.locomotion.phases.front_right_leg);

const serpent = createAnimalLocomotionPlan({
	parts: ["spine_1", "spine_2", "tail"],
	rig: { type: "serpentine", bones: [] }
}, first, { gait: "undulate", segmentCount: 12 });
assert.equal(serpent.spine_wave.enabled, true);
assert.equal(serpent.spine_wave.segments.length, 12);
assert.ok(serpent.spine_wave.segments.at(-1).amplitude > serpent.spine_wave.segments[0].amplitude);

const arthropod = createAnimalLocomotionPlan({
	parts: [],
	rig: { type: "arthropod", bones: [] }
}, first, { legPairs: 3 });
assert.equal(arthropod.phase_groups.length, 2);
assert.equal(arthropod.phase_groups[1].phase, 0.5);
assert.ok(arthropod.phase_groups.every((group) => group.members.length === 3));

const variations = createAnimalVariationSet(baseRecipe, { count: 4, seed: 9001 });
assert.equal(new Set(variations.map((entry) => entry.genome.id)).size, 4);
console.log('B"H | animalMorphology.test.mjs passed');
