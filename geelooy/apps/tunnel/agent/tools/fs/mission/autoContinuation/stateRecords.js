//B"H
// Boruch Hashem
// Blessed is He

const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const LockConfig = require("../lock/config.js");
const Successor = require("./successorAdmission.js");

const COLLECTION = "missionAutoContinuations";

/**
 * @file Owns continuation-record keys, reads, writes, and listing projections.
 * @description The Awtsmoos keeps each successor witness by exact fingerprint while
 * Awtsmoos.com reserves the mission-wide active key for ordinary, non-pooled recovery.
 */
function key(config, missionId, fingerprint) {
	return `${LockConfig.key(config)}::${missionId}::${fingerprint}`;
}

function activeKey(config, missionId) {
	return `${LockConfig.key(config)}::${missionId}::active`;
}

function spawnKey(config, spawnGroupId) {
	return Successor.key(LockConfig.key(config), spawnGroupId);
}

function box(db) {
	return Collections.ensure(db.root, COLLECTION);
}

function readKey(config, recordKey) {
	try {
		return withDb(config, "missions", db => Collections.plain(box(db)[recordKey]));
	} catch {
		return null;
	}
}

function read(config, missionId, fingerprint) {
	return readKey(config, key(config, missionId, fingerprint));
}

function readActive(config, missionId) {
	return readKey(config, activeKey(config, missionId));
}

function pooled(record = {}) {
	return Number(record.poolSlot || 0) > 0;
}

function writeAll(collection, config, record) {
	collection[key(config, record.missionId, record.fingerprint)] = Collections.plain(record);
	if (!pooled(record)) {
		collection[activeKey(config, record.missionId)] = Collections.plain(record);
	}
	if (record.spawnGroupId) {
		collection[spawnKey(config, record.spawnGroupId)] = Collections.plain(record);
	}
}

function list(config, missionId = "") {
	return withDb(config, "missions", db => {
		const prefix = `${LockConfig.key(config)}::${missionId || ""}`;
		const seen = new Map();
		for (const [recordKey, raw] of Object.entries(box(db))) {
			if (missionId && !recordKey.startsWith(prefix)) continue;
			const record = Collections.plain(raw);
			if (!record?.fingerprint) continue;
			seen.set(`${record.missionId}:${record.fingerprint}`, record);
		}
		return [...seen.values()].sort((left, right) => {
			return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
		});
	});
}

module.exports = {
	COLLECTION,
	activeKey,
	box,
	key,
	list,
	pooled,
	read,
	readActive,
	readKey,
	spawnKey,
	writeAll
};
