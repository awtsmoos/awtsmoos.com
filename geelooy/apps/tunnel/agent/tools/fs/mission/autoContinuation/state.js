// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const LockConfig = require("../lock/config.js");

const COLLECTION = "missionAutoContinuations";
const DEFAULT_LEASE_MS = 120000;

/**
 * @file Persists one atomic continuation lease beside the project mission lock.
 * @description
 * The Awtsmoos lets one checkpoint summon one messenger. Awtsmoos.com acquires
 * that right inside one AWDB transaction so two supervisors can never both own the same continuation.
 */
function key(config, missionId, fingerprint) {
	return `${LockConfig.key(config)}::${missionId}::${fingerprint}`;
}

function read(config, missionId, fingerprint) {
	try {
		return withDb(config, "missions", db => Collections.plain(
			box(db)[key(config, missionId, fingerprint)]
		));
	} catch {
		return null;
	}
}

function write(config, record) {
	return withDb(config, "missions", db => {
		box(db)[key(config, record.missionId, record.fingerprint)] = Collections.plain(record);
		return Collections.plain(record);
	});
}

function acquire(config, identity, options = {}) {
	return withDb(config, "missions", db => {
		const collection = box(db);
		const recordKey = key(config, identity.missionId, identity.fingerprint);
		const current = Collections.plain(collection[recordKey]);
		const now = Number(options.now || Date.now());
		if (current && activeLease(current, now) && current.owner !== options.owner) {
			return { ok: false, reason: "continuation_lease_held", record: current };
		}
		const owner = options.owner || `continuation_${process.pid}_${crypto.randomBytes(4).toString("hex")}`;
		const record = {
			...current,
			...identity,
			owner,
			status: "dispatching",
			attempts: Number(current?.attempts || 0) + 1,
			leaseExpiresAt: new Date(now + Number(options.leaseMs || DEFAULT_LEASE_MS)).toISOString(),
			lastAttemptAt: new Date(now).toISOString(),
			updatedAt: new Date(now).toISOString()
		};
		collection[recordKey] = Collections.plain(record);
		return { ok: true, record: Collections.plain(record) };
	});
}

function mark(config, record, status, details = {}) {
	return write(config, {
		...record,
		...details,
		status,
		leaseExpiresAt: null,
		updatedAt: new Date().toISOString()
	});
}

function activeLease(record, now = Date.now()) {
	return Boolean(record?.leaseExpiresAt && Date.parse(record.leaseExpiresAt) > now);
}

function box(db) {
	return Collections.ensure(db.root, COLLECTION);
}

module.exports = {
	COLLECTION,
	DEFAULT_LEASE_MS,
	acquire,
	activeLease,
	key,
	mark,
	read,
	write
};
