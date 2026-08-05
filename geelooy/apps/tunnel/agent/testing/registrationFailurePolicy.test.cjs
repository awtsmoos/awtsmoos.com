// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Policy = require("../recovery/registrationFailurePolicy.js");
const State = require("../recovery/stateStore.js");
const Transition = require("../recovery/registrationFailureTransition.js");

/** Transient wire wounds never displace healthy runtime code. */
test("transient registration failures never trigger archive restoration", () => {
	let state = State.defaults();
	for (const reason of [
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

/** Missing ACK evidence asks identity inspection instead of archive roulette. */
test("a missing registration receipt escalates to identity inspection", () => {
	const state = Transition.report(
		State.defaults(),
		"registration_receipt_missing",
		Date.now()
	);
	assert.equal(state.restoreRequired, false);
	assert.equal(state.lastFailureKind, "identity");
	assert.equal(state.identityInspectionRequired, true);
	assert.equal(state.identityResetRequired, false);
	assert.equal(Policy.classify("registration_ack_timeout").restoreEligible, false);
});

/** Proven key wounds demand a full identity reset, never code rollback. */
test("cryptographic mismatch requests bounded identity reset", () => {
	const state = Transition.report(
		State.defaults(),
		"error:1E08010C:DECODER routines::unsupported",
		Date.now()
	);
	assert.equal(state.restoreRequired, false);
	assert.equal(state.identityInspectionRequired, true);
	assert.equal(state.identityResetRequired, true);
	assert.equal(state.lastFailureKind, "identity");
});

test("three bounded software failures remain rollback eligible", () => {
	const start = Date.now();
	let state = State.defaults();
	state = Transition.report(state, "agent_manifest_invalid", start);
	state = Transition.report(state, "agent_manifest_invalid", start + 1000);
	state = Transition.report(state, "agent_manifest_invalid", start + 2000);
	assert.equal(state.restoreRequired, true);
	assert.equal(state.restoreEligibleRegistrationFailures, 3);
	assert.equal(state.lastFailureKind, "software");
});
