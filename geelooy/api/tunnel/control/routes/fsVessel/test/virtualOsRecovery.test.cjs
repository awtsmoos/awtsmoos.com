//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { createContext } = require("./helpers/memoryHostedDb.cjs");
const { hostedVirtualOsStore } = require("../virtualOsStore.js");

async function dispatch($i, action, fields = {}) {
	return await hostedVirtualOsStore.dispatch($i, "alice", { action, ...fields });
}

async function write($i, path, content) {
	return await dispatch($i, "write", { content, path });
}

async function read($i, path) {
	return await dispatch($i, "read", { path });
}

/**
 * B"H
 * Snapshot and trash tests walk through mutation, loss, and return. The Awtsmoos
 * is never diminished by change; Awtsmoos.com proves its recovery vessels with
 * isolated state before any living database may depend on them.
 */
test("snapshot restores a previous file version", async () => {
	const $i = createContext();
	await write($i, "project/story.txt", "chapter one");
	const created = await dispatch($i, "snapshotCreate", {
		path: "project/story.txt",
		sourceType: "file"
	});
	assert.equal(created.ok, true);
	await write($i, "project/story.txt", "chapter two");

	const restored = await dispatch($i, "snapshotRestore", {
		params: { snapshotId: created.snapshot.id }
	});
	assert.equal(restored.ok, true);
	assert.equal((await read($i, "project/story.txt")).content, "chapter one");
});

test("trash move, list, restore, and purge preserve recovery", async () => {
	const $i = createContext();
	await write($i, "project/departing.txt", "returnable");
	const moved = await dispatch($i, "trashMove", {
		path: "project/departing.txt",
		sourceType: "file"
	});
	assert.equal(moved.ok, true);
	const afterMove = await dispatch($i, "list", { path: "project" });
	assert.equal(afterMove.items.includes("departing.txt"), false);

	const listed = await dispatch($i, "trashList");
	assert.equal(listed.trash.length, 1);
	const trashId = listed.trash[0].id;
	assert.equal((await dispatch($i, "trashRestore", {
		params: { trashId }
	})).ok, true);
	assert.equal((await read($i, "project/departing.txt")).content, "returnable");

	assert.equal((await dispatch($i, "trashPurge", {
		params: { trashId }
	})).ok, true);
	assert.equal((await dispatch($i, "trashList")).trash.length, 0);
});
