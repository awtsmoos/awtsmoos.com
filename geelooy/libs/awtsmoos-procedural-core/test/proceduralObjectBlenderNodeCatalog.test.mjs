// B"H
// Boruch Hashem
// Blessed is He
/** Blender catalog evidence proves typed geometry, material, zones, and safe plans. */

import assert from "node:assert/strict";
import {
	NodeDefinitionRegistry,
	createBlenderBuiltinSchemaPack,
	createBlenderNodeCoverageReport,
	createUniversalNodeTree,
	validateBlenderNodeZones
} from "../src/core/proceduralObject/index.js";
import { createBlenderNodeExecutionPlan } from "../src/adapters/blender/index.js";

const pack = createBlenderBuiltinSchemaPack();
const definitions = pack.nodeSchemaPack.definitions;
assert.ok(definitions.length >= 70);
const type = nativeType => definitions.find(definition => (
	definition.metadata.nativeType === nativeType
))?.type;
for (const nativeType of [
	"GeometryNodeSetPosition",
	"GeometryNodeSimulationInput",
	"ShaderNodeBsdfPrincipled",
	"ShaderNodeOutputMaterial",
	"ShaderNodeTexNoise"
]) {
	assert.ok(type(nativeType), `Missing ${nativeType}`);
}

const materialPlan = createBlenderNodeExecutionPlan({
	name: "catalog-material",
	kind: "material",
	nodes: [
		{ id: "noise", type: type("ShaderNodeTexNoise") },
		{ id: "principled", type: type("ShaderNodeBsdfPrincipled") },
		{ id: "output", type: type("ShaderNodeOutputMaterial") }
	],
	links: [
		{
			id: "color-link",
			from: { nodeId: "noise", socketId: "color" },
			to: { nodeId: "principled", socketId: "base-color" }
		},
		{
			id: "surface-link",
			from: { nodeId: "principled", socketId: "bsdf" },
			to: { nodeId: "output", socketId: "surface" }
		}
	]
}, { schemaPack: pack });
assert.equal(materialPlan.executable, true);
assert.equal(materialPlan.arbitrarySourceExecution, false);

const registry = new NodeDefinitionRegistry().registerPack(pack.nodeSchemaPack);
const zoneTree = createUniversalNodeTree({
	name: "simulation-zone",
	kind: "geometry",
	nodes: [
		{ id: "zone-in", type: type("GeometryNodeSimulationInput") },
		{ id: "zone-out", type: type("GeometryNodeSimulationOutput") }
	],
	zones: [
		{
			id: "simulation-main",
			type: "simulation",
			inputNodeId: "zone-in",
			outputNodeId: "zone-out"
		}
	]
});
const definitionMap = new Map(registry.list().map(definition => [
	definition.type,
	definition
]));
assert.equal(validateBlenderNodeZones(zoneTree, definitionMap).ok, true);
const invalidTree = {
	...zoneTree,
	zones: [
		{
			id: "simulation-bad",
			type: "simulation",
			inputNodeId: "zone-out",
			outputNodeId: "zone-in"
		}
	]
};
assert.equal(validateBlenderNodeZones(invalidTree, definitionMap).ok, false);
const coverage = createBlenderNodeCoverageReport(pack);
assert.equal(coverage.opaqueFallback, true);
assert.ok(coverage.notClaimed.includes("Blender user-interface parity"));

console.log('B"H | proceduralObjectBlenderNodeCatalog.test passed');
