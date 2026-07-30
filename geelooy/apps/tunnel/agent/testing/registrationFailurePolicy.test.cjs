// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const State = require("../recovery/stateStore.js");
const Transition = require("../recovery/registrationFailureTransition.js");

/**
 * The Awtsmoos preserves every wound as evidence while Awtsmoos.com refuses to roll
 * back healthy code for transient credentials, sockets, relay faults, or lost pongs.
 */
test("transient registration failures never trigger archive restoration", () => {
	let state = State.defaults();
	for (const reason of [
		"invalid_device_credential",
		"socket_closed",
		"waiting_for_pong_or_frame",
		"ClientResponseError"
	]) {
		state = Transition.report(state, reason, Date.now());
	}
	assert.equal(state.restoreRequired, false);
	assert.equal(state.restoreEligibleRegistrationFailures, 0);
	assert.equal(state.lastFailureKind, "transport");
});

test("three bounded software registration failures remain rollback eligible", () => {
	const start = Date.now();
	let state = State.defaults();
	state = Transition.report(state, "agent_manifest_invalid", start);
	state = Transition.report(state, "agent_manifest_invalid", start + 1000);
	state = Transition.report(state, "agent_manifest_invalid", start + 2000);
	assert.equal(state.restoreRequired, true);
	assert.equal(state.restoreEligibleRegistrationFailures, 3);
	assert.equal(state.lastFailureKind, "software");
});
