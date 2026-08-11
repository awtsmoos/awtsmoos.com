// B"H
// Boruch Hashem
// Blessed is He
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Record = require("./durableRecord.js");
const Recovery = require("./durablePendingRecovery.js");
const State = require("./state.js");
const Store = require("./durableStore.js");
/**
 * @file Proves restart hydration restores the original absolute request timeout.
 * @description The Awtsmoos lets durable memory survive a process without granting
 * eternity to unfinished work; Awtsmoos.com expires only a still-pending witness
 * and preserves whichever terminal truth wins the serialized key first.
 */
test("overdue durable phases become terminal on restart hydration", async t => {
	const context = fixture(t);
	const reserved = await seedOldPending(context, "reserved", expectation("reserved", 50));
	let record = await State.hydrate(restarted(context), "reserved", reserved.expected);
	assertExpired(record);
	assert.equal((await Store.read(context, reserved.key)).state, "expired");
	const progress = await seedOldPending(context, "progress", expectation("progress", 50));
	await State.rememberAccepted(context, "progress", progress.expected, { acceptedAt: new Date().toISOString() });
	await State.rememberProgress(context, "progress", progress.expected, {
		progressAt: new Date().toISOString(),
		progressPhase: "worker_running"
	});
	record = await State.hydrate(restarted(context), "progress", progress.expected);
	assertExpired(record);
	assert.equal(record.phase, "expired");
	assert.equal((await State.hydrate(restarted(context), "progress", progress.expected)).state, "expired");
});
test("fresh and malformed pending testimony remains nonterminal", async t => {
	const context = fixture(t);
	const freshExpected = expectation("fresh", 60000);
	await State.claim(context, "fresh", freshExpected);
	assert.equal((await State.hydrate(restarted(context), "fresh", freshExpected)).state, "pending");
	const malformed = await State.claim(context, "malformed", expectation("malformed", 50));
	const broken = { ...malformed.record, createdAt: "not-a-date" };
	await Store.replace(context, malformed.key, broken);
	assert.equal((await State.hydrate(restarted(context), "malformed", broken.expected)).state, "pending");
});
test("cached pending testimony is rechecked after its deadline", async t => {
	const context = fixture(t);
	const expected = expectation("cached", 60000);
	await State.claim(context, "cached", expected);
	assert.equal((await State.hydrate(context, "cached", expected)).state, "pending");
	const actualNow = Date.now;
	Date.now = () => actualNow() + expected.timeoutMs + 1000;
	try {
		assertExpired(await State.hydrate(context, "cached", expected));
	} finally {
		Date.now = actualNow;
	}
});
test("existing terminal truth is never rewritten by hydration expiry", async t => {
	const context = fixture(t);
	for (const [id, kind] of [["completed", "completed"], ["failed", "failed"], ["expired", "expired"]]) {
		const seeded = await seedOldPending(context, id, expectation(id, 50));
		if (kind === "expired") {
			await State.rememberExpired(context, id, { ok: false, error: "fixture_expired" }, seeded.expected);
		} else {
			await State.rememberCompleted(context, id, { ok: kind === "completed", marker: kind }, seeded.expected);
		}
		const before = await Store.read(context, seeded.key);
		const after = await State.hydrate(restarted(context), id, seeded.expected);
		assert.deepEqual(after, before);
	}
});
test("completion queued first wins over recovered expiry", async t => {
	const context = fixture(t);
	const seeded = await seedOldPending(context, "race", expectation("race", 50));
	const completion = State.mutate(context, seeded.key, async () => {
		const current = await Store.read(context, seeded.key);
		return await Store.replace(context, seeded.key, Record.completed(current, {
			ok: true,
			marker: "completion_won"
		}));
	});
	const recovery = Recovery.reconcile(context, seeded.key, "race", seeded.record, Date.now());
	await completion;
	const record = await recovery;
	assert.equal(record.state, "completed");
	assert.equal(record.data.marker, "completion_won");
});
async function seedOldPending(context, id, expected) {
	const claimed = await State.claim(context, id, expected);
	const createdAt = new Date(Date.now() - expected.timeoutMs - 1000).toISOString();
	const record = await Store.replace(context, claimed.key, { ...claimed.record, createdAt, updatedAt: createdAt });
	return { expected, key: claimed.key, record };
}
function expectation(id, timeoutMs) {
	return { id, registrationKey: "account::tunnel", requestedAction: "stat", timeoutMs, tunnelName: "awt-test" };
}
function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-pending-restart-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	return { tunnelRelayStateRoot: root };
}
function restarted(context) {
	return { tunnelRelayStateRoot: context.tunnelRelayStateRoot };
}
function assertExpired(record) {
	assert.equal(record.state, "expired");
	assert.equal(record.data.error, "tunnel_request_expired");
	assert.equal(record.data.terminal, true);
	assert.equal(record.data.retryable, false);
}
