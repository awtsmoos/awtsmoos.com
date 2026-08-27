//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each creature artifact while portable typed vessels carry its form from compiler to world;
 * Awtsmoos.com proves this runtime remains renderer-neutral through load, traversal, patch, and release as new geometry is unfurled.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	ANIMAL_MESH_PATCH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../src/core/animalMesh/index.js";
import {
	createExampleQuadrupedRecipe
} from "../examples/animalMesh/createExampleQuadrupedRecipe.js";
import {
	AnimalMeshRuntime
} from "../../../games/mitzvahWorld/experiments/animalMesh/AnimalMeshRuntime.js";

/** Build one canonical torso patch used to prove runtime replacement follows domain revision state. */
function createTorsoPatch(recipe) {
	return {
		schema: ANIMAL_MESH_PATCH_SCHEMA,
		schema_version: ANIMAL_MESH_SCHEMA_VERSION,
		recipe_id: recipe.recipe_id,
		mode: "patch",
		patch_id: "runtime_widen_torso_01",
		operations: [
			{
				op: "replace",
				path: "/anatomical_guides/torso/sections/1/half_width",
				old_value: 0.38,
				new_value: 0.41,
				reason: "Prove renderer-neutral runtime revision."
			}
		],
		regenerate_from_command: "torso_mesh"
	};
}

test("animal runtime materializes the compiler portable artifact", () => {
	const recipe = createExampleQuadrupedRecipe();
	const animalRuntime = new AnimalMeshRuntime();
	const result = animalRuntime.loadRecipe(recipe);
	assert.equal(result.runtime.schema, "awtsmoos.procedural-object-runtime");
	assert.equal(result.artifact.recipe_id, recipe.recipe_id);
	assert.ok(Object.keys(result.runtime.geometries).length >= 3);
	const visited = [];
	result.runtime.traverse((object, context) => {
		visited.push({object, context});
	});
	assert.equal(visited.length, result.artifact.parts.length);
	assert.ok(visited.every(entry => entry.context.geometry?.attributes?.position?.array));
});

test("animal runtime patch replaces derived runtime and preserves domain revision", () => {
	const recipe = createExampleQuadrupedRecipe();
	const animalRuntime = new AnimalMeshRuntime();
	const first = animalRuntime.loadRecipe(recipe);
	const patched = animalRuntime.applyPatch(createTorsoPatch(recipe));
	assert.notEqual(patched.runtime, first.runtime);
	assert.equal(patched.recipe.anatomical_guides.torso.sections[1].half_width, 0.41);
	assert.equal(animalRuntime.runtime, patched.runtime);
	assert.ok(patched.revision.affected_command_ids.includes("torso_mesh"));
});

test("animal runtime disposal is idempotent", () => {
	const animalRuntime = new AnimalMeshRuntime();
	animalRuntime.loadRecipe(createExampleQuadrupedRecipe());
	animalRuntime.dispose();
	animalRuntime.dispose();
	assert.equal(animalRuntime.runtime, null);
	assert.equal(animalRuntime.session, null);
});
