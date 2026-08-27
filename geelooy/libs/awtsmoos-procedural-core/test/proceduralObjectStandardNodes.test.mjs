// B"H
// Boruch Hashem
// Blessed is He
/** Executable evidence joins geometry and compiles portable material closures. */

import assert from "node:assert/strict";
import {
	createNodeCoverageReport,
	createStandardNodeRegistries,
	createUniversalNodeGraph,
	evaluateUniversalNodeGraph
} from "../src/core/proceduralObject/nodeSystem/index.js";

const registries = createStandardNodeRegistries();
const coverage = createNodeCoverageReport(registries);
assert.equal(coverage.complete, true);
assert.equal(coverage.definitionCount, 16);

const geometryGraph = createUniversalNodeGraph({
	name: "standard.geometry.demo",
	kind: "geometry",
	nodes: [
		{id: "box", type: "geometry.box", inputs: {size: [2, 1, 1]}},
		{id: "sphere", type: "geometry.uv-sphere", inputs: {radii: [0.5, 0.5, 0.5]}},
		{id: "join", type: "geometry.join"},
		{id: "output", type: "geometry.output"}
	],
	links: [
		{from: {nodeId: "box", socketId: "geometry"}, to: {nodeId: "join", socketId: "geometries"}},
		{from: {nodeId: "sphere", socketId: "geometry"}, to: {nodeId: "join", socketId: "geometries"}},
		{from: {nodeId: "join", socketId: "geometry"}, to: {nodeId: "output", socketId: "geometry"}}
	],
	outputs: {geometry: {nodeId: "output", socketId: "geometry"}}
});
const geometryResult = evaluateUniversalNodeGraph(geometryGraph, registries);
assert.equal(geometryResult.ok, true);
assert.ok(geometryResult.outputs.geometry.attributes.position.count > 24);
assert.deepEqual(geometryResult.schedule, ["box", "sphere", "join", "output"]);

const materialGraph = createUniversalNodeGraph({
	name: "standard.material.demo",
	kind: "material",
	nodes: [
		{id: "color", type: "material.color", config: {color: [0.1, 0.4, 0.9, 1]}},
		{id: "rough", type: "material.scalar", config: {value: 0.22}},
		{id: "surface", type: "material.principled"},
		{id: "output", type: "material.output"}
	],
	links: [
		{from: {nodeId: "color", socketId: "color"}, to: {nodeId: "surface", socketId: "baseColor"}},
		{from: {nodeId: "rough", socketId: "value"}, to: {nodeId: "surface", socketId: "roughness"}},
		{from: {nodeId: "surface", socketId: "surface"}, to: {nodeId: "output", socketId: "surface"}}
	],
	outputs: {material: {nodeId: "output", socketId: "material"}}
});
const materialResult = evaluateUniversalNodeGraph(materialGraph, registries);
assert.equal(materialResult.ok, true);
assert.equal(materialResult.outputs.material.surface.model, "principled-surface");
assert.deepEqual(materialResult.outputs.material.surface.parameters.baseColor, [0.1, 0.4, 0.9, 1]);
assert.equal(materialResult.outputs.material.surface.parameters.roughness, 0.22);

console.log('B"H | proceduralObjectStandardNodes.test passed');
