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
	AnimalMeshCompiler
} from "../src/core/animalMesh/index.js";
import {
	createExampleQuadrupedRecipe
} from "../examples/animalMesh/createExampleQuadrupedRecipe.js";

const recipe = createExampleQuadrupedRecipe();
const compiler = new AnimalMeshCompiler();
const firstArtifact = compiler.compile(recipe);
const secondArtifact = compiler.compile(recipe);

assert.equal(
	JSON.stringify(firstArtifact.parts),
	JSON.stringify(secondArtifact.parts),
	"The same recipe must compile into identical mesh data."
);
assert.deepEqual(
	firstArtifact.parts.map((part) => part.id),
	[
		"torso",
		"front_left_leg",
		"front_right_leg"
	],
	"Compiler must create the requested named parts."
);
assert.ok(
	firstArtifact.validationReport.triangle_count > 0,
	"Compilation must produce triangles."
);
assert.equal(
	firstArtifact.validationReport.missing_required_parts.length,
	0,
	"Required parts must be present."
);
assert.equal(
	firstArtifact.validationReport.unweighted_vertex_count,
	0,
	"Enabled rigs must produce normalized automatic weights."
);

const leftLeg = firstArtifact.parts.find((part) => part.id === "front_left_leg");
const rightLeg = firstArtifact.parts.find((part) => part.id === "front_right_leg");
assert.equal(
	leftLeg.positions[0],
	-rightLeg.positions[0],
	"Mirrored geometry must reflect the X coordinate."
);

console.log('B"H | animalMeshCompiler.test.mjs passed');
