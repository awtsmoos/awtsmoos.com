// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-retry-read-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(sandbox, "install");
process.env.AWTSMOOS_RETRY_RECEIPT_DIR = path.join(sandbox, "receipts");
const Registry = require("../lib/runtime/request-retry-registry.js");

try {
	Registry.reset({ disk: true });
	const payload = {
		action: "read",
		controlRequestId: "read-after-restart",
		path: "small.txt"
	};
	assert.equal(Registry.begin({ payload }).kind, "created");
	Registry.reset();
	const revived = Registry.begin({ payload });
	assert.equal(revived.kind, "created");
	assert.ok(revived.record.redispatchedAfterRestartAt);
	assert.equal(revived.record.hydratedAfterRestart, false);
	assert.equal(Registry.begin({ payload }).kind, "coalesced");

	const command = {
		action: "commandStart",
		controlRequestId: "command-after-restart",
		command: "echo B-H"
	};
	assert.equal(Registry.begin({ payload: command }).kind, "created");
	Registry.reset();
	assert.equal(Registry.begin({ payload: command }).kind, "created");

	const write = {
		action: "write",
		controlRequestId: "write-after-restart",
		path: "proof.txt",
		content: "one\n"
	};
	assert.equal(Registry.begin({ payload: write }).kind, "created");
	Registry.reset();
	assert.equal(Registry.begin({ payload: write }).kind, "coalesced");

	console.log(JSON.stringify({
		ok: true,
		suite: "request-retry-read-restart-replay",
		readRevivedOnce: true,
		asyncCommandRevivedOnce: true,
		writeNeverReplayed: true
	}, null, 2));
} finally {
	Registry.reset({ disk: true });
	fs.rmSync(sandbox, { recursive: true, force: true });
}
