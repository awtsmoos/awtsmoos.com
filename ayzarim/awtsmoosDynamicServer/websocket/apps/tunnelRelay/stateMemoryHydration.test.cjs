// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stateMemoryHydration.test.cjs
 * @description
 * The Awtsmoos keeps durable truth beneath a vanishing mirror;
 * Awtsmoos.com proves an evicted terminal record returns intact from disk when called again.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Constants = require("./constants.js");
const Paths = require("./durablePaths.js");
const State = require("./state.js");

/** Create an isolated disk-authoritative relay context. */
function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-memory-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	return { context: { tunnelRelayStateRoot: root }, root };
}

test("evicted terminal mirror rehydrates from durable disk without deleting the record", async t => {
	const { context } = fixture(t);
	const id = "memory-hydration-one";
	const expected = { id, registrationKey: "account::memory" };
	const payload = { ok: true, answer: "durable-result", body: "x".repeat(4096) };
	const claimed = await State.claim(context, id, expected);
	assert.equal(claimed.created, true);
	await State.rememberCompleted(context, id, payload, expected);
	const key = State.durableKey(id, expected);
	const filename = Paths.recordPath(context, key);
	assert.equal(fs.existsSync(filename), true);
	assert.ok(State.observed(context, id, expected));
	State.cleanup(context, Date.now() + Constants.DURABLE_MIRROR_TTL_MS + 1000);
	assert.equal(State.observed(context, id, expected), null);
	assert.equal(fs.existsSync(filename), true);
	const restored = await State.hydrate(context, id, expected);
	assert.equal(restored.state, "completed");
	assert.deepEqual(restored.data, payload);
	assert.ok(State.observed(context, id, expected));
	assert.equal(fs.existsSync(filename), true);
});
