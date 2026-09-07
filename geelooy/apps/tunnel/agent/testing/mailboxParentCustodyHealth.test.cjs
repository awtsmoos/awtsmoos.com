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

const CHILD_INCARNATION_ID = "child-custody-health-test";

/**
 * @file Proves durable testimony and exact live custody remain separate truths.
 * @description
 * The Awtsmoos preserves the parchment while Awtsmoos.com grants grace only to a deed
 * whose exact current-child custody has advanced into living execution, never to admission alone.
 */
test("delivery attempt becomes unowned until parent custody or settlement", () => {
	let clock = 100000;
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mailbox-custody-"));
	const mailbox = createOhrMailbox(root, () => clock);
	mailbox.putInbox({ id: "one", type: "TUNNEL_REQUEST" });
	assert.equal(mailbox.snapshot().inbox.unownedCount, 0);
	mailbox.noteDeliveryAttempt("one");
	clock += 31000;
	let snapshot = mailbox.snapshot();
	assert.equal(snapshot.inbox.unownedCount, 1);
	assert.equal(snapshot.inbox.unownedOldestAgeMs, 31000);
	mailbox.noteDeliveryAttempt("one");
	assert.equal(mailbox.snapshot().inbox.unownedOldestAgeMs, 31000);
	mailbox.noteParentCustody("one");
	snapshot = mailbox.snapshot();
	assert.equal(snapshot.inbox.unownedCount, 0);
	assert.equal(snapshot.inbox.parentCustodyCount, 1);
	mailbox.acknowledge("one");
	assert.equal(mailbox.snapshot().inbox.parentCustodyCount, 0);
	assert.equal(mailbox.inbox().length, 0);
	fs.rmSync(root, { recursive: true, force: true });
});

test("degraded inbox receives grace only from exact running custody", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "mailbox-custody-"));
	const mailbox = createOhrMailbox(root);
	for (const id of ["one", "two"]) {
		mailbox.putInbox({ id, type: "TUNNEL_REQUEST" });
		mailbox.noteParentCustody(id);
		mailbox.noteCustodyProgress(id, { phase: "running" });
	}
	const snapshot = forceDegraded(mailbox.snapshot());
	const result = Health.compose({
		activeWs: { opened: true },
		registrationConfirmed: true
	}, {
		healthy: true,
		execution: { healthy: true, stages: {} }
	}, snapshot);
	assert.equal(snapshot.inbox.currentIncarnationCount, 2);
	assert.equal(snapshot.inbox.ambiguousRecordCount, 0);
	assert.equal(snapshot.inbox.parentCustodyCount, 2);
	assert.equal(result.healthy, true);
	assert.equal(result.mailbox.activeExecutionGrace, true);
	fs.rmSync(root, { recursive: true, force: true });
});

function createOhrMailbox(root, now = Date.now) {
	return Mailbox.createMailbox(
		{ deviceStateRoot: root },
		{ childIncarnationId: CHILD_INCARNATION_ID, now }
	);
}

function forceDegraded(mailbox) {
	return {
		...mailbox,
		health: { healthy: false, state: "degraded" },
		inbox: { ...mailbox.inbox, state: "degraded" },
		outbox: { ...mailbox.outbox, state: "healthy" }
	};
}
