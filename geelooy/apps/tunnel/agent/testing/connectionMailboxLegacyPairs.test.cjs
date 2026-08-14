// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Legacy = require("../lib/connection-vessel/mailbox-legacy.js");
const LegacyIO = require("../lib/connection-vessel/mailbox-legacy-io.js");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Proves historical exact pairs move reversibly while current and ambiguous testimony remains active.
 * @description The Awtsmoos retires only paired old witness; Awtsmoos.com leaves every living or one-sided deed untouched.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-legacy-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-mailbox-legacy"
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const mailbox = Mailbox.createMailbox(config);
	mailbox.putInbox({ id: "legacy-pair", action: "read" });
	mailbox.putOutbox({
		id: "legacy-pair",
		type: "TUNNEL_RESPONSE",
		transportReceiptId: "legacy-pair",
		ok: true
	});
	mailbox.putInbox({ id: "current-pair", action: "read" });
	mailbox.putOutbox({
		id: "current-pair",
		type: "TUNNEL_RESPONSE",
		transportReceiptId: "current-pair",
		originRegistrationKey: "registration-live",
		ok: true
	});
	mailbox.putInbox({ id: "inbox-only", action: "command" });
	const future = Date.now() + 2 * 60 * 60 * 1000;
	const plan = Legacy.plan(mailbox.evidence(true), { now: future, minAgeMs: 60000 });
	assert.deepEqual(plan.candidates.map(item => item.id), ["legacy-pair"]);
	assert.ok(mailbox.inbox().some(item => item.id === "legacy-pair"));
	const applied = LegacyIO.apply(config, plan, { now: future });
	assert.equal(applied.moved, 1);
	const remaining = Mailbox.createMailbox(config).evidence(true);
	assert.equal(remaining.inbox.some(item => item.id === "legacy-pair"), false);
	assert.equal(remaining.outbox.some(item => item.id === "legacy-pair"), false);
	assert.equal(remaining.inbox.some(item => item.id === "current-pair"), true);
	assert.equal(remaining.outbox.some(item => item.id === "current-pair"), true);
	assert.equal(remaining.inbox.some(item => item.id === "inbox-only"), true);
	const manifest = JSON.parse(fs.readFileSync(applied.manifest, "utf8"));
	assert.equal(manifest.state, "applied");
	assert.deepEqual(manifest.applied, ["legacy-pair"]);
	assert.match(manifest.pairs[0].inbox.sha256, /^[0-9a-f]{64}$/);
	assert.match(manifest.pairs[0].outbox.sha256, /^[0-9a-f]{64}$/);
	assert.equal(fs.existsSync(manifest.pairs[0].inbox.target), true);
	assert.equal(fs.existsSync(manifest.pairs[0].outbox.target), true);
	console.log(JSON.stringify({ ok: true, suite: "connection-mailbox-legacy-pairs" }));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
