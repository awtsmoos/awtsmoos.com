// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Proves durable result truth advances exact custody without erasing identity.
 * @description
 * The Awtsmoos carries one deed through running, result, acknowledgement, and release;
 * Awtsmoos.com preserves session and generation while sparse progress grants a new lease.
 * Only durable outbox truth becomes result debt, and relay acknowledgement brings release.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-custody-progress-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-custody-progress-test"
};
let now = 1000;

try {
	fs.mkdirSync(config.root, { recursive: true });
	const mailbox = Mailbox.createMailbox(config, {
		now: () => now,
		maxCount: 20,
		maxBytes: 65536
	});
	const identity = {
		requestId: "client-request-one",
		requestKey: "client-request-one",
		logicalAgentId: "agent-one",
		agentSessionId: "session-one",
		generation: 5
	};

	mailbox.putInbox({ id: "receipt-one", action: "read" });
	mailbox.noteParentCustody("receipt-one", identity);
	now = 2000;
	assert.equal(mailbox.noteCustodyProgress("receipt-one", {
		phase: "running",
		workerId: "worker-one"
	}), true);
	assertIdentity(record(mailbox), identity);
	assert.equal(record(mailbox).phase, "running");
	assert.equal(record(mailbox).workerId, "worker-one");

	now = 3000;
	mailbox.putOutbox({ id: "receipt-one", ok: true });
	const waiting = record(mailbox);
	assertIdentity(waiting, identity);
	assert.equal(waiting.phase, "result_waiting_for_ack");
	assert.equal(waiting.resultState, "result_waiting_for_ack");
	assert.equal(waiting.phaseStartedAt, 3000);
	assert.equal(waiting.leaseExpiresAt, 303000);
	assert.equal(mailbox.outboxOne("receipt-one").ok, true);

	assert.deepEqual(mailbox.acknowledge("receipt-one"), {
		inbox: true,
		outbox: true
	});
	assert.equal(mailbox.snapshot().inbox.parentCustodyCount, 0);
	assert.equal(mailbox.snapshot().inbox.count, 0);
	assert.equal(mailbox.snapshot().outbox.count, 0);

	mailbox.putOutbox({ id: "receipt-without-custody", ok: true });
	assert.equal(mailbox.outboxOne("receipt-without-custody").ok, true);
	assert.equal(mailbox.snapshot().inbox.parentCustodyCount, 0);
	assert.deepEqual(mailbox.acknowledge("receipt-without-custody"), {
		inbox: false,
		outbox: true
	});

	console.log(JSON.stringify({
		ok: true,
		suite: "connection-mailbox-custody-progress",
		identityPreserved: true,
		resultPhaseAfterDurability: true,
		acknowledgementSettles: true,
		orphanResultRemainsDurable: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function record(mailbox) {
	return mailbox.snapshot().inbox.parentCustodyRecords[0];
}

function assertIdentity(value, expected) {
	assert.equal(value.requestId, expected.requestId);
	assert.equal(value.requestKey, expected.requestKey);
	assert.equal(value.logicalAgentId, expected.logicalAgentId);
	assert.equal(value.agentSessionId, expected.agentSessionId);
	assert.equal(value.generation, expected.generation);
}
