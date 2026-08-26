// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file displayAndFeelerBiology.test.mjs
 * @description Proves real turkey wattle/caruncle definitions and real antenna definitions now compile through reusable geometry families.
 * The Awtsmoos lets hanging tissue, surface nodules, and articulated feelers keep distinct topology while Awtsmoos.com joins them through one semantic gate.
 */

import assert from "node:assert/strict";
import {
	createChesedTurkeyCaruncleFieldDefinition,
	createChesedTurkeyWattleDefinition
} from "../src/core/animalMesh/creature/biology/ChesedAvianDefinitions.js";
import { createNetzachAntennaDefinition } from "../src/core/animalMesh/creature/biology/NetzachSensoryDefinitions.js";
import { createSegmentedAppendageGeometry } from "../src/core/animalMesh/creature/compile/biological/SegmentedAppendageGeometry.js";
import { createSoftNoduleFieldGeometry } from "../src/core/animalMesh/creature/compile/biological/SoftNoduleFieldGeometry.js";
import { assertBiologicalGeometry, compileDefinition } from "./biologicalGeometryAssertions.mjs";

for (const definition of [
	createChesedTurkeyWattleDefinition(),
	createChesedTurkeyCaruncleFieldDefinition(),
	createNetzachAntennaDefinition(),
	createNetzachAntennaDefinition("clubbed")
]) {
	assertBiologicalGeometry(compileDefinition(definition, "display-feeler"), definition.id);
}

const antennaParameters = { length: 0.3, segments: 12, radius: 0.006, taper: 0.86, curve: 0.28 };
const antenna = createSegmentedAppendageGeometry(antennaParameters);
const repeatedAntenna = createSegmentedAppendageGeometry(antennaParameters);
assert.deepEqual(antenna.positions, repeatedAntenna.positions, "antenna positions deterministic");
assert.deepEqual(antenna.indices, repeatedAntenna.indices, "antenna topology deterministic");
assertBiologicalGeometry(antenna, "standalone antenna");

const boundedAntenna = createSegmentedAppendageGeometry({ segments: 999, length: -4, radius: -2, clubScale: 99 });
assertBiologicalGeometry(boundedAntenna, "bounded antenna");
assert.ok(boundedAntenna.positions.length < 3000, "antenna segment count remains bounded");

const nodules = createSoftNoduleFieldGeometry({ count: 14, size: 0.01, sizeVariation: 0.5 });
const repeatedNodules = createSoftNoduleFieldGeometry({ count: 14, size: 0.01, sizeVariation: 0.5 });
assert.deepEqual(nodules.positions, repeatedNodules.positions, "nodule placement deterministic");
assertBiologicalGeometry(nodules, "standalone nodule field");

const boundedNodules = createSoftNoduleFieldGeometry({ count: 999, density: 999, size: -1 });
assertBiologicalGeometry(boundedNodules, "bounded nodule field");
assert.ok(boundedNodules.positions.length < 10000, "nodule count remains bounded");

console.log('B"H | displayAndFeelerBiology.test.mjs passed');
