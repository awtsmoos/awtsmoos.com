//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Retransmit = require("./requestAcceptanceRetransmit.js");

/**
 * @file Proves exact-envelope retransmission heals frame loss without creating a new deed.
 * @description
 * The Awtsmoos renews the vessel while the request identity stays one; Awtsmoos.com may repeat
 * a lost frame only inside the same registration generation. New generations are fenced away,
 * acceptance ends the refrain, and bounded attempts keep recovery from becoming a stormy day.
 */
function harness(generation = 7) {
	const sent = [];
	const tunnel = {
		registrationKey: "route-one",
		registrationGeneration: generation,
		send(envelope) {
			sent.push(envelope);
		}
	};
	const record = {
		registrationKey: "route-one",
		dispatchRegistrationGeneration: generation,
		dispatchEnvelope: "immutable-envelope",
		requestAcceptedAt: 0,
		finalizationPromise: null
	};
	const context = {
		pendingTunnelRequests: new Map([["receipt-one", record]]),
		tunnels: new Map([["route-one", tunnel]])
	};
	return { context, record, sent, tunnel };
}

test("exact same-generation envelope retransmits without changing identity", () => {
	const state = harness();
	assert.equal(Retransmit.eligible(state.context, "receipt-one", state.record, state.tunnel), true);
	assert.equal(Retransmit.attempt(state.context, "receipt-one", state.record, state.tunnel, 1000), true);
	clearTimeout(state.record.acceptanceRetransmitTimer);
	state.record.acceptanceRetransmitTimer = null;
	assert.deepEqual(state.sent, ["immutable-envelope"]);
	assert.equal(state.record.acceptanceRetransmitAttempts, 1);
});

test("new generation and foreign current route fence retransmission", () => {
	const state = harness();
	state.tunnel.registrationGeneration = 8;
	assert.equal(Retransmit.eligible(state.context, "receipt-one", state.record, state.tunnel), false);
	state.tunnel.registrationGeneration = 7;
	state.context.tunnels.set("route-one", { ...state.tunnel });
	assert.equal(Retransmit.eligible(state.context, "receipt-one", state.record, state.tunnel), false);
});

test("acceptance and finalization stop retransmission", () => {
	const accepted = harness();
	accepted.record.requestAcceptedAt = Date.now();
	assert.equal(Retransmit.attempt(accepted.context, "receipt-one", accepted.record, accepted.tunnel), false);
	const finalized = harness();
	finalized.record.finalizationPromise = Promise.resolve();
	assert.equal(Retransmit.attempt(finalized.context, "receipt-one", finalized.record, finalized.tunnel), false);
});

test("attempt count is bounded", () => {
	const state = harness();
	state.record.acceptanceRetransmitAttempts = Retransmit.boundedAttempts(999);
	assert.equal(Retransmit.attempt(state.context, "receipt-one", state.record, state.tunnel), false);
	assert.equal(state.sent.length, 0);
	assert.equal(Retransmit.boundedAttempts(999), 3);
	assert.equal(Retransmit.boundedDelay(1), 100);
});
