// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Health = require("../lib/connection-vessel/child-health.js");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * Proves durable testimony and generation-local custody remain separate truths.
 * The Awtsmoos preserves the record while Awtsmoos.com times only this generation's handoff.
 */
test("delivery attempt becomes unowned until parent custody or settlement", () => {
	let clock = 100000;
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mailbox-custody-"));
	const mailbox = Mailbox.createMailbox({ deviceStateRoot: root }, { now: () => clock });
	mailbox.putInbox({ id: "one", type: "TUNNEL_REQUEST" });
	let snapshot = mailbox.snapshot();
	assert.equal(snapshot.inbox.unownedCount, 0);
	mailbox.noteDeliveryAttempt("one");
	clock += 31000;
	snapshot = mailbox.snapshot();
	assert.equal(snapshot.inbox.unownedCount, 1);
	assert.equal(snapshot.inbox.unownedOldestAgeMs, 31000);
	mailbox.noteDeliveryAttempt("one");
	assert.equal(mailbox.snapshot().inbox.unownedOldestAgeMs, 31000);
	mailbox.noteParentCustody("one");
	snapshot = mailbox.snapshot();
	assert.equal(snapshot.inbox.unownedCount, 0);
	assert.equal(snapshot.inbox.parentCustodyCount, 1);
	assert.equal(mailbox.inbox().length, 1);
	mailbox.acknowledge("one");
	assert.equal(mailbox.snapshot().inbox.parentCustodyCount, 0);
	assert.equal(mailbox.inbox().length, 0);
	fs.rmSync(root, { recursive: true, force: true });
});

test("parent-owned degraded inbox remains healthy without deleting testimony", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mailbox-custody-"));
	const mailbox = Mailbox.createMailbox({ deviceStateRoot: root });
	mailbox.putInbox({ id: "one", type: "TUNNEL_REQUEST" });
	mailbox.putInbox({ id: "two", type: "TUNNEL_REQUEST" });
	mailbox.noteParentCustody("one");
	mailbox.noteParentCustody("two");
	const snapshot = forceDegraded(mailbox.snapshot());
	const result = Health.compose({
		activeWs: { opened: true },
		registrationConfirmed: true
	}, {
		healthy: true,
		execution: { healthy: true, stages: {} }
	}, snapshot);
	assert.equal(snapshot.inbox.parentCustodyCount, 2);
	assert.equal(snapshot.inbox.unownedCount, 0);
	assert.equal(result.healthy, true);
	assert.equal(result.mailbox.activeExecutionGrace, true);
	assert.equal(mailbox.inbox().length, 2);
	fs.rmSync(root, { recursive: true, force: true });
});

function forceDegraded(mailbox) {
	return {
		...mailbox,
		health: { healthy: false, state: "degraded" },
		inbox: { ...mailbox.inbox, state: "degraded" },
		outbox: { ...mailbox.outbox, state: "healthy" }
	};
}
