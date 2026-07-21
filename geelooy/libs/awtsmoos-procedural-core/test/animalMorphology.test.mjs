// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos renews bounded variation while ancestry remains inspectable. */
import assert from "node:assert/strict";
import {
	createAnimalGenome,
	createAnimalLocomotionProfile,
	createAnimalMorphologyProfile,
	crossAnimalGenomes,
	listAnimalArchetypes,
	mutateAnimalGenome,
	resolveAnimalBodyPlan
} from "../src/core/animalMesh/index.js";

for (const archetype of listAnimalArchetypes()) {
	assert.ok(archetype.morphology, `${archetype.id} must expose one existing-system body plan.`);
	assert.equal(archetype.morphology.id, resolveAnimalBodyPlan(archetype.id).id);
	assert.ok(Object.isFrozen(archetype.morphology));
}

const first = createAnimalMorphologyProfile({ archetypeId: "quadruped", seed: 5784 });
const repeated = createAnimalMorphologyProfile({ archetypeId: "quadruped", seed: 5784 });
const varied = createAnimalMorphologyProfile({ archetypeId: "quadruped", seed: 5785 });
assert.deepEqual(first, repeated);
assert.notDeepEqual(first.genome.traits, varied.genome.traits);
assert.ok(Object.isFrozen(first));
assert.equal(first.compiler_hints.use_existing_rig_builder, true);

const parentA = createAnimalGenome("avian", 11);
const parentB = createAnimalGenome("avian", 22);
const parentASnapshot = JSON.stringify(parentA);
const mutationA = mutateAnimalGenome(parentA, { seed: 33, intensity: 0.5, rate: 1 });
const mutationB = mutateAnimalGenome(parentA, { seed: 33, intensity: 0.5, rate: 1 });
assert.deepEqual(mutationA, mutationB);
assert.equal(JSON.stringify(parentA), parentASnapshot, "Mutation must never alter its parent.");
const childA = crossAnimalGenomes(parentA, parentB, 44);
const childB = crossAnimalGenomes(parentA, parentB, 44);
assert.deepEqual(childA, childB);
assert.equal(childA.generation, 1);

const ranges = resolveAnimalBodyPlan("avian").trait_ranges;
for (const [name, value] of Object.entries(mutationA.traits)) {
	assert.ok(value >= ranges[name][0] && value <= ranges[name][1], `${name} escaped its range.`);
}

const trot = createAnimalLocomotionProfile({ archetypeId: "quadruped", mode: "trot" });
assert.equal(trot.phases.front_left, trot.phases.rear_right);
assert.equal(trot.phases.front_right, trot.phases.rear_left);
assert.equal(Math.abs(trot.phases.front_left - trot.phases.front_right), 0.5);

const wave = createAnimalLocomotionProfile({ archetypeId: "serpentine", mode: "slither", segmentCount: 12 });
assert.equal(wave.type, "traveling_wave");
assert.equal(wave.segments.length, 12);
assert.ok(wave.segments.at(-1).amplitude > wave.segments[0].amplitude);

const tripod = createAnimalLocomotionProfile({ archetypeId: "arthropod", mode: "tripod_walk", legPairs: 3 });
assert.equal(tripod.groups.length, 2);
assert.equal(tripod.groups[1].phase, 0.5);
assert.ok(tripod.groups.every((group) => group.members.length >= 3));

console.log('B"H | animalMorphology.test.mjs passed');
