// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Expectation = require("./expectation.js");
const Identity = require("./envelopeIdentity.js");
const Pending = require("./envelopePending.js");
const Presentation = require("./terminalPresentation.js");
const Result = require("./durableRecordResult.js");

/**
 * @file Proves request custody, mutation intent, terminal presentation, and redispatch safety.
 * @description
 * The Awtsmoos keeps preview distinct from deed, custody distinct from completion,
 * and control receipt distinct from job identity. Awtsmoos.com tests those boundaries
 * together so ambiguous transport history can never become a duplicate mutation.
 */
const base = {
	action: "write",
	controlRequestId: "deed-1",
	clientRequestId: "client-1",
	agentSessionId: "session-1",
	logicalAgentId: "agent-1",
	path: "fixture.txt",
	nonce: "nonce-1"
};
const preview = expectation(true, false);
const confirmed = expectation(false, true);

assert.equal(preview.previewRequested, true);
assert.equal(preview.durableRequested, false);
assert.equal(confirmed.previewRequested, false);
assert.equal(confirmed.durableRequested, true);
assert.equal(Expectation.sameExpectation(preview, confirmed), false);

const identity = Identity.identityEnvelope({ ...confirmed, jobId: "job-42" });
assert.equal(identity.receiptType, "control_request");
assert.equal(identity.controlRequestIdType, "control_request");
assert.equal(identity.jobIdType, "command_job");
assert.equal(identity.observationAction, "retryAction");

const acceptedRecord = {
	expected: confirmed,
	dispatchedAt: 100,
	acceptedAt: 200,
	progressAt: 300,
	progressPhase: "command_handler_started"
};
const pending = Pending.timeoutEnvelope(confirmed, 1000, 1000, acceptedRecord);
assert.equal(pending.deviceAcceptanceProven, true);
assert.equal(pending.blindRedispatchForbidden, true);
assert.equal(pending.nextSafeAction, "retryAction");

const acceptedExpiry = Pending.expiredEnvelope(acceptedRecord);
assert.equal(acceptedExpiry.accepted, true);
assert.equal(acceptedExpiry.freshRedispatchSafe, false);
assert.equal(acceptedExpiry.reconciliationRequired, true);

const dispatchedExpiry = Pending.expiredEnvelope({ expected: confirmed, dispatchedAt: 100 });
assert.equal(dispatchedExpiry.accepted, false);
assert.equal(dispatchedExpiry.blindRedispatchForbidden, true);
assert.equal(dispatchedExpiry.freshRedispatchSafe, false);

const neverDispatched = Pending.expiredEnvelope({ expected: confirmed });
assert.equal(neverDispatched.dispatched, false);
assert.equal(neverDispatched.freshRedispatchSafe, true);
assert.equal(neverDispatched.nextSafeAction, "fresh_dispatch_allowed");

const previewTerminal = Presentation.decorate(preview, { ok: true, action: "write" });
assert.equal(previewTerminal.requestSemantics.mutationIntent.previewRequested, true);
assert.equal(
	previewTerminal.requestSemantics.sideEffectProof,
	"preview_requested_no_durable_side_effect_claim"
);

const confirmedTerminal = Presentation.decorate(confirmed, {
	ok: true,
	action: "write",
	afterHash: "abc123"
});
assert.equal(confirmedTerminal.requestSemantics.mutationIntent.durableRequested, true);
assert.equal(confirmedTerminal.requestSemantics.sideEffectProof, "native_terminal_with_hash_witness");

const replayed = Result.effectiveData({
	expected: confirmed,
	state: "completed",
	data: { ok: true, afterHash: "abc123" }
});
assert.equal(replayed.requestSemantics.receiptType, "control_request");
assert.equal(replayed.requestSemantics.sideEffectProof, "native_terminal_with_hash_witness");

const late = Result.effectiveData({
	expected: confirmed,
	state: "expired",
	data: { ok: false, error: "relay_timeout" },
	reconciliation: {
		state: "late_terminal",
		observedAt: "2026-08-25T00:00:00.000Z",
		data: { ok: true, afterHash: "late-hash" }
	}
});
assert.equal(late.reconciliation.state, "late_terminal_promoted");
assert.equal(late.requestSemantics.sideEffectProof, "native_terminal_with_hash_witness");

console.log("BHY relay envelopes preserve custody, terminal truth, and redispatch safety");

function expectation(dryRun, confirm) {
	return Expectation.requestExpectation("relay-1", "awt-test", {
		...base,
		dryRun,
		confirm
	}, 1000);
}
