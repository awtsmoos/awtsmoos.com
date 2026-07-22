// B"H
// Boruch Hashem
// Blessed is He
/** Blender migration evidence names every changed node, socket, property, modifier, and alias. */

import assert from "node:assert/strict";
import { createBlenderSchemaMigrationPlan } from "../src/core/proceduralObject/nodeSystem/blender/index.js";
import { createSyntheticBlenderSchemaManifest } from "./fixtures/createSyntheticBlenderSchemaManifest.mjs";

const from = createSyntheticBlenderSchemaManifest("5.1.0");
const to = createSyntheticBlenderSchemaManifest("5.2.0");
const plan = createBlenderSchemaMigrationPlan(from, to);
assert.equal(plan.schema, "awtsmoos.blender-schema-migration-plan");
assert.equal(plan.fromVersion, "5.1.0");
assert.equal(plan.toVersion, "5.2.0");
assert.equal(plan.hasChanges, true);
assert.ok(plan.operations.some(operation => (
	operation.op === "add-node"
	&& operation.id.includes("ShaderNodeRayPortalBSDF")
)));
assert.ok(plan.operations.some(operation => operation.op === "change-node-property"));
assert.ok(plan.operations.some(operation => (
	operation.op === "add-modifier"
	&& operation.id === "GreasePencilDashModifier"
)));
assert.ok(plan.operations.some(operation => (
	operation.op === "alias"
	&& operation.from === "ShaderNodeOldPortal"
)));
assert.deepEqual(
	plan.operations.map(operation => `${operation.op}:${operation.id ?? operation.from}`),
	[...plan.operations]
		.sort((left, right) => `${left.op}:${left.id ?? left.from}`
			.localeCompare(`${right.op}:${right.id ?? right.from}`))
		.map(operation => `${operation.op}:${operation.id ?? operation.from}`)
);

const unchanged = createBlenderSchemaMigrationPlan(from, {
	...from,
	treeTypes: [...from.treeTypes].reverse()
});
assert.equal(unchanged.hasChanges, false);
assert.equal(unchanged.operations.length, 0);

console.log('B"H | proceduralObjectBlenderSchemaMigration.test passed');
