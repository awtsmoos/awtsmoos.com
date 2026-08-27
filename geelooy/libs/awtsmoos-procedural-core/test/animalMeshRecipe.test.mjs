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
	ANIMAL_MESH_OPERATIONS,
	animalMeshRecipeValidator,
	hashAnimalMeshRecipe,
	serializeAnimalMeshRecipe
} from "../src/core/animalMesh/index.js";
import {
	createExampleQuadrupedRecipe
} from "../examples/animalMesh/createExampleQuadrupedRecipe.js";

const recipe = createExampleQuadrupedRecipe();
const serialized = serializeAnimalMeshRecipe(recipe);

assert.equal(
	serialized,
	serializeAnimalMeshRecipe(JSON.parse(serialized)),
	"Canonical recipe JSON must be deterministic."
);
assert.equal(
	hashAnimalMeshRecipe(recipe),
	hashAnimalMeshRecipe(JSON.parse(serialized)),
	"Equivalent recipes must have the same identity."
);
assert.ok(
	ANIMAL_MESH_OPERATIONS.includes("loft_elliptical_sections"),
	"Anatomical lofting must remain a whitelisted operation."
);

const unsafeRecipe = structuredClone(recipe);
unsafeRecipe.commands[0].op = "run_shell";
assert.equal(
	animalMeshRecipeValidator.validate(unsafeRecipe).valid,
	false,
	"Arbitrary operations must be rejected."
);

const unsafeArgumentsRecipe = structuredClone(recipe);
unsafeArgumentsRecipe.commands[0].args = {
	script: "python dangerous.py"
};
assert.equal(
	animalMeshRecipeValidator.validate(unsafeArgumentsRecipe).valid,
	false,
	"Executable argument payloads must be rejected."
);

const unknownLandmarkRecipe = structuredClone(recipe);
unknownLandmarkRecipe.landmarks.random_typo_landmark = [
	0,
	0,
	0
];
assert.equal(
	animalMeshRecipeValidator.validate(unknownLandmarkRecipe).valid,
	false,
	"Unknown landmark spellings must be rejected."
);

console.log('B"H | animalMeshRecipe.test.mjs passed');
