// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file continuousAppendageBiology.test.mjs
 * @description Proves tentacle, prehensile, proboscis, trunk, and lure recipes share deterministic tube law without sharing species ownership.
 * The Awtsmoos bends one line through many biological intentions; Awtsmoos.com proves each semantic garment reaches valid geometry without random drift.
 */

import assert from "node:assert/strict";
import {
	createTiferesPrehensileAppendageDefinition,
	createTiferesProboscisDefinition,
	createTiferesTentacleDefinition,
	createTiferesTrunkDefinition
} from "../src/core/animalMesh/creature/biology/TiferesAppendageDefinitions.js";
import { createNetzachAnglerLureDefinition } from "../src/core/animalMesh/creature/biology/NetzachAquaticAppendageDefinitions.js";
import { createSoftAppendageGeometry } from "../src/core/animalMesh/creature/compile/biological/SoftAppendageGeometry.js";
import { assertBiologicalGeometry, axisSpan, compileDefinition } from "./biologicalGeometryAssertions.mjs";

const definitions = [
	createTiferesTentacleDefinition(),
	createTiferesPrehensileAppendageDefinition(),
	createTiferesProboscisDefinition(),
	createTiferesTrunkDefinition(),
	createNetzachAnglerLureDefinition()
];

for (const definition of definitions) {
	assertBiologicalGeometry(compileDefinition(definition, "continuous"), definition.id);
}

const tentacleDefinition = createTiferesTentacleDefinition("cephalopod", { length: 0.62 });
const parameters = {
	biologicalGeometryRecipe: tentacleDefinition.geometryRecipe,
	...tentacleDefinition.parameters
};
const first = createSoftAppendageGeometry(parameters);
const repeated = createSoftAppendageGeometry(parameters);
assert.deepEqual(first.positions, repeated.positions, "tentacle positions are deterministic");
assert.deepEqual(first.indices, repeated.indices, "tentacle topology is deterministic");
assertBiologicalGeometry(first, "standalone tentacle");

const shortTentacle = createSoftAppendageGeometry({ biologicalGeometryRecipe: "tentacle-loft", length: 0.2, radius: 0.03 });
const longTentacle = createSoftAppendageGeometry({ biologicalGeometryRecipe: "tentacle-loft", length: 0.8, radius: 0.03 });
assert.ok(axisSpan(longTentacle.positions, 2) > axisSpan(shortTentacle.positions, 2), "tentacle length changes reach");

const bounded = createSoftAppendageGeometry({
	biologicalGeometryRecipe: "trunk-loft",
	length: -10,
	radius: -2,
	joints: 999,
	curl: 99,
	droop: 99
});
assertBiologicalGeometry(bounded, "bounded malformed continuous appendage");
assert.ok(bounded.positions.length < 2000, "continuous appendage topology remains budget-bounded");

console.log('B"H | continuousAppendageBiology.test.mjs passed');
