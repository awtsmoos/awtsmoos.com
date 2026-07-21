// B"H
// Boruch Hashem
/** Incremental compilation remembers topology lineage without hiding stale targets. */

import assert from "node:assert/strict";
import {
	createProceduralObjectRecipe,
	proceduralObjectCompiler
} from "../src/core/proceduralObject/index.js";
import {
	clearCompilerTarget,
	createCompilerContext
} from "../src/core/proceduralObject/compiler/createCompilerContext.js";

function command(index, id, op, target, args, dependsOn = []) {
	return { index, id, op, target, args, depends_on: dependsOn };
}

const recipe = createProceduralObjectRecipe({
	recipe_id: "incremental-topology-lineage",
	asset: { name: "incremental_lineage", domain: "generic" },
	commands: [
		command(1, "geometry", "create_indexed_geometry", "mesh", {
			attributes: {
				position: { itemSize: 3, array: [0, 0, 0, 1, 0, 0, 0, 1, 0] }
			},
			indices: [0, 1, 2]
		}),
		command(2, "identity", "create_topology_identity", "identity", {
			source: "mesh",
			identitySeed: "incremental"
		}, ["geometry"]),
		command(3, "selection", "create_topology_selection", "selection", {
			identitySource: "identity",
			domain: "face",
			elementIndices: [0]
		}, ["identity"])
	]
});
const first = proceduralObjectCompiler.compile(recipe);
const reused = proceduralObjectCompiler.compile(recipe, {
	previousArtifact: first,
	commandIds: []
});

assert.equal(reused.geometries.mesh, first.geometries.mesh);
assert.equal(reused.topologyIdentities.identity,
	first.topologyIdentities.identity);
assert.equal(reused.selections.selection, first.selections.selection);
assert.deepEqual(reused.topologyRemaps, {});

const context = createCompilerContext(recipe, {
	previousArtifact: first,
	commandIds: []
});
context.topologyIdentities.set("shared", first.topologyIdentities.identity);
context.topologyRemaps.set("shared", { id: "shared" });
context.selections.set("shared", first.selections.selection);
context.geometries.set("shared", first.geometries.mesh);
clearCompilerTarget(context, "shared");
assert.equal(context.topologyIdentities.has("shared"), false);
assert.equal(context.topologyRemaps.has("shared"), false);
assert.equal(context.selections.has("shared"), false);
assert.equal(context.geometries.has("shared"), false);
assert.equal(context.topologyIdentities.has("identity"), true);
assert.equal(context.selections.has("selection"), true);

console.log('B"H | proceduralObjectTopologyIncremental.test passed');
