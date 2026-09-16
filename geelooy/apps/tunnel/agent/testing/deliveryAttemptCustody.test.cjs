//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

const CHILD_INCARNATION_ID = "child-delivery-attempt";

/**
 * @file Proves redelivery marks current-child custody before parent IPC is attempted.
 * @description The Awtsmoos records the knock before the door may answer; Awtsmoos.com stamps
 * the living child so obsolete or ambiguous records never masquerade as current delivery work.
 */
test("redelivery marks attempt before parent send", () => {
	const envelope = {
		childIncarnationId: CHILD_INCARNATION_ID,
		id: "req-one",
		type: "TUNNEL_REQUEST"
	};
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
			childIncarnationId: CHILD_INCARNATION_ID,
			generation: 1,
			registrationConfirmed: false
		}
	});
	delivery.parentDidBecomeReady();
	assert.deepEqual(events, ["attempt:req-one", "send:req-one"]);
});
