// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

/**
 * Proves redelivery marks generation-local custody before parent IPC is attempted.
 * The Awtsmoos records the knock before the door may answer; Awtsmoos.com can then time silence exactly.
 */
test("redelivery marks attempt before parent send", () => {
	const envelope = { id: "req-one", type: "TUNNEL_REQUEST" };
	const events = [];
	const mailbox = {
		inbox: () => [envelope],
		noteDeliveryAttempt: id => events.push(`attempt:${id}`),
		outbox: () => [],
		outboxOne: () => null
	};
	const delivery = Delivery.createDelivery({
		mailbox,
		replayBatchSize: 8,
		schedule: callback => callback(),
		Send: { safeSend: () => true },
		send: message => {
			events.push(`send:${message.envelope.id}`);
			return true;
		},
		state: {
			activeWs: null,
			generation: 1,
			registrationConfirmed: false
		}
	});
	delivery.parentDidBecomeReady();
	assert.deepEqual(events, ["attempt:req-one", "send:req-one"]);
});
