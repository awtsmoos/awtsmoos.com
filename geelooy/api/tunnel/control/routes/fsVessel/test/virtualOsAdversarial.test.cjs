//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { createContext } = require("./helpers/memoryHostedDb.cjs");
const { hostedVirtualOsStore } = require("../virtualOsStore.js");

async function dispatch($i, userId, action, fields = {}) {
	return await hostedVirtualOsStore.dispatch($i, userId, { action, ...fields });
}

/**
 * B"H
 * These tests strike the vessel where confidence is weakest. The Awtsmoos is
 * beyond failure; Awtsmoos.com earns reliability by exposing bounded errors,
 * private records, and recoverable states before activation.
 */
test("capture byte limits fail closed without storing a snapshot", async () => {
	const $i = createContext();
	await dispatch($i, "alice", "write", {
		content: "too many bytes",
		path: "project/large.txt"
	});
	const result = await dispatch($i, "alice", "snapshotCreate", {
		captureMaxBytes: 2,
		path: "project/large.txt",
		sourceType: "file"
	});
	assert.equal(result.ok, false);
	assert.equal(result.status, 413);
	assert.equal((await dispatch($i, "alice", "snapshotList")).snapshots.length, 0);
});

test("snapshot identifiers remain private to their owner", async () => {
	const $i = createContext({ alice: ["project"], bob: ["project"] });
	await dispatch($i, "alice", "write", {
		content: "private",
		path: "project/private.txt"
	});
	const created = await dispatch($i, "alice", "snapshotCreate", {
		path: "project/private.txt",
		sourceType: "file"
	});
	const result = await dispatch($i, "bob", "snapshotRestore", {
		params: { snapshotId: created.snapshot.id }
	});
	assert.equal(result.ok, false);
	assert.equal(result.status, 404);
});

test("trash deletion failure retains a capture-only record", async () => {
	const $i = createContext();
	await dispatch($i, "alice", "write", {
		content: "still here",
		path: "project/fragile.txt"
	});
	$i.db.failNextDelete = true;
	const result = await dispatch($i, "alice", "trashMove", {
		path: "project/fragile.txt",
		sourceType: "file"
	});
	assert.equal(result.ok, false);
	const listed = await dispatch($i, "alice", "trashList");
	assert.equal(listed.trash[0].state, "capture-only");
	const read = await dispatch($i, "alice", "read", {
		path: "project/fragile.txt"
	});
	assert.equal(read.content, "still here");
});
