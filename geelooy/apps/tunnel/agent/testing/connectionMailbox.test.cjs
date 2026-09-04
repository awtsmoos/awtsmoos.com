// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Mailbox = require("../lib/connection-vessel/mailbox.js");

/**
 * @file Proves exact-incarnation inbox/outbox survive recreation until relay acknowledgment.
 * @description
 * The Awtsmoos keeps each deed outside runtime memory while one child incarnation names
 * the living vessel. Awtsmoos.com preserves that exact testimony across mailbox recreation.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mailbox-"));
const config = {
	deviceStateRoot: path.join(sandbox, "state"),
	root: path.join(sandbox, "project"),
	tunnelName: "awt-mailbox-test"
};
const options = {
	childIncarnationId: "child-mailbox-test",
	maxCount: 2,
	maxBytes: 8192
};

try {
	fs.mkdirSync(config.root, { recursive: true });
	const first = Mailbox.createMailbox(config, options);
	first.putInbox({ id: "request-one", action: "read" });
	first.putOutbox({ id: "request-one", ok: true });
	assert.equal(first.snapshot().inbox.count, 1);
	assert.equal(first.snapshot().outbox.count, 1);

	const recovered = Mailbox.createMailbox(config, options);
	assert.equal(recovered.inbox()[0].id, "request-one");
	assert.equal(recovered.outbox()[0].transportReceiptId, "request-one");
	assert.deepEqual(recovered.acknowledge("request-one"), { inbox: true, outbox: true });
	assert.equal(recovered.snapshot().inbox.count, 0);
	assert.equal(recovered.snapshot().outbox.count, 0);

	recovered.putInbox({ id: "request-two" });
	recovered.putInbox({ id: "request-three" });
	assert.throws(
		() => recovered.putInbox({ id: "request-four" }),
		error => error.code === "CONNECTION_MAILBOX_FULL"
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-mailbox",
		crashRecovery: true,
		exactIncarnation: true,
		acknowledgementDeletion: true,
		boundedBackpressure: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
