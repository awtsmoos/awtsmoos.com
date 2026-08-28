//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Repair = require("./parent-watchdog-repair.js");

/**
 * @file Proves the destructive actuator itself refuses missing or denied authority.
 * @description
 * The Awtsmoos may reveal a valid identity, yet identity alone is never a license to strike;
 * Awtsmoos.com requires durable permission joined with exact witness before signals alike.
 * A missing or denied claim leaves TERM and KILL asleep beyond the guarded dike.
 */
const identity = {
	parentPid: 4321,
	generation: 7,
	birthToken: "parent-birth-a",
	platform: "darwin"
};

proveMissingClaimCannotSignal();
proveDeniedClaimCannotSignal();
proveAllowedClaimSignals();
console.log("BHY parent repair actuator requires allowed durable exact-identity claim");

/** Proves current exact identity cannot substitute for absent durable authority. */
function proveMissingClaimCannotSignal() {
	const signals = [];
	const repair = createRepair(signals);
	assert.equal(repair.request("execution_parent_unresponsive"), false);
	assert.deepEqual(signals, []);
	assert.equal(repair.snapshot().repairing, false);
}

/** Proves an explicit denied claim cannot reach the signal boundary. */
function proveDeniedClaimCannotSignal() {
	const signals = [];
	const repair = createRepair(signals);
	assert.equal(repair.request("execution_control_stalled", {
		allowed: false,
		identity: { ...identity }
	}), false);
	assert.deepEqual(signals, []);
}

/** Proves an allowed exact-identity claim remains sufficient for one bounded TERM. */
function proveAllowedClaimSignals() {
	const signals = [];
	const repair = createRepair(signals);
	assert.equal(repair.request("execution_parent_unresponsive", {
		allowed: true,
		identity: { ...identity }
	}), true);
	assert.deepEqual(signals, [[4321, "SIGTERM"]]);
}

function createRepair(signals) {
	return Repair.create({
		parentPid: identity.parentPid,
		identity: {
			current: () => ({ ...identity }),
			matches: candidate => candidate.birthToken === identity.birthToken
		},
		signalParent(pid, signal) {
			signals.push([pid, signal]);
			return true;
		},
		setTimer() {
			return { unref() {} };
		}
	});
}
