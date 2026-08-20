// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Mailbox = require("../lib/connection-vessel/mailbox.js");
const Reset = require("../lib/connection-vessel/mailbox-startup-reset.js");

/**
 * @file Proves restart archives every old mailbox record and exposes empty active lanes.
 * @description
 * The Awtsmoos keeps yesterday's witness without letting it inhabit today's vessel.
 * Awtsmoos.com moves both directions of stale custody into history before the new
 * controller can route a single deed, making restart a clean and testable boundary.
 */
test("startup archives all old mailbox evidence and recreates empty active lanes", () => {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-reset-"));
	const config = createConfig(sandbox);

	try {
		fs.mkdirSync(config.root, { recursive: true });
		const oldMailbox = Mailbox.createMailbox(config);
		oldMailbox.putInbox({ id: "old-request", action: "read" });
		oldMailbox.putOutbox({ id: "old-request", ok: true });

		const result = Reset.prepare(config, {
			now: () => 123456789,
			reason: "test_restart",
			token: () => "fixed"
		});
		const freshMailbox = Mailbox.createMailbox(config);
		const snapshot = freshMailbox.snapshot();

		assert.equal(result.archived, true);
		assert.equal(result.clearedFiles, 2);
		assert.equal(snapshot.inbox.count, 0);
		assert.equal(snapshot.outbox.count, 0);
		assert.equal(fs.existsSync(result.archivePath), true);
		assert.equal(countJson(path.join(result.archivePath, "inbox")), 1);
		assert.equal(countJson(path.join(result.archivePath, "outbox")), 1);
		const manifest = JSON.parse(
			fs.readFileSync(path.join(result.archivePath, "recovery-manifest.json"), "utf8")
		);
		assert.equal(manifest.reason, "test_restart");
		assert.equal(manifest.files, 2);

		const second = Reset.prepare(config, { reason: "empty_restart" });
		assert.equal(second.archived, false);
		assert.equal(Mailbox.createMailbox(config).snapshot().inbox.count, 0);
	} finally {
		fs.rmSync(sandbox, { force: true, recursive: true });
	}
});

function createConfig(sandbox) {
	return {
		deviceStateRoot: path.join(sandbox, "state"),
		root: path.join(sandbox, "project"),
		tunnelName: "awt-mailbox-reset-test"
	};
}

function countJson(directory) {
	return fs.readdirSync(directory)
		.filter(name => name.endsWith(".json"))
		.length;
}
