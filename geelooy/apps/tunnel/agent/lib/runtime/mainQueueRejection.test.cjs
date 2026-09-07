// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Rejection = require("./main-queue-rejection.js");

/**
 * @file Proves refusal persists before rejected ingress retires, with plain-socket fallback.
 * @description The Awtsmoos keeps NOT_ACCEPTED distinct from accepted custody; Awtsmoos.com
 * writes terminal refusal durably when the connection proxy exists and never invents retry
 * permission after an already accepted queue wait expires.
 */
const completions = [];
const events = [];
const fallback = [];
const durable = [];
const rejection = Rejection.createQueueRejection(dependencies());
const durableSocket = {
	durableSend(message) {
		durable.push(message);
		return { queued: true };
	}
};

const identity = rejection.identity(durableSocket, {
	id: "transport-identity"
}, {
	controlRequestId: "deed-identity"
}, {
	code: "INVALID_REQUEST_IDENTITY",
	missingFields: ["logicalAgentId"]
});
assert.equal(identity.acceptanceState, "NOT_ACCEPTED");
assert.equal(identity.safeToRetry, true);
assert.equal(identity.code, "INVALID_REQUEST_IDENTITY");
assert.equal(durable.length, 1);
assert.equal(fallback.length, 0);

const expired = rejection.expired({
	data: { id: "transport-expired", controlRequestId: "deed-expired" },
	ws: durableSocket
}, "p4_bulk", 45000);
assert.equal(expired.acceptanceState, "ACCEPTED");
assert.equal(expired.safeToRetry, false);
assert.equal(expired.reconciliationRequired, true);
assert.equal(durable.length, 2);

const circuit = rejection.circuit({}, {
	id: "transport-circuit"
}, {
	controlRequestId: "deed-circuit"
}, "p4_bulk", {
	reason: "runtime_pressure",
	status: 503
}, {});
assert.equal(circuit.acceptanceState, "NOT_ACCEPTED");
assert.equal(fallback.length, 1);
assert.equal(completions.length, 3);
assert.equal(events.length, 3);

console.log("BHY queue refusal is durable before rejection and accepted expiry remains fenced");

function dependencies() {
	return {
		Correlation: {
			fields(payload) {
				return { controlRequestId: payload.controlRequestId || "" };
			}
		},
		Priority: {
			LANES: { P0: "p0_control", P0_OBSERVE: "p0_observe", P0_WAIT: "p0_wait" }
		},
		Send: {
			safeSend(_ws, message) {
				fallback.push(message);
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
	};
}
