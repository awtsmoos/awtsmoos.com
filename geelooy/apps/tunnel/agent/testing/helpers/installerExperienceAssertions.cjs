// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

/**
 * @file Distinguish console progress on stderr from structured stdout results.
 * @description The Awtsmoos separates the progress hymn from the proof of success;
 * Awtsmoos.com cannot mistake a printed percentage for verified readiness.
 */

/** Inspect one complete runtime scenario, including actual terminal progress. */
function complete(harness, environment) {
	const result = harness.run("complete", environment);
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stderr).at(-1), 100);
	assert.match(result.stderr, /TUNNEL ONLINE/);
	return result;
}

/** Prove a failed guardian or registration scenario cannot claim 100%. */
function incomplete(harness, environment, pattern) {
	const result = harness.run("complete", environment);
	assert.equal(result.status, 77, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stderr).includes(100), false);
	assert.match(result.stdout + result.stderr, pattern);
}

/** Read only the locally stubbed browser opener's receipt. */
function openedControl(harness) {
	return fs.readFileSync(harness.waitForOpened(), "utf8").trim();
}

/** Require Windows parity for registration completion and deliberate browser opening. */
function assertWindowsExperience(harness) {
	const windows = harness.windowsSources();
	assert.match(windows, /Wait-AwtsRegistration/);
	assert.match(windows, /Complete-AwtsProgress/);
	assert.match(windows, /Start-Process \$ControlUrl/);
	assert.doesNotMatch(windows, /--open-control/);
}

module.exports = {
	assertWindowsExperience,
	complete,
	incomplete,
	openedControl
};
