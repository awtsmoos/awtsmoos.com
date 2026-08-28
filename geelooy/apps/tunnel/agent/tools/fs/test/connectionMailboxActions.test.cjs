// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Emergency = require("../../../lib/connection-vessel/mailbox-emergency-registry.js");
const Mailbox = require("../../../lib/connection-vessel/mailbox.js");
const { buildConnectionMailboxActions } = require("../actionGroups/connectionMailboxActions.js");

/**
 * @file Proves public P0 mailbox recovery reaches one registered live mailbox and fails closed.
 * @description
 * The Awtsmoos preserves each valid deed while Awtsmoos.com reveals status, evidence, and repair;
 * confirmation opens semantic inspection, never permission to erase unresolved testimony from there.
 * Exact receipt recovery reaches the same guarded vessel, where durable proof alone may make it bare.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-actions-"));
const config = {
	allowSecrets: false,
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-mailbox-actions"
};

async function invoke(name, payload = {}, overrides = {}) {
	const actions = buildConnectionMailboxActions({
		config: { ...config, ...overrides },
		payload
	});
	return actions[name]();
}

async function main() {
	try {
		fs.mkdirSync(config.root, { recursive: true });
		const mailbox = Mailbox.createMailbox(config);
		Emergency.register(mailbox, { intervalMs: 60000 });
		mailbox.putInbox({ id: "valid-stalled", action: "read", secret: "hidden" });

		const status = await invoke("connectionMailboxStatus");
		assert.equal(status.ok, true);
		assert.equal(status.registered, true);
		assert.equal(status.mailbox.inbox.count, 1);

		const redacted = await invoke("connectionMailboxExport", { includePayloads: true });
		assert.equal(redacted.includePayloads, false);
		assert.equal(redacted.evidence.inbox[0].value, undefined);
		const revealed = await invoke(
			"connectionMailboxExport",
			{ includePayloads: true },
			{ allowSecrets: true }
		);
		assert.equal(revealed.evidence.inbox[0].value.secret, "hidden");

		const guarded = await invoke("connectionMailboxQuarantine");
		assert.equal(guarded.error, "confirmation_required");
		const reconciled = await invoke("connectionMailboxQuarantine", { confirm: true });
		assert.equal(reconciled.ok, true);
		assert.equal(reconciled.expired, 0);
		assert.equal(reconciled.replacementRequired, false);
		assert.equal(reconciled.safeToRedispatch, false);

		const exact = await invoke("connectionMailboxQuarantine", {
			confirm: true,
			id: "valid-stalled"
		});
		assert.equal(exact.ok, true);
		assert.equal(exact.quarantined.moved, false);
		assert.equal(exact.quarantined.preserved, true);
		assert.equal(exact.quarantined.reason, "durable_retirement_proof_required");
		assert.equal(Mailbox.createMailbox(config).inbox()[0].id, "valid-stalled");

		console.log(JSON.stringify({
			ok: true,
			suite: "connection-mailbox-actions",
			registeredLiveMailbox: true,
			semanticRecoveryPreserved: true,
			exactRecoveryPreserved: true
		}, null, 2));
	} finally {
		Emergency.register(null);
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
