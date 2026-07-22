// B"H
// Boruch Hashem
// Blessed is He
/** Blender schema evidence proves deterministic harvesting, mapping, packs, and registration. */

import assert from "node:assert/strict";
import {
	BlenderSchemaRegistry,
	createBlenderSchemaManifest,
	createBlenderSchemaPackFromManifest,
	mapBlenderSocketType,
	normalizeBlenderIdentifier
} from "../src/core/proceduralObject/nodeSystem/blender/index.js";
import { createSyntheticBlenderSchemaManifest } from "./fixtures/createSyntheticBlenderSchemaManifest.mjs";

assert.equal(normalizeBlenderIdentifier("ShaderNodeBsdfPrincipled"), "shader-node-bsdf-principled");
assert.equal(mapBlenderSocketType("NodeSocketGeometry").type, "geometry");
assert.equal(mapBlenderSocketType({
	nativeType: "NodeSocketFloatFactor",
	subtype: "FACTOR",
	fieldCapable: true
}).type, "field<factor>");
assert.deepEqual(mapBlenderSocketType("NodeSocketFutureQuantum"), {
	type: "opaque",
	baseType: "opaque",
	nativeType: "NodeSocketFutureQuantum",
	field: false,
	opaque: true
});

const ordered = createBlenderSchemaManifest(createSyntheticBlenderSchemaManifest("5.1.0"));
const reversed = createBlenderSchemaManifest(createSyntheticBlenderSchemaManifest("5.1.0", true));
assert.equal(ordered.contentHash, reversed.contentHash);
assert.equal(ordered.treeTypes.length, 2);
assert.equal(ordered.interfaces.length, 1);
assert.equal(ordered.zones[0].role, "simulation-input");
assert.equal(ordered.diagnostics[0].code, "NODE.INSTANTIATE_FAILED");

const pack = createBlenderSchemaPackFromManifest(ordered);
assert.equal(pack.nodeSchemaPack.definitions.length, 4);
assert.equal(pack.modifierDefinitions.length, 1);
const join = pack.nodeSchemaPack.definitions.find(definition => (
	definition.metadata.nativeType === "GeometryNodeJoinGeometry"
));
assert.equal(join.inputs[0].multiInput, true);
assert.equal(join.inputs[0].metadata.linkLimit, 4095);
const mystery = pack.nodeSchemaPack.definitions.find(definition => (
	definition.metadata.nativeType === "GeometryNodeMysteryField"
));
assert.equal(mystery.inputs[0].type, "opaque");
assert.equal(mystery.outputs[0].type, "field<float>");
assert.equal(mystery.metadata.opaque, true);
const modifier = pack.modifierDefinitions[0];
assert.equal(modifier.status, "adapter-dependent");
assert.deepEqual(modifier.domains, ["geometry", "object"]);
assert.equal(modifier.parameters.count.minimum, 1);

const registry = new BlenderSchemaRegistry();
registry.register(ordered);
registry.register(createSyntheticBlenderSchemaManifest("5.2.0"));
assert.equal(registry.size, 2);
assert.equal(registry.resolve("5.1.0").manifest.contentHash, ordered.contentHash);
assert.equal(registry.latest().manifest.blenderVersion, "5.2.0");
assert.throws(() => registry.register(ordered), /already registered/);

console.log('B"H | proceduralObjectBlenderSchemaManifest.test passed');
