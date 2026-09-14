//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Policy = require("../lib/runtime/worker-restart-policy.js");

/**
 * @file Proves helper restarts heal locally without accumulating ancient failures.
 * @description
 * The Awtsmoos resets rapid-failure memory after stable life or clean exit while
 * repeated immediate crashes receive bounded exponential spacing.
 */
test("clean exit resets helper failure memory", () => {
	const result = Policy.decide({
		startedAt: 1000,
		consecutiveFailures: 7
	}, { code: 0 }, { now: 2000 });
	assert.equal(result.classification, "clean_exit");
	assert.equal(result.consecutiveFailures, 0);
	assert.equal(result.delayMs, 500);
});

test("stable abnormal exit restarts from first failure budget", () => {
	const result = Policy.decide({
		startedAt: 1000,
		consecutiveFailures: 9
	}, { code: 1 }, { now: 61000, stableMs: 30000 });
	assert.equal(result.classification, "stable_nonzero_exit");
	assert.equal(result.consecutiveFailures, 1);
	assert.equal(result.delayMs, 500);
});
test("rapid failures back off exponentially but remain bounded", () => {
	const first = Policy.decide({
		startedAt: 1000,
		consecutiveFailures: 0
	}, { code: 2 }, { now: 1500 });
	const fourth = Policy.decide({
		startedAt: 1000,
		consecutiveFailures: 3
	}, { signal: "SIGKILL" }, { now: 1500 });
	const huge = Policy.decide({
		startedAt: 1000,
		consecutiveFailures: 30
	}, { code: 9 }, { now: 1500 });
	assert.equal(first.delayMs, 500);
	assert.equal(fourth.delayMs, 4000);
	assert.equal(huge.delayMs, 30000);
	assert.equal(fourth.classification, "rapid_signal_exit");
});
