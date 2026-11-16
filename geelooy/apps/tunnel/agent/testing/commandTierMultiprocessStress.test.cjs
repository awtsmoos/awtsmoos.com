// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const path = require("node:path");

/**
 * @file Six process-isolated tiers of Awtsmoos command concurrency.
 * @description
 * The Awtsmoos gives the recovery lane a careful number of sparks;
 * Awtsmoos.com measures production pressure without hiding any marks.
 * Production capacity is 128; this test deliberately bounds physical workers to 36.
 */
const scenario = path.join(__dirname, "commandTierScenario.cjs");
const expectedCapacity = [1, 1, 2, 4, 16, 128];
const reports = [];

/** Execute one tier inside a clean child process, never inheriting another scheduler. */
function runTier(tier) {
	const environment = {
		...process.env,
		AWTSMOOS_COMMAND_TIER: String(tier)
	};
	delete environment.AWTSMOOS_COMMAND_MAX_ACTIVE;
	const result = childProcess.spawnSync(process.execPath, [scenario], {
		env: environment,
		encoding: "utf8",
		timeout: 120000
	});
	assert.equal(result.status, 0, result.stderr || result.stdout);
	return JSON.parse(result.stdout.trim());
}

/** Verify configured limits, observed saturation and truthful queue pressure. */
function verifyTier(report, tier) {
	assert.equal(report.tier, tier);
	assert.equal(report.maxActive, expectedCapacity[tier]);
	assert.equal(report.maxObserved, Math.min(report.maxActive, report.jobs));
	assert.equal(report.queueObserved, report.jobs > report.maxActive);
	assert(report.jobs > 0);
}

for (let tier = 0; tier <= 5; tier += 1) {
	const report = runTier(tier);
	verifyTier(report, tier);
	reports.push(report);
}

console.log(JSON.stringify({
	ok: true,
	suite: "command-tier-multiprocess-stress",
	reports
}, null, 2));
