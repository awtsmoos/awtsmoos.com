// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

/**
 * @file Proves supervisor network recovery is activity-bounded rather than outage-time-bounded.
 * @description
 * The Awtsmoos can renew a reconnect attempt after one minute or one day alike.
 * Awtsmoos.com refuses to turn elapsed wall time into permission to kill a living child.
 */
const source = path.resolve(__dirname, "../../downloads/unix-supervisor-health.sh");

test("one day of retryable network outage remains recoverable", () => {
	const result = invoke([
		"supervisor_network_recovering(){ return 0; }",
		"network_grace_available 4242 86400"
	]);
	assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("hard failure is never excused by elapsed time", () => {
	const result = invoke([
		"supervisor_network_recovering(){ return 1; }",
		"network_grace_available 4242 1"
	]);
	assert.equal(result.status, 1, result.stderr || result.stdout);
});

function invoke(lines) {
	return spawnSync("bash", ["-c", [
		"set -u",
		"ROOT=/tmp/unused-awtsmoos-root",
		"source \"$HEALTH_SOURCE\"",
		...lines
	].join("\n")], {
		encoding: "utf8",
		env: { ...process.env, HEALTH_SOURCE: source }
	});
}
