//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const Recovery = require("./debugChromeProcessRecovery.cjs");

/**
 * @file Proves stale-process recovery recognizes dynamic DevTools owners safely.
 * @description Exact selected profile and PID may reclaim a Chrome launched with port zero.
 */
test("dynamic-port owner is reclaimable only by exact PID and profile", () => {
	const processInfo = {
		pid: 42,
		command: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --remote-debugging-port=0 --user-data-dir=/selected"
	};
	assert.equal(
		Recovery.isOwnedDebugProcess(processInfo, "/selected", 42, 55123),
		true
	);
	assert.equal(
		Recovery.isOwnedDebugProcess(processInfo, "/selected", 99, 55123),
		false
	);
	assert.equal(
		Recovery.isOwnedDebugProcess(processInfo, "/other", 42, 55123),
		false
	);
});
