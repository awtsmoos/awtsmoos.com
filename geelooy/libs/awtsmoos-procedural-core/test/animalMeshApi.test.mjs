//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every animal rule and material meaning before any finite renderer gives it a frame;
 * Awtsmoos.com proves the portable API directly, so compiler truth remains native and no borrowed compatibility object is needed by name.
 */

import assert from "node:assert/strict";
import {
	AnimalMeshCompiler,
	AnimalMeshPatchBuilder,
	analyzeAnimalReferences,
	animalMeshPatchApplier,
	animalMeshRecipeSchema,
	createAnimalLodPlan,
	estimateAnimalMeshTriangles,
	getAnimalMeshCapabilities,
	listAnimalArchetypes
} from "../src/core/animalMesh/index.js";
import {
	createBlenderExecutionPlan
} from "../src/adapters/blender/BlenderExecutionPlan.js";
import {
	createExampleQuadrupedRecipe
} from "../examples/animalMesh/createExampleQuadrupedRecipe.js";

const recipe = createExampleQuadrupedRecipe();
const capabilities = getAnimalMeshCapabilities();

assert.ok(capabilities.archetypes.includes("quadruped"));
assert.equal(capabilities.security.arbitrary_code, false);
assert.ok(listAnimalArchetypes().length >= 6);
assert.ok(animalMeshRecipeSchema.properties.anatomical_guides);

const referenceReport = analyzeAnimalReferences(recipe.references);
assert.equal(referenceReport.width_coverage, true);
assert.equal(referenceReport.depth_coverage, true);
assert.ok(
	referenceReport.recommended_missing_views.includes(
		"rear_or_rear_three_quarter"
	)
);

assert.ok(estimateAnimalMeshTriangles(recipe) > 0);
assert.equal(createAnimalLodPlan(recipe.asset).length, 3);

const patch = new AnimalMeshPatchBuilder(recipe)
	.scale(
		"/anatomical_guides/torso/sections/1/half_width",
		1.08,
		"Widen the torso by eight percent."
	)
	.build("torso_mesh");
const patched = animalMeshPatchApplier.apply(recipe, patch);
assert.equal(
	patched.recipe.anatomical_guides.torso.sections[1].half_width,
	0.38 * 1.08
);

const blenderPlan = createBlenderExecutionPlan(recipe);
assert.equal(blenderPlan.worker_policy.arbitrary_source_execution, false);
assert.equal(blenderPlan.worker_policy.network_access, false);

const artifact = new AnimalMeshCompiler().compile(recipe);
const coatMaterial = artifact.proceduralArtifact.materials.coat;
assert.equal(coatMaterial.id, "coat");
assert.equal(coatMaterial.roughness, 0.78);

console.log('B"H | animalMeshApi.test.mjs passed');
