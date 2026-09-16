//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Delivery = require("../lib/connection-vessel/child-delivery.js");
const Router = require("../lib/connection-vessel/child-message-router.js");
const Protocol = require("../lib/connection-vessel/protocol.js");

const CHILD_INCARNATION_ID = "child-durable-custody";

/**
 * @file Proves current-child queue custody is distinct from terminal settlement.
 * @description The Awtsmoos keeps one accepted deed written until its true answer is sealed;
 * Awtsmoos.com replays only this child's unsettled witness and never resurrects terminal work.
 */
test("parent queue ACK records custody without deleting durable inbox", () => {
	const calls = [];
	const runtime = {
		noteParentCustody(id) {
			calls.push(["custody", id]);
		},
		mailbox: {
			acknowledge(id) {
				calls.push(["delete", id]);
			}
		}
	};
	const router = Router.createChildMessageRouter(runtime);
	const handled = router.handle(Protocol.message(Protocol.TYPES.ACK, {
		id: "receipt-one"
	}));
	assert.equal(handled, true);
	assert.deepEqual(calls, [["custody", "receipt-one"]]);
});

test("terminal outbox suppresses current-child replay while unsettled work replays", () => {
	const sent = [];
	const inbox = [
		currentEnvelope("already-terminal"),
		currentEnvelope("still-unsettled")
	];
	const mailbox = {
		inbox: () => inbox,
		outbox: () => [],
		outboxOne: id => id === "already-terminal" ? { id, type: "TUNNEL_RESPONSE" } : null
	};
	const delivery = Delivery.createDelivery({
		mailbox,
		state: {
			childIncarnationId: CHILD_INCARNATION_ID,
			generation: 1,
			registrationConfirmed: false
		},
		Send: { safeSend: () => true },
		schedule: callback => callback(),
		send: message => {
			sent.push(message);
			return true;
		}
	});
	delivery.parentDidBecomeReady();
	assert.equal(sent.length, 1);
	assert.equal(sent[0].type, Protocol.TYPES.REQUEST);
	assert.equal(sent[0].envelope.id, "still-unsettled");
	assert.deepEqual(delivery.unsettledInbox().map(item => item.id), ["still-unsettled"]);
});

function currentEnvelope(id) {
	return {
		childIncarnationId: CHILD_INCARNATION_ID,
		id,
		payload: { action: "read" }
	};
}
