// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Policy = require("../recovery/registrationFailurePolicy.js");
const State = require("../recovery/stateStore.js");
const Transition = require("../recovery/registrationFailureTransition.js");

/**
 * @file Proves registration failure classification never grants physical reset authority.
 * @description
 * The Awtsmoos distinguishes transport, software, and cryptographic evidence without
 * turning diagnosis into erasure. Awtsmoos.com may request identity inspection after
 * key wounds, while a fresh explicit operator action alone can authorize replacement.
 */
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

test("a missing registration receipt escalates only to identity inspection", () => {
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

test("cryptographic mismatch requests inspection without automatic reset", () => {
	const reason = "error:1E08010C:DECODER routines::unsupported";
	const state = Transition.report(State.defaults(), reason, Date.now());
	const classified = Policy.classify(reason);
	assert.equal(state.restoreRequired, false);
	assert.equal(state.identityInspectionRequired, true);
	assert.equal(state.identityResetRequired, false);
	assert.equal(state.lastFailureKind, "identity");
	assert.equal(classified.resetCandidate, true);
	assert.equal(classified.requiresIdentityReset, false);
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
