//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const DosDB = require("../../DosDB/index.js");
const { listBoundedDatabaseKeys } = require("../projectHosting/ProjectDatabaseBoundedKeys.js");

/**
 * @file projectDatabaseBoundedKeys.test.js
 * @description Proves hosted project key limits are enforced at the DosDB metadata
 * reader instead of materializing a full collection and slicing it afterward.
 */

test("DosDB bounded listing does not call full getObjectKeys", async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-db-bound-"));
	const database = new DosDB(directory);
	for (let index = 0; index < 14; index++) {
		await database.setObjectKey("items", `key-${index}`, { index });
	}
	database.getObjectKeys = async () => {
		throw new Error("full listing must not execute");
	};
	const page = await listBoundedDatabaseKeys(database, "items", 5);
	assert.deepEqual(page.keys, ["key-0", "key-1", "key-2", "key-3", "key-4"]);
	assert.equal(page.total, 14);
	assert.equal(page.truncated, true);
	assert.equal(page.nextOffset, 5);
	assert.equal(page.previousOffset, null);
	assert.equal(page.storageBounded, true);
	fs.rmSync(directory, { recursive: true, force: true });
});


test("DosDB bounded listing jumps directly to later metadata windows", async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-db-page-"));
	const database = new DosDB(directory);
	for (let index = 0; index < 14; index++) await database.setObjectKey("items", `key-${index}`, { index });
	database.getObjectKeys = async () => { throw new Error("full listing must not execute"); };
	const page = await listBoundedDatabaseKeys(database, "items", 5, 5);
	assert.deepEqual(page.keys, ["key-5", "key-6", "key-7", "key-8", "key-9"]);
	assert.equal(page.offset, 5);
	assert.equal(page.nextOffset, 10);
	assert.equal(page.previousOffset, 0);
	assert.equal(page.storageBounded, true);
	fs.rmSync(directory, { recursive: true, force: true });
});
test("generic compatible databases retain bounded response fallback", async () => {
	const database = {
		getObjectKeys: async () => ["a", "b", "c", "d"]
	};
	const page = await listBoundedDatabaseKeys(database, "items", 2);
	assert.deepEqual(page.keys, ["a", "b"]);
	assert.equal(page.total, 4);
	assert.equal(page.truncated, true);
	assert.equal(page.storageBounded, false);
});
