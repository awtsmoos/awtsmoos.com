// B"H
/**
 * @file requestRetryReadRestartReplay.test.cjs
 * @description After restart, replay safe reads once while mutations and
 * commands remain coalesced until their exact durable outcome is reconciled.
 */
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
	const read = {
		action: "read",
		controlRequestId: "read-after-restart",
		path: "small.txt"
	};
	assert.equal(Registry.begin({ payload: read }).kind, "created");
	Registry.reset();
	const revivedRead = Registry.begin({ payload: read });
	assert.equal(revivedRead.kind, "created");
	assert.ok(revivedRead.record.redispatchedAfterRestartAt);
	assert.equal(revivedRead.record.hydratedAfterRestart, false);
	assert.equal(Registry.begin({ payload: read }).kind, "coalesced");

	const command = {
		action: "commandStart",
		controlRequestId: "command-after-restart",
		command: "echo B-H"
	};
	const firstCommand = Registry.begin({ payload: command });
	assert.equal(firstCommand.kind, "created");
	assert.equal(firstCommand.record.durable.replaySafe, false);
	Registry.reset();
	const recoveredCommand = Registry.begin({ payload: command });
	assert.equal(recoveredCommand.kind, "coalesced");
	assert.equal(recoveredCommand.record.durable.replaySafe, false);
	assert.equal(recoveredCommand.record.hydratedAfterRestart, true);
	assert.equal(recoveredCommand.record.redispatchedAfterRestartAt, undefined);
	assert.equal(Registry.begin({ payload: command }).kind, "coalesced");

	const write = {
		action: "write",
		controlRequestId: "write-after-restart",
		path: "proof.txt",
		content: "one\n"
	};
	assert.equal(Registry.begin({ payload: write }).kind, "created");
	Registry.reset();
	const recoveredWrite = Registry.begin({ payload: write });
	assert.equal(recoveredWrite.kind, "coalesced");
	assert.equal(recoveredWrite.record.durable.replaySafe, false);

	console.log(JSON.stringify({
		ok: true,
		suite: "request-retry-read-restart-replay",
		readRevivedOnce: true,
		commandReplayed: false,
		writeReplayed: false
	}, null, 2));
} finally {
	Registry.reset({ disk: true });
	fs.rmSync(sandbox, { recursive: true, force: true });
}
