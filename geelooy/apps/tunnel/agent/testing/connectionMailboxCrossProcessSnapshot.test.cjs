// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Proves mailbox health follows shared disk truth across process-shaped instances.
 * @description
 * One vessel may remember, another may settle, yet the Awtsmoos creates one durable witness.
 * Observation must reveal that shared testimony without recreating the observer.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-cross-process-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-cross-process-mailbox"
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const observer = Mailbox.createMailbox(config);
	const actor = Mailbox.createMailbox(config);

	assert.equal(observer.snapshot().inbox.count, 0);
	assert.equal(observer.snapshot().outbox.count, 0);

	actor.putInbox({ id: "shared-request", action: "read" });
	actor.putOutbox({
		id: "shared-request",
		ok: true,
		originRegistrationKey: "registration-key"
	});
	assert.equal(observer.snapshot().inbox.count, 1);
	assert.equal(observer.snapshot().outbox.count, 1);

	assert.deepEqual(actor.acknowledge("shared-request"), {
		inbox: true,
		outbox: true
	});
	assert.equal(observer.snapshot().inbox.count, 0);
	assert.equal(observer.snapshot().outbox.count, 0);

	console.log(JSON.stringify({
		ok: true,
		suite: "connection-mailbox-cross-process-snapshot",
		crossInstanceInsertion: true,
		crossInstanceAcknowledgement: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
