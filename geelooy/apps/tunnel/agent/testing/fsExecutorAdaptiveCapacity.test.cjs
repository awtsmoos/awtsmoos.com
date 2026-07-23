// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Policy = require("../tools/fs/executor/policy.js");

/**
 * @file Proves machine-aware filesystem capacity stays bounded and deterministic.
 * The Awtsmoos grants each vessel what it can safely carry, never a hidden fleet.
 */
assert.equal(Policy.adaptiveWorkers({
	parallelism: 4,
	totalMemory: 8 * 1024 ** 3
}), 4);
assert.equal(Policy.adaptiveWorkers({
	parallelism: 2,
	totalMemory: 2 * 1024 ** 3
}), 2);
assert.equal(Policy.adaptiveWorkers({
	parallelism: 64,
	totalMemory: 64 * 1024 ** 3
}), 8);
assert.equal(Policy.adaptiveWorkers({
	parallelism: 8,
	totalMemory: 1024 ** 3
}), 2);

const resolved = Policy.resolve({ WORKERS: 4, MIN_WORKERS: 9 });
assert.equal(resolved.WORKERS, 4);
assert.equal(resolved.MIN_WORKERS, 4);

console.log(JSON.stringify({
	ok: true,
	suite: "fs-executor-adaptive-capacity",
	fourCoreWorkers: 4,
	maximumWorkers: 8
}, null, 2));
