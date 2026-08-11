// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const LockConfig = require("../lock/config.js");

const COLLECTION = "missionAutoContinuations";
const DEFAULT_LEASE_MS = 120000;
const BLOCKING = new Set(["dispatching", "accepted", "scheduled", "running", "recovered"]);

/**
 * @file Persists exact retry state plus one mission-wide continuation admission.
 * @description The Awtsmoos grants one unfinished mission one active summons;
 * Awtsmoos.com may remember many checkpoints, but only one may cross the browser threshold at once.
 */
function key(config, missionId, fingerprint) {
	return `${LockConfig.key(config)}::${missionId}::${fingerprint}`;
}

function activeKey(config, missionId) {
	return `${LockConfig.key(config)}::${missionId}::active`;
}

function read(config, missionId, fingerprint) {
	return readKey(config, key(config, missionId, fingerprint));
}

function readActive(config, missionId) {
	return readKey(config, activeKey(config, missionId));
}

function readKey(config, recordKey) {
	try {
		return withDb(config, "missions", db => Collections.plain(box(db)[recordKey]));
	} catch {
		return null;
	}
}

function acquire(config, identity, options = {}) {
	return withDb(config, "missions", db => {
		const collection = box(db);
		const exactKey = key(config, identity.missionId, identity.fingerprint);
		const current = Collections.plain(collection[exactKey]);
		const active = Collections.plain(collection[activeKey(config, identity.missionId)]);
		const now = Number(options.now || Date.now());
		if (active && active.fingerprint !== identity.fingerprint && blocking(active)) {
			return { ok: false, reason: "mission_continuation_active", record: active };
		}
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
		collection[exactKey] = Collections.plain(record);
		collection[activeKey(config, identity.missionId)] = Collections.plain(record);
		return { ok: true, record: Collections.plain(record) };
	});
}

function mark(config, record, status, details = {}) {
	return withDb(config, "missions", db => {
		const collection = box(db);
		const next = {
			...record,
			...details,
			status,
			leaseExpiresAt: null,
			updatedAt: new Date().toISOString()
		};
		collection[key(config, next.missionId, next.fingerprint)] = Collections.plain(next);
		const missionKey = activeKey(config, next.missionId);
		const active = Collections.plain(collection[missionKey]);
		if (!active || active.fingerprint === next.fingerprint) collection[missionKey] = Collections.plain(next);
		return Collections.plain(next);
	});
}

function settleActive(config, record, reason = "prior_continuation_terminal") {
	if (!record?.missionId) return null;
	return withDb(config, "missions", db => {
		const collection = box(db);
		const missionKey = activeKey(config, record.missionId);
		const active = Collections.plain(collection[missionKey]);
		if (!active || active.fingerprint !== record.fingerprint) return active || null;
		const settled = { ...active, status: "settled", settledReason: reason, settledAt: new Date().toISOString() };
		collection[missionKey] = Collections.plain(settled);
		return Collections.plain(settled);
	});
}

function blocking(record) {
	return BLOCKING.has(String(record?.status || "").toLowerCase());
}

function activeLease(record, now = Date.now()) {
	return Boolean(record?.leaseExpiresAt && Date.parse(record.leaseExpiresAt) > now);
}

function box(db) {
	return Collections.ensure(db.root, COLLECTION);
}

module.exports = { BLOCKING, COLLECTION, DEFAULT_LEASE_MS, acquire, activeKey, activeLease, blocking, key, mark, read, readActive, settleActive };
