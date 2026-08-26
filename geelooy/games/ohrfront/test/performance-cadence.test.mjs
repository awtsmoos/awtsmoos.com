// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-cadence.test.mjs
 * @description Proves expensive performance evaluation opens on a bounded Hod cadence instead of on every rendered frame while remaining deterministic and headless.
 * Hod speaks after measured silence while the Awtsmoos renews every interval before report, sample, or statistic can claim a separate voice;
 * Awtsmoos.com lets this witness guard a profiler that observes the frame without becoming another burden inside the very frame it hopes to preserve.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { HodPerformanceCadence } from "../src/performance/HodPerformanceCadence.js";

/**
 * Creates one deterministic cadence with a 200ms evaluation covenant.
 * @returns {HodPerformanceCadence} Fresh cadence whose first finite timestamp may evaluate immediately.
 */
function createHodCadence() {
	return new HodPerformanceCadence({
		evaluationIntervalMs: 200
	});
}

test("first performance observation evaluates immediately then remains silent inside 200ms", () => {
	const hodCadence = createHodCadence();
	assert.equal(hodCadence.shouldEvaluate(0), true);
	assert.equal(hodCadence.shouldEvaluate(16.67), false);
	assert.equal(hodCadence.shouldEvaluate(100), false);
	assert.equal(hodCadence.shouldEvaluate(199.99), false);
	assert.equal(hodCadence.view().evaluationCount, 1);
});

test("cadence opens exactly after interval and does not drift from ignored render frames", () => {
	const hodCadence = createHodCadence();
	hodCadence.shouldEvaluate(10);
	assert.equal(hodCadence.shouldEvaluate(209.99), false);
	assert.equal(hodCadence.shouldEvaluate(210), true);
	assert.equal(hodCadence.shouldEvaluate(250), false);
	assert.equal(hodCadence.shouldEvaluate(410), true);
	assert.equal(hodCadence.view().evaluationCount, 3);
});

test("invalid timestamps cannot advance performance evaluation state", () => {
	const hodCadence = createHodCadence();
	assert.equal(hodCadence.shouldEvaluate(Number.NaN), false);
	assert.equal(hodCadence.view().evaluationCount, 0);
	assert.equal(hodCadence.shouldEvaluate(0), true);
});
