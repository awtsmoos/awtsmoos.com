// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is revealed here through repeatable evidence: inherited traits
 * remain bounded, recipes remain valid, loft frames remain continuous, and
 * Awtsmoos.com geometry still passes through the original compiler.
 */

import assert from "node:assert/strict";
import {
	ANIMAL_GENOME_RULES,
	animalMeshRecipeValidator,
	breedAnimalGenomes,
	buildEllipticalLoft,
	compileAnimalMorphologyVariant,
	createAnimalGenome,
	createAnimalMorphologyVariant,
	createAnimalVariationSet,
	createParallelTransportFrames
} from "../src/core/animalMesh/index.js";
import { createExampleQuadrupedRecipe } from "../examples/animalMesh/createExampleQuadrupedRecipe.js";

function dot(left, right) {
	return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function length(vector) {
	return Math.sqrt(dot(vector, vector));
}

const baseRecipe = createExampleQuadrupedRecipe();
const baseSnapshot = JSON.stringify(baseRecipe);
const firstGenome = createAnimalGenome({ seed: 481516 });
const repeatedGenome = createAnimalGenome({ seed: 481516 });
assert.deepEqual(firstGenome, repeatedGenome, "Seeded genomes must be identical.");

for (const [name, rule] of Object.entries(ANIMAL_GENOME_RULES)) {
	assert.ok(firstGenome.genes[name] >= rule.minimum, `${name} must respect its minimum.`);
	assert.ok(firstGenome.genes[name] <= rule.maximum, `${name} must respect its maximum.`);
}

const secondGenome = createAnimalGenome({ seed: 108 });
const firstChild = breedAnimalGenomes(firstGenome, secondGenome, { seed: 42 });
const secondChild = breedAnimalGenomes(firstGenome, secondGenome, { seed: 42 });
assert.deepEqual(firstChild, secondChild, "Breeding must be deterministic for fixed parents and seed.");

const variant = createAnimalMorphologyVariant(baseRecipe, firstGenome, {
	locomotion: { gait: "trot" }
});
assert.equal(animalMeshRecipeValidator.validate(variant.recipe).valid, true);
assert.equal(JSON.stringify(baseRecipe), baseSnapshot, "Morphology must not mutate the base recipe.");
assert.notDeepEqual(
	variant.recipe.anatomical_guides.torso.centerline,
	baseRecipe.anatomical_guides.torso.centerline,
	"Genome application must alter anatomical coordinates."
);
assert.equal(variant.locomotion.status, "plan_only");
assert.notEqual(
	variant.locomotion.phases.front_left_leg,
	variant.locomotion.phases.front_right_leg,
	"Paired limbs must receive distinct trot phases."
);

const firstCompilation = compileAnimalMorphologyVariant(baseRecipe, firstGenome);
const secondCompilation = compileAnimalMorphologyVariant(baseRecipe, firstGenome);
assert.equal(
	JSON.stringify(firstCompilation.artifact.parts),
	JSON.stringify(secondCompilation.artifact.parts),
	"The existing compiler must emit identical geometry for the same genome."
);
assert.ok(firstCompilation.artifact.validationReport.triangle_count > 0);
assert.equal(firstCompilation.artifact.validationReport.missing_required_parts.length, 0);

const variations = createAnimalVariationSet(baseRecipe, { count: 4, seed: 9001 });
assert.equal(variations.length, 4);
assert.equal(new Set(variations.map((entry) => entry.genome.id)).size, 4);

const centerline = [
	[0, 0, 0],
	[0.2, 1, 0.1],
	[-0.35, 2, 0.55],
	[0.4, 3, 1.1],
	[0, 4, 1.7]
];
const amounts = Array.from({ length: 33 }, (_, index) => index / 32);
const frames = createParallelTransportFrames(centerline, amounts);
for (let index = 0; index < frames.length; index += 1) {
	const frame = frames[index];
	assert.ok(Math.abs(length(frame.right) - 1) < 1e-8);
	assert.ok(Math.abs(length(frame.up) - 1) < 1e-8);
	assert.ok(Math.abs(dot(frame.right, frame.up)) < 1e-8);
	if (index > 0) {
		assert.ok(dot(frames[index - 1].right, frame.right) > -0.05, "Transported frames must not flip.");
	}
}

const loft = buildEllipticalLoft({
	type: "elliptical_loft",
	centerline,
	sections: [
		{ t: 0, half_width: 0.3, half_height: 0.25, rotation: 0 },
		{ t: 0.5, half_width: 0.5, half_height: 0.35, rotation: 35 },
		{ t: 1, half_width: 0.15, half_height: 0.12, rotation: 80 }
	],
	radial_segments: 10,
	longitudinal_segments: 32
}, { cap_start: true, cap_end: true });
assert.ok(loft.positions.every(Number.isFinite));
assert.ok(loft.normals.every(Number.isFinite));
assert.ok(loft.indices.length > 0);

console.log('B"H | animalMeshProceduralGeneration.test.mjs passed');
