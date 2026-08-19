// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mailbox = require("../../../lib/connection-vessel/mailbox.js");
const Paths = require("../../../lib/connection-vessel/mailbox-paths.js");
const { buildConnectionMailboxActions } = require("../actionGroups/connectionMailboxActions.js");

/**
 * @file Proves connected mailbox recovery stays observable, redacted, and deliberately non-destructive.
 * @description
 * The Awtsmoos preserves each receipt as testimony while Awtsmoos.com opens only the requested pane;
 * invalid parchment may be quarantined with consent, but a valid stalled witness remains in its lane.
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
		mailbox.putInbox({ id: "valid-stalled", action: "read", secret: "hidden" });
		const status = await invoke("connectionMailboxStatus");
		assert.equal(status.ok, true);
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

		const corrupt = path.join(Paths.lane(config, "outbox"), "broken.json");
		fs.mkdirSync(path.dirname(corrupt), { recursive: true });
		fs.writeFileSync(corrupt, "not-json");
		const guarded = await invoke("connectionMailboxQuarantine");
		assert.equal(guarded.error, "confirmation_required");
		assert.equal(fs.existsSync(corrupt), true);
		const quarantined = await invoke("connectionMailboxQuarantine", { confirm: true });
		assert.equal(quarantined.ok, true);
		assert.equal(quarantined.quarantined.outbox.length, 1);
		assert.equal(fs.existsSync(corrupt), false);
		assert.equal(Mailbox.createMailbox(config).inbox()[0].id, "valid-stalled");

		console.log(JSON.stringify({
			ok: true,
			suite: "connection-mailbox-actions",
			liveReceiptsPreserved: true
		}, null, 2));
	} finally {
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
