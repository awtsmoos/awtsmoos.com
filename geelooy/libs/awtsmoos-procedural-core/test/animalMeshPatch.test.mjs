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
	ANIMAL_MESH_PATCH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION,
	AnimalMeshSession
} from "../src/core/animalMesh/index.js";
import {
	createExampleQuadrupedRecipe
} from "../examples/animalMesh/createExampleQuadrupedRecipe.js";

const recipe = createExampleQuadrupedRecipe();
const session = new AnimalMeshSession(recipe);
const originalLeg = session.artifact.parts.find((part) => {
	return part.id === "front_left_leg";
});
const originalTorso = session.artifact.parts.find((part) => {
	return part.id === "torso";
});

const result = session.applyPatch({
	schema: ANIMAL_MESH_PATCH_SCHEMA,
	schema_version: ANIMAL_MESH_SCHEMA_VERSION,
	recipe_id: recipe.recipe_id,
	mode: "patch",
	patch_id: "widen_torso_01",
	operations: [
		{
			op: "replace",
			path: "/anatomical_guides/torso/sections/1/half_width",
			old_value: 0.38,
			new_value: 0.41,
			reason: "Widen the torso."
		}
	],
	regenerate_from_command: "torso_mesh"
});

assert.ok(
	result.revision.affected_command_ids.includes("torso_mesh"),
	"Patch must identify the directly affected command."
);
assert.ok(
	result.revision.affected_command_ids.includes("left_front_leg"),
	"Dependent commands must be regenerated."
);
assert.notEqual(
	result.artifact.parts.find((part) => part.id === "torso"),
	originalTorso,
	"Patched torso artifact must be replaced."
);
assert.notEqual(
	result.artifact.parts.find((part) => part.id === "front_left_leg"),
	originalLeg,
	"Dependent leg artifact must be replaced."
);
assert.equal(
	result.recipe.anatomical_guides.torso.sections[1].half_width,
	0.41,
	"Patch must update only the requested recipe value."
);

console.log('B"H | animalMeshPatch.test.mjs passed');
