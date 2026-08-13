// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const Paths = require("../lib/connection-vessel/mailbox-paths.js");
const Quarantine = require("../lib/connection-vessel/mailbox-record-quarantine.js");

/**
 * @file Proves exact one-sided mailbox testimony can move without pretending ACK settlement.
 * @description The Awtsmoos preserves each finite record by lane, timestamp, and hash;
 * Awtsmoos.com leaves every unrelated witness where it was and rejects changed shadows.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-exact-record-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-mailbox-exact-record"
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const mailbox = Mailbox.createMailbox(config);
	mailbox.putOutbox({ id: "out-only", type: "TUNNEL_RESPONSE", ok: true });
	mailbox.putInbox({ id: "in-only", action: "stat" });
	mailbox.putInbox({ id: "keep-pair", action: "read" });
	mailbox.putOutbox({ id: "keep-pair", type: "TUNNEL_RESPONSE", ok: true });
	mailbox.putOutbox({ id: "hash-change", type: "TUNNEL_RESPONSE", ok: true });
	const evidence = mailbox.evidence(true);
	const outOnly = evidence.outbox.find(item => item.id === "out-only");
	const inOnly = evidence.inbox.find(item => item.id === "in-only");
	assert.throws(
		() => Quarantine.plan(config, [{ lane: "outbox", id: "out-only", updatedAt: "wrong" }]),
		error => error.message === "mailbox_record_changed"
	);
	const stale = Quarantine.plan(config, [{
		lane: "outbox",
		id: "hash-change",
		updatedAt: evidence.outbox.find(item => item.id === "hash-change").updatedAt
	}]);
	const staleFile = Paths.file(config, "outbox", "hash-change");
	const staleValue = JSON.parse(fs.readFileSync(staleFile, "utf8"));
	fs.writeFileSync(staleFile, `${JSON.stringify({ ...staleValue, changed: true }, null, 2)}\n`);
	assert.throws(
		() => Quarantine.apply(config, stale),
		error => error.message === "mailbox_record_hash_changed"
	);
	assert.equal(fs.existsSync(staleFile), true);
	const dummy = path.join(sandbox, "dummy.json");
	fs.writeFileSync(dummy, "{}\n");
	const symlink = Paths.file(config, "outbox", "symlink-record");
	fs.mkdirSync(path.dirname(symlink), { recursive: true });
	fs.symlinkSync(dummy, symlink);
	assert.throws(
		() => Quarantine.plan(config, [{ lane: "outbox", id: "symlink-record", updatedAt: "now" }]),
		error => error.message === "mailbox_record_not_regular"
	);
	const plan = Quarantine.plan(config, [
		{ lane: "outbox", id: "out-only", updatedAt: outOnly.updatedAt },
		{ lane: "inbox", id: "in-only", updatedAt: inOnly.updatedAt }
	]);
	assert.equal(plan.records.length, 2);
	for (const record of plan.records) assert.match(record.sha256, /^[0-9a-f]{64}$/);
	const applied = Quarantine.apply(config, plan, { now: Date.now() + 1000 });
	assert.equal(applied.moved, 2);
	const manifest = JSON.parse(fs.readFileSync(applied.manifest, "utf8"));
	assert.equal(manifest.state, "applied");
	assert.deepEqual(manifest.applied, ["outbox:out-only", "inbox:in-only"]);
	for (const record of manifest.records) {
		assert.equal(fs.existsSync(record.source), false);
		assert.equal(fs.existsSync(record.target), true);
		assert.equal(Quarantine.hash(record.target), record.sha256);
	}
	const remaining = Mailbox.createMailbox(config).evidence(true);
	assert.equal(remaining.inbox.some(item => item.id === "keep-pair"), true);
	assert.equal(remaining.outbox.some(item => item.id === "keep-pair"), true);
	assert.equal(remaining.outbox.some(item => item.id === "hash-change"), true);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-mailbox-exact-record-quarantine",
		acknowledged: false,
		replayed: false
	}));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
