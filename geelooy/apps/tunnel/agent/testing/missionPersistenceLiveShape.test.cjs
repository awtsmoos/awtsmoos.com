// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Deferred = require("../tools/fs/mission/lock/deferredPersistence.js");
const Nested = require("../tools/fs/mission/lock/nested.js");
const Persistence = require("../tools/fs/mission/lock/persistence.js");
const Resume = require("../tools/fs/mission/boot/resume.js");

/**
 * @file Reproduces the real AWDB keyed collection and boot-loop contention paths.
 * @description The Awtsmoos proves lineage is idempotent without native array methods and
 * boot bookkeeping uses the durable deferred persistence covenant.
 */
test("lineage persists idempotently through a real keyed AWDB collection", t => {
	const fixture = createFixture(t);
	const parent = { missionId: "mission-parent" };
	const child = { missionId: "mission-child", parentMissionId: parent.missionId };
	assert.equal(Nested.remember(fixture.config, parent, child).childMissionId, child.missionId);
	assert.equal(Nested.remember(fixture.config, parent, child).childMissionId, child.missionId);
});

test("boot-loop persistence defers known writer contention outside AWDB", t => {
	const fixture = createFixture(t);
	const busy = new Error("database already has an active exclusive writer: test.awdb.lock");
	const original = Persistence.persist;
	t.after(() => { Persistence.persist = original; });
	Persistence.persist = (config, lock) => {
		Deferred.write(config, lock, busy);
		return { persisted: false, deferred: true, reason: busy.message };
	};
	const lock = Resume.markLoop(fixture.config, { missionId: "mission-live" }, {
		action: "missionBootResume",
		missionId: "mission-live"
	});
	assert.equal(lock.persistence.deferred, true);
	assert.equal(Deferred.read(fixture.config).lock.missionId, lock.missionId);
});

function createFixture(t) {
	const metadataRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-live-shape-"));
	t.after(() => fs.rmSync(metadataRoot, { recursive: true, force: true }));
	const repoRoot = path.resolve(__dirname, "../../../../..");
	return {
		config: {
			root: path.join(metadataRoot, "project"),
			repoRoot,
			sourceRoot: repoRoot,
			metadataRoot,
			deviceStateRoot: path.join(metadataRoot, "state"),
			tunnelName: "awt-live-shape"
		}
	};
}
