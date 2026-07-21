// B"H
// Boruch Hashem
/** Persistent topology lineage now flows through the trusted recipe compiler. */

import assert from "node:assert/strict";
import {
	createDefaultProceduralOperationRegistry,
	createProceduralObjectRecipe,
	proceduralObjectCompiler
} from "../src/core/proceduralObject/index.js";

function command(index, id, op, target, args, dependsOn = []) {
	return { index, id, op, target, args, depends_on: dependsOn };
}

const geometry = {
	attributes: {
		position: { itemSize: 3, array: [
			0, 0, 0,
			0, 0, 0,
			1, 0, 0,
			0, 1, 0,
			9, 9, 9
		] }
	},
	indices: [0, 2, 3, 1, 3, 2]
};
const recipe = createProceduralObjectRecipe({
	recipe_id: "compiler-topology-lineage",
	asset: { name: "lineage", domain: "generic" },
	commands: [
		command(1, "geometry", "create_indexed_geometry", "source", geometry),
		command(2, "identity", "create_topology_identity", "identity0", {
			source: "source",
			identitySeed: "compiler-lineage"
		}, ["geometry"]),
		command(3, "compact", "compact_geometry_with_identity", "compacted", {
			source: "source",
			identitySource: "identity0",
			identityTarget: "identity1",
			remapTarget: "remap1"
		}, ["identity"]),
		command(4, "weld", "weld_geometry_with_identity", "welded", {
			source: "compacted",
			identitySource: "identity1",
			identityTarget: "identity2",
			remapTarget: "remap2",
			policy: "position-only",
			tolerance: 0
		}, ["compact"]),
		command(5, "compose", "compose_topology_remaps", "remap12", {
			first: "remap1",
			second: "remap2"
		}, ["weld"]),
		command(6, "selection", "create_topology_selection", "selected0", {
			identitySource: "identity0",
			domain: "vertex",
			elementIndices: [0, 1],
			weights: [0.25, 0.75]
		}, ["identity"]),
		command(7, "migrate", "remap_topology_selection", "selected2", {
			selectionSource: "selected0",
			remapSource: "remap12",
			weights: "max"
		}, ["selection", "compose"])
	]
});
const artifact = proceduralObjectCompiler.compile(recipe);

assert.equal(artifact.geometries.compacted.attributes.position.count, 4);
assert.equal(artifact.geometries.welded.attributes.position.count, 3);
assert.equal(artifact.topologyIdentities.identity0.revision, 0);
assert.equal(artifact.topologyIdentities.identity1.revision, 1);
assert.equal(artifact.topologyIdentities.identity2.revision, 2);
assert.equal(artifact.topologyRemaps.remap12.source.revision, 0);
assert.equal(artifact.topologyRemaps.remap12.target.revision, 2);
assert.equal(artifact.selections.selected2.elementIds.length, 1);
const selectedId = artifact.selections.selected2.elementIds[0];
assert.equal(artifact.selections.selected2.weights[selectedId], 0.75);
assert.equal(artifact.selections.selected2.target.contentHash,
	artifact.topologyIdentities.identity2.contentHash);
assert.equal(Object.isFrozen(artifact.topologyRemaps.remap12), true);
assert.equal(Object.isFrozen(artifact.selections.selected2), true);
assert.equal(artifact.deferredCommands.length, 0);

const registry = createDefaultProceduralOperationRegistry();
for (const op of [
	"create_topology_identity",
	"compact_geometry_with_identity",
	"weld_geometry_with_identity",
	"repair_geometry_with_identity",
	"create_topology_selection",
	"remap_topology_selection",
	"compose_topology_remaps"
]) assert.equal(typeof registry.resolve(op)?.handler, "function");

console.log('B"H | proceduralObjectTopologyCompiler.test passed');
