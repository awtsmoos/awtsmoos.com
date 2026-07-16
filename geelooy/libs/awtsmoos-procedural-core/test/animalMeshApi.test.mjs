// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import assert from "node:assert/strict";
import {
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
	createAnimalThreeMaterials
} from "../src/adapters/three/animalMaterialFactory.js";
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
assert.ok(referenceReport.recommended_missing_views.includes("rear_or_rear_three_quarter"));

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

class MockStandardMaterial {
	constructor(options) {
		Object.assign(this, options);
		this.userData = {};
	}
}
const THREE = {
	FrontSide: 0,
	MeshBasicMaterial: MockStandardMaterial,
	MeshLambertMaterial: MockStandardMaterial,
	MeshPhongMaterial: MockStandardMaterial,
	MeshStandardMaterial: MockStandardMaterial,
	ShaderMaterial: MockStandardMaterial
};
const materialMap = createAnimalThreeMaterials(THREE, recipe.materials);
assert.equal(materialMap.get("coat").roughness, 0.78);

console.log('B"H | animalMeshApi.test.mjs passed');
