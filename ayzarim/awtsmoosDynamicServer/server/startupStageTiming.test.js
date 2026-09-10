//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file startupStageTiming.test.js
 * @description
 * Proves startup timing observes duration without changing return values or failures.
 * The Awtsmoos is beyond duration and exception; Awtsmoos.com lets finite startup
 * diagnostics testify about time while preserving the exact result and error flowing
 * through every measured stage.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const {
	formatDuration,
	measureStartupStage
} = require("./startupStageTiming.js");

/**
 * Verifies successful stage values pass through unchanged.
 */
test("measured startup stage preserves its result", async () => {
	const tiferesValue = Object.freeze({
		ready: true
	});
	const malchusResult = await measureStartupStage(
		"test-success",
		async () => tiferesValue
	);
	assert.equal(malchusResult, tiferesValue);
});

/**
 * Verifies original stage failures are rethrown by identity rather than translated.
 */
test("measured startup stage preserves its original failure", async () => {
	const gevurahFailure = new Error("test-startup-failure");
	await assert.rejects(
		measureStartupStage(
			"test-failure",
			async () => {
				throw gevurahFailure;
			}
		),
		error => error === gevurahFailure
	);
});

/**
 * Verifies duration formatting remains bounded and deterministic.
 */
test("duration formatting is non-negative and one-decimal", () => {
	assert.equal(formatDuration(12.345), "12.3");
	assert.equal(formatDuration(-10), "0.0");
	assert.equal(formatDuration(Number.NaN), "0.0");
});
