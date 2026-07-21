// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every boundary a truthful name: diagnostics speak in
 * codes, budgets reveal excess, and capabilities promise only what they bear.
 */

import assert from "node:assert/strict";

import * as rootApi from "../src/index.js";
import * as proceduralApi from "../src/core/proceduralObject/index.js";

assert.equal(rootApi.createDiagnostic, proceduralApi.createDiagnostic);
assert.equal(rootApi.createOperationDefinition, proceduralApi.createOperationDefinition);
assert.deepEqual(proceduralApi.OPERATION_DETERMINISM_MODES, [
	"deterministic",
	"seeded",
	"external"
]);

const diagnostic = proceduralApi.createDiagnostic({
	code: "FOUNDATION.TEST_SIGNAL",
	severity: "warning",
	message: "The contract is visible.",
	path: ["operations", 0],
	metadata: { expected: true },
	suggestions: ["Inspect the named path."]
});
assert.equal(diagnostic.code, "FOUNDATION.TEST_SIGNAL");
assert.equal(Object.isFrozen(diagnostic.path), true);
assert.equal(Object.isFrozen(diagnostic.metadata), true);
assert.throws(
	() => proceduralApi.createDiagnostic({ code: "lowercase", message: "No." }),
	/uppercase/
);
assert.throws(
	() => proceduralApi.createDiagnostic({ code: "GOOD.CODE", severity: "loud", message: "No." }),
	/Unsupported diagnostic severity/
);

const passing = proceduralApi.evaluateResourceBudget(
	{ vertices: 10, bytes: 100 },
	{ vertices: 4, bytes: 40 }
);
assert.equal(passing.ok, true);
assert.equal(passing.remaining.vertices, 6);
const exceeded = proceduralApi.evaluateResourceBudget(
	{ vertices: 2, operations: 1 },
	{ vertices: 3, operations: 1 }
);
assert.equal(exceeded.ok, false);
assert.deepEqual(exceeded.exceeded, ["vertices"]);
assert.equal(exceeded.diagnostics[0].code, "RESOURCE.BUDGET_EXCEEDED");
assert.throws(
	() => proceduralApi.assertResourceBudget({ bytes: 1 }, { bytes: 2 }),
	error => error instanceof RangeError && error.report?.ok === false
);
assert.throws(
	() => proceduralApi.normalizeResourceBudget({ verticies: 1 }),
	/Unknown resource dimension/
);

const operation = proceduralApi.createOperationDefinition({
	name: "mesh.extrudeFaces",
	version: "1.2.3-beta.1+build.7",
	determinism: "seeded",
	inputCapabilities: ["mesh.topology", "mesh.topology"],
	outputCapabilities: ["mesh.geometry"],
	permissions: ["geometry.write"],
	resourceCost: { operations: 1, vertices: 24 },
	replacement: "ext:awtsmoos/extrudeFaces"
});
assert.equal(operation.name, "mesh.extrudeFaces");
assert.deepEqual(operation.inputCapabilities, ["mesh.topology"]);
assert.equal(operation.resourceCost.vertices, 24);
assert.equal(Object.isFrozen(operation.resourceCost), true);
assert.throws(
	() => proceduralApi.createOperationDefinition({ name: "mesh.test", version: "one" }),
	/semantic version/
);

const manifest = proceduralApi.createCapabilityManifest({
	id: "awtsmoos.meshCore",
	version: "2.0.0",
	operations: ["mesh.extrudeFaces", "ext:awtsmoos/bevelFaces"],
	provides: ["mesh.geometry", "mesh.topology"],
	requires: ["core.artifacts"],
	permissions: ["geometry.write"],
	adapters: ["three.webgl"],
	deterministic: false,
	integrity: "fnv1a64:0123456789abcdef"
});
assert.deepEqual(manifest.operations, [
	"ext:awtsmoos/bevelFaces",
	"mesh.extrudeFaces"
]);
assert.equal(manifest.deterministic, false);
assert.equal(Object.isFrozen(manifest), true);

console.log('B"H | proceduralObjectFoundationContracts.test passed');
