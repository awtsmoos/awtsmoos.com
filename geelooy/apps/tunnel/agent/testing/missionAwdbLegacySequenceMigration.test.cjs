// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Open = require("../tools/fs/awdb/open.js");
const Store = require("../tools/fs/mission/awdbStore.js");

/**
 * @file Proves a sequence-shaped legacy mission collection migrates before fresh mission writes.
 * @description
 * The Awtsmoos preserves the elder mission while a new one enters the repaired vessel;
 * Awtsmoos.com imports byId and order without asking DosDB to forget its stable-anchor sentinel.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mission-legacy-sequence-"));
const previous = process.env.AWTSMOOS_MISSION_AWDB;
const config = { root, repoRoot: process.cwd() };
const legacy = { id: "legacy-one", goal: "legacy mission", createdAt: "2026-01-01T00:00:00.000Z" };
const fresh = { id: "fresh-one", goal: "fresh mission", createdAt: "2026-08-20T00:00:00.000Z", updatedAt: "2026-08-20T00:00:00.000Z" };

try {
	process.env.AWTSMOOS_MISSION_AWDB = "1";
	Open.withDb(config, "missions", database => {
		database.root.missions = [legacy];
	});
	const saved = Store.save(config, fresh);
	assert.equal(saved.ok, true);
	assert.ok(saved.legacyImported.includes(legacy.id));
	assert.equal(Store.load(config, legacy.id).goal, legacy.goal);
	assert.equal(Store.load(config, fresh.id).goal, fresh.goal);
	const ids = Store.all(config).map(mission => mission.id).sort();
	assert.deepEqual(ids, [fresh.id, legacy.id].sort());
	const savedAgain = Store.save(config, fresh);
	assert.equal(savedAgain.ok, true);
	assert.deepEqual(savedAgain.legacyImported, []);
	console.log(JSON.stringify({ ok: true, suite: "mission-awdb-legacy-sequence-migration", ids }, null, 2));
} finally {
	if (previous === undefined) delete process.env.AWTSMOOS_MISSION_AWDB;
	else process.env.AWTSMOOS_MISSION_AWDB = previous;
	fs.rmSync(root, { recursive: true, force: true });
}
