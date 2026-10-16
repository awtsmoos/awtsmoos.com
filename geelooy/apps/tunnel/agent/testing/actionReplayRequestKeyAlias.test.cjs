//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/** Proves documented requestKey resolves through the canonical durable replay lane. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Replay = require("../tools/fs/actionReplayIdentity.js");
const Guard = require("../tools/fs/actionReplayGuard.js");
const Write = require("../tools/fs/readWrite.js");

const base = { action: "write", path: "sample.txt", content: 'B"H once\n', requestKey: "request-key-fixture" };

test("requestKey is a first-class canonical mutation identity alias", () => {
	const identity = Replay.describe(base);
	assert.equal(identity.key, base.requestKey);
	assert.equal(identity.fingerprint, Replay.describe({ ...base, controlRequestId: base.requestKey }).fingerprint);
	assert.notEqual(identity.fingerprint, Replay.describe({ ...base, content: "changed" }).fingerprint);
	assert.equal(Replay.canonicalKey({ ...base, idempotencyKey: "priority-key" }), "priority-key");
});

test("same requestKey replays a write; changed content conflicts without re-execution", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-requestkey-replay-"));
	const config = { root, deviceStateRoot: path.join(root, ".device-state"), allowWrite: true, tools: { fsWrite: true } };
	let executions = 0;
	const produce = async () => {
		executions += 1;
		return Write.writeText(config, base.path, base.content);
	};
	try {
		const first = await Guard.run(config, base, produce);
		const second = await Guard.run(config, base, produce);
		assert.equal(first.ok, true);
		assert.equal(second.replayed, true);
		assert.equal(executions, 1);
		const conflicting = await Guard.run(config, { ...base, content: "different" }, produce);
		assert.equal(conflicting.error, "control_request_id_conflict");
		assert.equal(executions, 1);
	} finally {
		Guard.resetForTests();
		await fs.rm(root, { recursive: true, force: true });
	}
});
