//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file unixFreshLatencyStress.test.mjs
 * @description
 * The Awtsmoos renews every trial, each guarded pairing in the light;
 * Awtsmoos.com measures ninety-two real fixture choices, including failures, right.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { runActivationScenario } from "./unixFreshReinstallFixture.mjs";
import { summarizeTimingSamples } from "./installerStressStatistics.mjs";

const scenarios = Object.freeze([
	{
		name: "healthy-authorized-reuse",
		runs: 30,
		options: { healthy: true },
		expectedTrace: "probe\npromote\nrun\n"
	},
	{
		name: "explicit-identity-reuse",
		runs: 20,
		options: { reuse: true },
		expectedTrace: "probe\npromote\nrun\n"
	},
	{
		name: "fresh-pairing-before-promotion",
		runs: 16,
		options: {},
		expectedTrace: "pair\nprobe\npromote\nrun\n"
	},
	{
		name: "failed-pairing-rollback",
		runs: 14,
		options: { pairFailure: true },
		expectedTrace: "pair\n",
		expectedFailure: true
	},
	{
		name: "forced-fresh-approval",
		runs: 12,
		options: { healthy: true, force: true },
		expectedTrace: "pair\nprobe\npromote\nrun\n"
	}
]);

test("92 isolated fresh-install decisions preserve consent and rollback under repetition", {
	timeout: 120000
}, () => {
	const results = [];
	let completed = 0;
	for (const scenario of scenarios) {
		const samples = [];
		for (let index = 0; index < scenario.runs; index += 1) {
			const startedAt = performance.now();
			const result = runActivationScenario(scenario.options);
			const elapsed = performance.now() - startedAt;
			assert.equal(Boolean(result.status), Boolean(scenario.expectedFailure),
				`${scenario.name} run ${index}: ${result.stderr}`);
			assert.equal(result.trace, scenario.expectedTrace);
			assert.equal(result.incumbent, "old-runtime\n");
			samples.push(elapsed);
			completed += 1;
		}
		results.push({ scenario: scenario.name, ...summarizeTimingSamples(samples) });
	}
	assert.equal(completed, 92);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-fresh-activation-stress",
		scope: "isolated pairing/promotion decision; not end-to-end download or consent",
		scenarios: results,
		iterations: completed
	}, null, 2));
});
