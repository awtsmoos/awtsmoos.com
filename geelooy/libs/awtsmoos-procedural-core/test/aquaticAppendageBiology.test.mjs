// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aquaticAppendageBiology.test.mjs
 * @description Proves finlets, ribbon fins, caudal families, lures, aquatic tentacles, cirri, and detachable sucker fields.
 * The Awtsmoos lets water-borne form become universal appendage law;
 * Awtsmoos.com proves fish and cephalopod features can stand alone without a fish engine.
 */

import assert from "node:assert/strict";
import {
	createNetzachAnglerLureDefinition,
	createNetzachAquaticTentacleDefinition,
	createNetzachCaudalFinDefinition,
	createNetzachCirrusDefinition,
	createNetzachFinletDefinition,
	createNetzachRibbonFinDefinition,
	createNetzachSuckerFieldDefinition
} from "../src/core/animalMesh/creature/biology/NetzachAquaticAppendageDefinitions.js";
import { createCaudalFinGeometry } from "../src/core/animalMesh/creature/compile/biological/CaudalFinGeometry.js";
import { createSuckerCupGeometry } from "../src/core/animalMesh/creature/compile/biological/SuckerCupGeometry.js";
import { createSuckerFieldGeometry } from "../src/core/animalMesh/creature/compile/biological/SuckerFieldGeometry.js";
import {
	assertBiologicalGeometry,
	compileDefinition
} from "./biologicalGeometryAssertions.mjs";

const caudalVariants = [
	"forked",
	"lunate",
	"rounded",
	"truncate",
	"emarginate",
	"homocercal",
	"heterocercal",
	"shark"
];
const definitions = [
	createNetzachFinletDefinition(),
	createNetzachRibbonFinDefinition(),
	createNetzachAnglerLureDefinition(),
	createNetzachAquaticTentacleDefinition(),
	createNetzachCirrusDefinition(),
	createNetzachSuckerFieldDefinition(),
	...caudalVariants.map(variant => createNetzachCaudalFinDefinition(variant))
];

for (const definition of definitions) {
	assertBiologicalGeometry(compileDefinition(definition, "aquatic"), definition.id);
}

const forkedParameters = createNetzachCaudalFinDefinition("forked").parameters;
const forked = createCaudalFinGeometry(forkedParameters);
const repeatedForked = createCaudalFinGeometry(forkedParameters);
assert.deepEqual(forked.positions, repeatedForked.positions, "caudal geometry deterministic");
assertBiologicalGeometry(forked, "forked caudal fin");

const heterocercalParameters = createNetzachCaudalFinDefinition("heterocercal").parameters;
const heterocercal = createCaudalFinGeometry(heterocercalParameters);
const zValues = heterocercal.positions.filter((value, index) => index % 3 === 2);
assert.ok(Math.max(...zValues) > Math.abs(Math.min(...zValues)), "heterocercal upper lobe exceeds lower lobe");

const cup = createSuckerCupGeometry({ radius: 0.014, depth: 0.01 });
assertBiologicalGeometry(cup, "single sucker cup");
const cupZ = cup.positions.filter((value, index) => index % 3 === 2);
assert.ok(Math.min(...cupZ) <= -0.01, "sucker cup has depressed concave floor");
assert.equal(Math.max(...cupZ), 0, "sucker rim remains on attachment plane");

const fieldParameters = {
	count: 14,
	rows: 2,
	radius: 0.012,
	depth: 0.008,
	spacing: 0.035,
	taper: 0.25
};
const field = createSuckerFieldGeometry(fieldParameters);
const repeatedField = createSuckerFieldGeometry(fieldParameters);
assert.deepEqual(field.positions, repeatedField.positions, "sucker field deterministic");
assertBiologicalGeometry(field, "sucker field");

const boundedField = createSuckerFieldGeometry({
	count: 999,
	rows: 999,
	radius: -1,
	spacing: -2
});
assertBiologicalGeometry(boundedField, "bounded sucker field");
assert.ok(boundedField.positions.length < 10000, "sucker field count remains bounded");

console.log('B"H | aquaticAppendageBiology.test.mjs passed');
