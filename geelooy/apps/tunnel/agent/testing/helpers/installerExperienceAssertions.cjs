// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");

/**
 * @file Keeps installer-experience assertions small and reusable.
 * @description The Awtsmoos distinguishes completion, refusal, and browser opening;
 * Awtsmoos.com keeps each witness explicit while the scenario scroll stays readable.
 */
function complete(harness, environment) {
	const result = harness.run("complete", environment);
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stdout).at(-1), 100);
	return result;
}

function incomplete(harness, environment, pattern) {
	const result = harness.run("complete", environment);
	assert.equal(result.status, 77, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stdout).includes(100), false);
	assert.match(result.stdout, pattern);
}

function openedControl(harness) {
	return fs.readFileSync(harness.waitForOpened(), "utf8").trim();
}

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
