// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is revealed here through executable phenotype evidence. Every
 * Awtsmoos.com body plan must remain deterministic, valid, rigged, bounded,
 * publicly exported, and compilable through the original animal compiler.
 */

import assert from "node:assert/strict";
import {
	ANIMAL_GENOME_RULES,
	animalMeshRecipeValidator,
	breedAnimalGenomes,
	compileAnimalPhenotype,
	createAnimalGenome,
	createAnimalPhenotype,
	getAnimalMeshCapabilities
} from "../src/index.js";

const BODY_PLANS = Object.freeze([
	["quadruped", "limb_phase_map"],
	["biped", "limb_phase_map"],
	["avian", "limb_phase_map"],
	["fish", "traveling_wave"],
	["serpentine", "traveling_wave"],
	["arthropod", "alternating_groups"]
]);

function assertFiniteGuides(phenotype) {
	for (const guide of Object.values(phenotype.recipe.anatomical_guides)) {
		assert.ok(guide.centerline.flat().every(Number.isFinite));
	}
}

for (let index = 0; index < BODY_PLANS.length; index += 1) {
	const [archetypeId, motionType] = BODY_PLANS[index];
	const options = { archetypeId, seed: 700 + index };
	const first = createAnimalPhenotype(options);
	const second = createAnimalPhenotype(options);
	assert.deepEqual(first.recipe, second.recipe, `${archetypeId} recipe drifted.`);
	assert.equal(animalMeshRecipeValidator.validate(first.recipe).valid, true);
	assert.equal(first.morphology_report.valid, true);
	assert.equal(first.locomotion.type, motionType);
	assert.ok(first.recipe.rig.bones.length > 0);
	assertFiniteGuides(first);
}

const left = createAnimalGenome("quadruped", 91);
const right = createAnimalGenome("quadruped", 92);
const child = breedAnimalGenomes(left, right, { seed: 93, mutationRate: 0.2 });
assert.deepEqual(child, breedAnimalGenomes(left, right, { seed: 93, mutationRate: 0.2 }));
assert.equal(child.generation, 1);
for (const [name, value] of Object.entries(child.genes)) {
	const rule = ANIMAL_GENOME_RULES[name];
	assert.ok(value >= rule.minimum && value <= rule.maximum, `${name} escaped bounds.`);
}
assert.throws(
	() => breedAnimalGenomes(left, createAnimalGenome("fish", 94)),
	/Cross-archetype breeding/
);

for (const archetypeId of ["quadruped", "fish", "serpentine"]) {
	const compiled = compileAnimalPhenotype({ archetypeId, seed: 800 });
	assert.ok(compiled.artifact.validationReport.triangle_count > 0);
	assert.deepEqual(compiled.artifact.validationReport.missing_required_parts, []);
}

const capabilities = getAnimalMeshCapabilities();
assert.equal(capabilities.morphology.phenotype_recipe_generation, true);
assert.equal(capabilities.geometry.procedural_rig_chains, true);
assert.equal(capabilities.motion.animation_solver, false);
console.log('B"H | animalPhenotype.test.mjs passed');
