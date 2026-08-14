// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Deferred = require("../tools/fs/mission/lock/deferredPersistence.js");
const Heartbeat = require("../tools/fs/mission/heartbeat/index.js");
const Nested = require("../tools/fs/mission/lock/nested.js");
const Persistence = require("../tools/fs/mission/lock/persistence.js");
const Store = require("../tools/fs/mission/lock/store.js");

/**
 * @file Proves lock, lineage, and heartbeat contention defer durably instead of killing control.
 * @description The Awtsmoos keeps one outer witness when the inner writer is occupied;
 * Awtsmoos.com later flushes it and still refuses to hide unknown database failure.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-persist-contention-"));
const config = {
	root: path.join(sandbox, "project"),
	deviceStateRoot: path.join(sandbox, "state"),
	tunnelName: "awt-contention-test"
};
const lock = { missionId: "mission-child", parentMissionId: "mission-parent", projectRoot: config.root };
const busy = new Error("B\"H: database already has an active exclusive writer: test.awdb.lock");
const unknown = new Error("synthetic database corruption");
const originals = {
	readResult: Store.readResult,
	trySet: Store.trySet,
	tryRemember: Nested.tryRemember,
	fromLock: Heartbeat.fromLock
};

try {
	assert.equal(Store.isWriterBusy(busy), true);
	Store.trySet = () => ({ ok: false, deferred: true, error: busy });
	let result = Persistence.persist(config, lock);
	assertDeferred(result, config, lock);

	Store.readResult = () => ({ ok: false, deferred: true, error: busy });
	assert.equal(Persistence.read(config).missionId, lock.missionId);

	Store.trySet = (_config, value) => ({ ok: true, value });
	Nested.tryRemember = () => ({ ok: true, value: {} });
	Heartbeat.fromLock = () => ({ ok: true });
	result = Persistence.persist(config, { ...lock, updatedAt: "later" });
	assert.equal(result.persisted, true);
	assert.equal(fs.existsSync(Deferred.pathFor(config)), false);

	Nested.tryRemember = () => ({ ok: false, deferred: true, error: busy });
	result = Persistence.persist(config, lock);
	assertDeferred(result, config, lock);
	Deferred.clear(config);

	Nested.tryRemember = () => ({ ok: true, value: {} });
	Heartbeat.fromLock = () => { throw busy; };
	result = Persistence.persist(config, lock);
	assertDeferred(result, config, lock);
	Deferred.clear(config);

	Store.trySet = () => { throw unknown; };
	assert.throws(() => Persistence.persist(config, lock), /synthetic database corruption/);
	Store.trySet = (_config, value) => ({ ok: true, value });
	Nested.tryRemember = () => { throw unknown; };
	assert.throws(() => Persistence.persist(config, lock), /synthetic database corruption/);
	Nested.tryRemember = () => ({ ok: true, value: {} });
	Heartbeat.fromLock = () => { throw unknown; };
	assert.throws(() => Persistence.persist(config, lock), /synthetic database corruption/);

	console.log(JSON.stringify({
		ok: true,
		suite: "mission-persistence-contention",
		lockDeferred: true,
		lineageDeferred: true,
		heartbeatDeferred: true,
		unknownErrorsThrow: true
	}));
} finally {
	Store.readResult = originals.readResult;
	Store.trySet = originals.trySet;
	Nested.tryRemember = originals.tryRemember;
	Heartbeat.fromLock = originals.fromLock;
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function assertDeferred(result, currentConfig, currentLock) {
	assert.equal(result.persisted, false);
	assert.equal(result.deferred, true);
	const target = Deferred.pathFor(currentConfig);
	assert.ok(fs.existsSync(target));
	assert.equal(Deferred.read(currentConfig).lock.missionId, currentLock.missionId);
	assert.equal(path.relative(currentConfig.root, target).startsWith(".."), true);
}
