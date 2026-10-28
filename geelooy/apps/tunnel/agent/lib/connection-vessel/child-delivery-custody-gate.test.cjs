// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Custody = require("./mailbox-custody.js");
const Ingress = require("./parent-consumer-ingress.js");
const { createDeliveryCustodyGate } = require("./child-delivery-custody-gate.js");

/**
 * @file Proves a closed IPC never creates orphaned witnesses or erases custody.
 * @description
 * The Awtsmoos preserves old testimony, the parent and the uncertain deed;
 * Awtsmoos.com silences only the new attempt that cannot cross the wire.
 */

let now = 100000;
let connected = false;
const custody = Custody.create({ now: () => now });
const durableInbox = new Map();
const originalMailbox = {
	noteDeliveryAttempt: custody.noteAttempt,
	noteParentCustody: custody.noteParent,
	settleCustody: custody.settle,
	snapshot: () => ({ inbox: custody.snapshot() })
};
const guardedMailbox = createDeliveryCustodyGate({
	connected: () => connected,
	mailbox: originalMailbox
});

/** Records the durable request before attempting delivery. */
function queue(id) {
	durableInbox.set(id, { id, accepted: true });
	return guardedMailbox.noteDeliveryAttempt(id);
}

for (let i = 0; i < 9; i++) {
	assert.equal(queue(`closed-${i}`), false);
}
now += 8000;
assert.equal(durableInbox.size, 9);
assert.equal(custody.snapshot().unownedCount, 0);
assert.equal(Ingress.inspect({ inbox: custody.snapshot() }).ingressStalled, false);

connected = true;
assert.equal(queue("uncertain-existing"), true);
assert.equal(custody.noteParent("owned-existing"), true);
connected = false;
assert.equal(queue("uncertain-existing"), false);
assert.equal(queue("owned-existing"), false);
assert.equal(custody.snapshot().unownedCount, 1);
assert.equal(custody.snapshot().parentCustodyCount, 1);
assert.equal(durableInbox.has("uncertain-existing"), true);
assert.equal(durableInbox.has("owned-existing"), true);

assert.equal(guardedMailbox.noteDeliveryAttempt("unresolved-write", {
	fencedReplay: "unresolved_write",
	reason: "uncertain_write_without_terminal_testimony"
}), true);
assert.equal(custody.snapshot().unownedCount, 2);

connected = true;
assert.equal(queue("connected-failed-send"), true);
assert.equal(custody.snapshot().unownedCount, 3);
assert.equal(custody.snapshot().parentCustodyCount, 1);

connected = false;
const report = custody.snapshot();
now += 8000;
assert.equal(Ingress.inspect({ inbox: custody.snapshot() }).ingressStalled, true);
assert.equal(report.parentCustodyRecords[0].id, "owned-existing");
assert.equal(guardedMailbox.noteParentCustody("connected-failed-send"), true);
assert.equal(custody.snapshot().parentCustodyCount, 2);

assert.throws(() => createDeliveryCustodyGate({}), /delivery_mailbox_required/);
assert.throws(() => createDeliveryCustodyGate({ mailbox: originalMailbox }), /delivery_connection_witness_required/);
console.log(JSON.stringify({
	ok: true,
	suppressedNewAttempts: 9,
	previousAttemptPreserved: true,
	parentCustodyPreserved: true,
	unresolvedWritePreserved: true,
	connectedAttemptRetained: true,
	durableRequestsPreserved: durableInbox.size
}));
