// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Proves live exact quarantine cannot erase valid unresolved mailbox testimony.
 * @description
 * The Awtsmoos preserves a deed through acceptance, restart, and forgotten living maps;
 * Awtsmoos.com never turns missing memory or old generation into permission for collapse.
 * Terminal results and unresolved inbox truth remain until stronger durable retirement overlaps.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-quarantine-safety-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-quarantine-safety"
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const mailbox = Mailbox.createMailbox(config);

	mailbox.putInbox({ id: "fresh-inbox", action: "read" });
	assertPreserved(mailbox.quarantineExact("fresh-inbox", "manual"), true, false);
	assert.equal(mailbox.inbox().some(item => item.id === "fresh-inbox"), true);

	mailbox.putInbox({ id: "accepted-current", action: "write" });
	mailbox.noteParentCustody("accepted-current", {
		requestId: "client-current",
		generation: 7
	});
	assertPreserved(mailbox.quarantineExact("accepted-current", "manual"), true, false);

	mailbox.putInbox({ id: "accepted-generation-zero", action: "write" });
	mailbox.noteParentCustody("accepted-generation-zero", {
		requestId: "client-zero",
		generation: 0
	});
	assertPreserved(mailbox.quarantineExact("accepted-generation-zero", "ancient"), true, false);

	mailbox.putInbox({ id: "terminal-debt", action: "read" });
	mailbox.putOutbox({ id: "terminal-debt", ok: true });
	const terminal = mailbox.quarantineExact("terminal-debt", "manual");
	assertPreserved(terminal, true, true);
	assert.equal(mailbox.outboxOne("terminal-debt").ok, true);

	mailbox.putInbox({ id: "restart-ambiguity", action: "write" });
	mailbox.noteParentCustody("restart-ambiguity", {
		requestId: "client-restart",
		generation: 6
	});
	const restarted = Mailbox.createMailbox(config);
	assert.equal(restarted.snapshot().inbox.parentCustodyCount, 0);
	const restartResult = restarted.quarantineExact("restart-ambiguity", "stale_after_restart");
	assertPreserved(restartResult, true, false);
	assert.equal(restarted.inbox().some(item => item.id === "restart-ambiguity"), true);

	const missing = restarted.quarantineExact("missing-record", "manual");
	assert.equal(missing.moved, false);
	assert.equal(missing.preserved, false);
	assert.equal(missing.safeToRedispatch, false);
	assert.equal(missing.reason, "mailbox_record_not_found");

	console.log(JSON.stringify({
		ok: true,
		suite: "mailbox-exact-quarantine-safety",
		restartAmbiguityPreserved: true,
		generationZeroPreserved: true,
		terminalDebtPreserved: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function assertPreserved(result, inbox, outbox) {
	assert.equal(result.moved, false);
	assert.equal(result.preserved, true);
	assert.equal(result.safeToRedispatch, false);
	assert.equal(result.reason, "durable_retirement_proof_required");
	assert.equal(result.evidence.inbox, inbox);
	assert.equal(result.evidence.outbox, outbox);
}
