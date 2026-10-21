// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Paths = require("./durablePaths.js");
const Record = require("./durableRecord.js");
const Store = require("./durableStore.js");
const Transitions = require("./stateTransitions.js");

const announced = [];
console.error = (...args) => { announced.push(args.join(" ")); };

/** Builds one isolated durable store root per test, removed afterwards. */
function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-relay-verify-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const id = "verify-one";
	const context = { tunnelRelayStateRoot: root };
	const expected = { id, registrationKey: "unscoped" };
	return { root, context, key: "unscoped:verify-one", id, expected };
}

/** Lists the forensic quarantine files a degradation left in the root. */
function quarantined(root) {
	return fs.readdirSync(root).filter(name => name.includes(".quarantine-"));
}

test("readback proof degrades when a racing writer wins the record path", async t => {
	const { root, context, key, id, expected } = fixture(t);
	const claimed = await Store.claim(context, key, id, expected);
	const winner = Record.dispatched(claimed.record, {
		dispatchedAt: "2026-10-21T03:47:23.000Z"
	});
	const winnerBytes = Store.serialize(winner);
	fs.writeFileSync(Paths.recordPath(context, key), winnerBytes);
	const before = announced.length;
	const settled = await Store.verifiedRead(context, key, Store.serialize(claimed.record));
	assert.equal(settled.phase, "dispatched");
	assert.equal(announced.length, before + 1);
	assert.match(announced.at(-1), /durable_relay_record_verification_failed/);
	const held = quarantined(root);
	assert.equal(held.length, 1);
	assert.deepEqual(fs.readFileSync(path.join(root, held[0])), winnerBytes);
	assert.deepEqual(fs.readFileSync(Paths.recordPath(context, key)), winnerBytes);
});

test("readback proof degrades when the record bytes are corrupt", async t => {
	const { root, context, key, id, expected } = fixture(t);
	const pending = Record.pending(key, id, expected);
	const garbage = Buffer.from("{\"version\":2,\"key\": torn write", "utf8");
	fs.writeFileSync(Paths.recordPath(context, key), garbage);
	const settled = await Store.verifiedRead(context, key, Store.serialize(pending));
	assert.equal(settled.state, "pending");
	assert.equal(settled.id, id);
	const held = quarantined(root);
	assert.equal(held.length, 1);
	assert.deepEqual(fs.readFileSync(path.join(root, held[0])), garbage);
	assert.equal(await Store.read(context, key), null);
});

test("readback proof degrades when the record vanished after commit", async t => {
	const { root, context, key, id, expected } = fixture(t);
	const pending = Record.pending(key, id, expected);
	const settled = await Store.verifiedRead(context, key, Store.serialize(pending));
	assert.equal(settled.state, "pending");
	assert.equal(quarantined(root).length, 0);
});

test("a displaced readback inside a serialized mutation resolves", async t => {
	const { root, context, key, id, expected } = fixture(t);
	const displaced = Record.progressed(Record.pending(key, id, expected), {
		progressAt: "2026-10-21T03:47:24.000Z",
		progressPhase: "worker_running",
		jobId: "job-race"
	});
	const target = Paths.recordPath(context, key);
	const realRead = fsp.readFile;
	let reads = 0;
	fsp.readFile = async (file, ...rest) => {
		if (String(file) === target && ++reads === 2) {
			return Store.serialize(displaced);
		}
		return realRead(file, ...rest);
	};
	let settled;
	try {
		settled = await Transitions.rememberDispatched(context, key, id, expected, {
			dispatchedAt: "2026-10-21T03:47:23.000Z"
		});
	} finally {
		fsp.readFile = realRead;
	}
	assert.equal(reads, 2);
	assert.equal(settled.jobId, "job-race");
	assert.equal(quarantined(root).length, 1);
});

test("ordinary commits verify cleanly, with no quarantine or announcement", async t => {
	const { root, context, key, id, expected } = fixture(t);
	const before = announced.length;
	await Store.claim(context, key, id, expected);
	await Transitions.rememberDispatched(context, key, id, expected, {
		dispatchedAt: "2026-10-21T03:47:23.000Z"
	});
	const done = await Transitions.rememberTerminal(
		context, key, id, { ok: true, id }, expected, "completed"
	);
	assert.equal(done.state, "completed");
	const fresh = { tunnelRelayStateRoot: root };
	assert.equal((await Store.read(fresh, key)).state, "completed");
	assert.equal(quarantined(root).length, 0);
	assert.equal(announced.length, before);
});
