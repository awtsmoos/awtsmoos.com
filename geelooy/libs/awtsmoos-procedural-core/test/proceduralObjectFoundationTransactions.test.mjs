// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos permits no half-world: a transaction commits whole or returns whole. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const base = {
	scene: { name: "dawn", values: [1, 2] },
	enabled: true
};
const baseHash = api.hashCanonicalValue(base);
const patch = api.createDataPatch({
	expectedHash: baseHash,
	operations: [
		{ op: "test", path: ["scene", "name"], value: "dawn" },
		{ op: "replace", path: ["scene", "name"], value: "radiance" },
		{ op: "add", path: ["scene", "values", 2], value: 3 },
		{ op: "remove", path: ["enabled"] }
	]
});
const applied = api.applyDataPatch(base, patch);
assert.deepEqual(applied.document, {
	scene: { name: "radiance", values: [1, 2, 3] }
});
assert.deepEqual(base, {
	scene: { name: "dawn", values: [1, 2] },
	enabled: true
});
assert.equal(Object.isFrozen(applied.document.scene.values), true);
assert.notEqual(applied.baseHash, applied.resultHash);

assert.throws(
	() => api.applyDataPatch(base, {
		expectedHash: api.hashCanonicalValue({ other: true }),
		operations: []
	}),
	/expectedHash/
);
assert.throws(
	() => api.createDataPatch({
		operations: [{ op: "add", path: ["__proto__", "polluted"], value: true }]
	}),
	/safe strings/
);
assert.throws(
	() => api.normalizeJsonData([, 1]),
	/cannot be sparse/
);
assert.throws(
	() => api.normalizeJsonData({ value: Number.POSITIVE_INFINITY }),
	/must be finite/
);
assert.equal({}.polluted, undefined);

const committed = api.executeTransaction(base, {
	expectedBaseHash: baseHash,
	patches: [
		{
			operations: [
				{ op: "replace", path: ["scene", "name"], value: "noon" },
				{ op: "add", path: ["scene", "values", 2], value: 3 }
			]
		},
		{
			operations: [{ op: "remove", path: ["enabled"] }]
		}
	],
	resourceBudget: { operations: 3, bytes: 10000 }
});
assert.equal(committed.state, "committed");
assert.deepEqual(committed.document, {
	scene: { name: "noon", values: [1, 2, 3] }
});
assert.equal(committed.resourceReport.ok, true);
assert.equal(committed.resourceReport.usage.operations, 3);
assert.equal(Object.isFrozen(committed.document), true);

const stale = api.executeTransaction(base, {
	expectedBaseHash: api.hashCanonicalValue({ stale: true }),
	patches: []
});
assert.equal(stale.state, "rolled_back");
assert.deepEqual(stale.document, base);
assert.equal(stale.resourceReport, null);
assert.equal(stale.diagnostics[0].code, "TRANSACTION.ROLLED_BACK");

const overBudget = api.executeTransaction(base, {
	expectedBaseHash: baseHash,
	patches: [{
		operations: [{ op: "replace", path: ["enabled"], value: false }]
	}],
	resourceBudget: { operations: 0 }
});
assert.equal(overBudget.state, "rolled_back");
assert.deepEqual(overBudget.document, base);
assert.equal(overBudget.resourceReport.ok, false);
assert.deepEqual(overBudget.resourceReport.exceeded, ["operations"]);

const failedTest = api.executeTransaction(base, {
	expectedBaseHash: baseHash,
	patches: [{
		operations: [{ op: "test", path: ["scene", "name"], value: "midnight" }]
	}],
	resourceBudget: { operations: 1 }
});
assert.equal(failedTest.state, "rolled_back");
assert.deepEqual(failedTest.document, base);
assert.equal(failedTest.resourceReport, null);
assert.deepEqual(api.TRANSACTION_STATES, [
	"open", "validating", "committed", "rolled_back"
]);

console.log('B"H | proceduralObjectFoundationTransactions.test passed');
