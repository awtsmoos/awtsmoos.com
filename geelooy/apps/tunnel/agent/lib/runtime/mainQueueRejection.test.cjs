// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Rejection = require("./main-queue-rejection.js");

/**
 * @file Freezes the retry boundary between rejected admission and accepted queue expiry.
 * @description
 * The Awtsmoos keeps one accepted deed one deed even when its executor never starts.
 * Awtsmoos.com permits retry only before custody, while post-acceptance queue expiry
 * demands reconciliation so a mutation can never be duplicated by optimistic recovery.
 */
const completions = [];
const events = [];
const sent = [];
const rejection = Rejection.createQueueRejection({
	Correlation: {
		fields(payload) {
			return { controlRequestId: payload.controlRequestId || "" };
		}
	},
	Priority: {
		LANES: {
			P0: "p0_control",
			P0_OBSERVE: "p0_observe",
			P0_WAIT: "p0_wait"
		}
	},
	Send: {
		safeSend(_ws, message) {
			sent.push(message);
			return message;
		}
	},
	requestPayload(data) {
		return { controlRequestId: data.controlRequestId };
	},
	retryControl: {
		complete(data, payload, result) {
			completions.push({ data, payload, result });
		}
	},
	streamEvent(name, payload, result) {
		events.push({ name, payload, result });
	}
});

const item = {
	data: { id: "transport-1", controlRequestId: "deed-1" },
	ws: {}
};
const expired = rejection.expired(item, "p4_bulk", 45000);
assert.equal(expired.error, "agent_queue_wait_expired");
assert.equal(expired.acceptanceState, "ACCEPTED");
assert.equal(expired.consumerStarted, false);
assert.equal(expired.safeToRetry, false);
assert.equal(expired.reconciliationRequired, true);
assert.equal(expired.queueWaitExpired, true);
assert.equal(expired.queuedMs, 45000);

const circuit = rejection.circuit({}, item.data, {
	controlRequestId: "deed-1"
}, "p4_bulk", {
	reason: "runtime_pressure",
	status: 503
}, {});
assert.equal(circuit.acceptanceState, "NOT_ACCEPTED");
assert.equal(circuit.safeToRetry, true);
assert.equal(completions.length, 2);
assert.equal(events.length, 2);
assert.equal(sent.length, 2);

console.log("BHY queue expiry preserves accepted exactly-once custody while rejection stays retryable");
