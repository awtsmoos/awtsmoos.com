// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const State = require("./state.js");

/** Proves every phase survives memory loss and terminal truth remains final. */
test("relay phases persist across fresh contexts without terminal regression", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-phases-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const context = { tunnelRelayStateRoot: root };
	const id = "durable-phase-one";
	const expected = { id, registrationKey: "account::tunnel", requestedAction: "stat" };
	assert.equal((await State.claim(context, id, expected)).created, true);
	let record = await State.rememberDispatched(context, id, expected, {
		dispatchedAt: "2026-08-05T00:00:00.000Z", registrationGeneration: 4
	});
	assert.equal(record.phase, "dispatched");
	record = await State.rememberAccepted(context, id, expected, {
		acceptedAt: "2026-08-05T00:00:01.000Z", registrationGeneration: 4
	});
	assert.equal(record.phase, "device_accepted");
	record = await State.rememberProgress(context, id, expected, {
		progressAt: "2026-08-05T00:00:02.000Z", progressPhase: "worker_running",
		jobId: "job-one", workerId: "worker-one"
	});
	assert.equal(record.jobId, "job-one");
	const restarted = { tunnelRelayStateRoot: root };
	record = await State.hydrate(restarted, id, expected);
	assert.equal(record.progressPhase, "worker_running");
	await State.rememberCompleted(restarted, id, { ok: true, id }, expected);
	record = await State.rememberAccepted(restarted, id, expected, {
		acceptedAt: "2026-08-05T00:00:03.000Z"
	});
	assert.equal(record.state, "completed");
	assert.equal(record.data.ok, true);
});
