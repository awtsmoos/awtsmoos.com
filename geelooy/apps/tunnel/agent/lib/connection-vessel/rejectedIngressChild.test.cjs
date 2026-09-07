// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Protocol = require("./protocol.js");
const { createChildMessageRouter } = require("./child-message-router.js");
const { createCustody } = require("./child-runtime-custody.js");

/**
 * @file Proves rejected ingress retires exact inbox while terminal outbox survives relay ACK.
 * @description The Awtsmoos preserves refusal after non-admission; Awtsmoos.com fences the
 * current child and generation, removes only that inbox deed, and leaves response testimony
 * untouched until the relay's separate acknowledgement boundary.
 */
function createHarness() {
	const inbox = [{ childIncarnationId: "child-current", id: "receipt-one" }];
	const outbox = [{ id: "receipt-one", type: "TUNNEL_RESPONSE" }];
	const retired = [];
	const mailbox = {
		acknowledge() {
			throw new Error("full relay acknowledgement is forbidden during REJECT");
		},
		inbox: () => [...inbox],
		noteCustodyProgress: () => true,
		noteParentCustody: () => true,
		outbox: () => [...outbox],
		retireRejectedInbox(id) {
			const index = inbox.findIndex(record => Protocol.requestId(record) === id);
			if (index < 0) return false;
			inbox.splice(index, 1);
			retired.push(id);
			return true;
		},
		snapshot: () => ({ inbox: { parentCustodyRecords: [] } })
	};
	const custody = createCustody({
		mailbox,
		parent: { noteCustody: () => true },
		state: { childIncarnationId: "child-current", generation: 7 }
	});
	const router = createChildMessageRouter({ rejectRequest: custody.rejectRequest });
	return { inbox, outbox, retired, router };
}

function rejection(overrides = {}) {
	return Protocol.message(Protocol.TYPES.REJECT, {
		childIncarnationId: "child-current",
		generation: 7,
		id: "receipt-one",
		...overrides
	});
}

const harness = createHarness();
assert.equal(harness.router.handle(rejection({ childIncarnationId: "child-old" })), false);
assert.equal(harness.router.handle(rejection({ generation: 6 })), false);
assert.deepEqual(harness.retired, []);
assert.equal(harness.inbox.length, 1);
assert.equal(harness.outbox.length, 1);
assert.equal(harness.router.handle(rejection()), true);
assert.deepEqual(harness.retired, ["receipt-one"]);
assert.equal(harness.inbox.length, 0);
assert.equal(harness.outbox.length, 1);
assert.equal(harness.router.handle(rejection()), false);

console.log("B\"H rejected ingress preserves terminal outbox until relay ACK");
