// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file featherAndHardAppendageBiology.test.mjs
 * @description Proves feathers, feather arrays, turkey tail fan, avian spur, spike, stinger, quill, and spine through reusable recipe families.
 * The Awtsmoos lets vane and keratin reveal softness and hardness without species ownership;
 * Awtsmoos.com proves each vessel remains deterministic, bounded, and free.
 */

import assert from "node:assert/strict";
import {
	createChesedAvianSpurDefinition,
	createChesedTurkeyTailFanDefinition
} from "../src/core/animalMesh/creature/biology/ChesedAvianDefinitions.js";
import {
	createChesedFeatherDefinition,
	createChesedFeatherFanDefinition,
	createChesedFeatherRowDefinition
} from "../src/core/animalMesh/creature/biology/ChesedFeatherDefinitions.js";
import {
	createGevurahKeratinSpikeDefinition,
	createGevurahQuillDefinition,
	createGevurahSpineDefinition,
	createGevurahStingerDefinition
} from "../src/core/animalMesh/creature/biology/GevurahHardAppendageDefinitions.js";
import { createFeatherArrayGeometry } from "../src/core/animalMesh/creature/compile/biological/FeatherArrayGeometry.js";
import { createFeatherGeometry } from "../src/core/animalMesh/creature/compile/biological/FeatherGeometry.js";
import { createKeratinSpikeGeometry } from "../src/core/animalMesh/creature/compile/biological/KeratinSpikeGeometry.js";
import {
	assertBiologicalGeometry,
	axisSpan,
	compileDefinition
} from "./biologicalGeometryAssertions.mjs";

const definitions = [
	createChesedFeatherDefinition("primary"),
	createChesedFeatherRowDefinition(),
	createChesedFeatherFanDefinition(),
	createChesedTurkeyTailFanDefinition(),
	createChesedAvianSpurDefinition(),
	createGevurahKeratinSpikeDefinition(),
	createGevurahStingerDefinition(),
	createGevurahQuillDefinition(),
	createGevurahSpineDefinition()
];

for (const definition of definitions) {
	assertBiologicalGeometry(compileDefinition(definition, "feather-hard"), definition.id);
}

const featherParameters = {
	length: 0.34,
	width: 0.1,
	shaftRadius: 0.004,
	asymmetry: 0.2,
	curve: 0.12
};
const feather = createFeatherGeometry(featherParameters);
const repeatedFeather = createFeatherGeometry(featherParameters);
assert.deepEqual(feather.positions, repeatedFeather.positions, "single feather deterministic");
assertBiologicalGeometry(feather, "single feather");

const shortFeather = createFeatherGeometry({ ...featherParameters, length: 0.16 });
const longFeather = createFeatherGeometry({ ...featherParameters, length: 0.5 });
assert.ok(axisSpan(longFeather.positions, 2) > axisSpan(shortFeather.positions, 2), "feather length changes reach");

const fanParameters = {
	biologicalGeometryRecipe: "radial-feather-fan",
	featherCount: 12,
	arc: Math.PI * 0.8,
	radius: 0.4,
	featherLength: 0.42,
	featherWidth: 0.1
};
const fan = createFeatherArrayGeometry(fanParameters);
const repeatedFan = createFeatherArrayGeometry(fanParameters);
assert.deepEqual(fan.positions, repeatedFan.positions, "feather fan deterministic");
assertBiologicalGeometry(fan, "feather fan");

const boundedFan = createFeatherArrayGeometry({ ...fanParameters, featherCount: 999 });
assertBiologicalGeometry(boundedFan, "bounded feather fan");
assert.ok(boundedFan.positions.length < 20000, "feather fan count remains bounded");

const spikeParameters = {
	length: 0.2,
	radius: 0.015,
	curve: 0.2,
	taper: 0.98
};
const spike = createKeratinSpikeGeometry(spikeParameters);
const repeatedSpike = createKeratinSpikeGeometry(spikeParameters);
assert.deepEqual(spike.positions, repeatedSpike.positions, "hard spike deterministic");
assertBiologicalGeometry(spike, "hard spike");

console.log('B"H | featherAndHardAppendageBiology.test.mjs passed');
