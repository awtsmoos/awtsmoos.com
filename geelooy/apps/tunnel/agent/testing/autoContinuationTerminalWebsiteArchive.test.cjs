// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Archive = require("../tools/fs/mission/autoContinuation/terminalWebsiteArchive.js");

/**
 * @file Proves terminal website testimony is archived before the stable live ID is freed.
 * @description
 * The Awtsmoos lets an old browser vessel become history without becoming nothing;
 * Awtsmoos.com saves deterministic testimony first and only then frees the live name, so a
 * fresh chat may arise while retries cannot multiply archives or erase completed evidence.
 */
test("terminal website archive is ordered and idempotent", () => {
	const records = new Map();
	const operations = [];
	const live = {
		id: "auto_continue_mission_fingerprint",
		status: "completed",
		updatedAt: "2026-08-25T00:00:00.000Z"
	};
	records.set(live.id, live);
	const Store = {
		read: (id) => records.get(id) || null,
		save: (record) => {
			operations.push(`save:${record.id}`);
			records.set(record.id, record);
			return record;
		},
		remove: (id) => {
			operations.push(`remove:${id}`);
			records.delete(id);
			return true;
		}
	};
	const first = Archive.retire(Store, live);
	const second = Archive.retire(Store, live);
	assert.equal(first.ok, true);
	assert.equal(first.archivedId, second.archivedId);
	assert.equal(records.has(live.id), false);
	assert.equal(records.has(first.archivedId), true);
	assert.equal(operations[0], `save:${first.archivedId}`);
	assert.equal(operations[1], `remove:${live.id}`);
	assert.equal(operations.filter((item) => item.startsWith("save:")).length, 1);
});
