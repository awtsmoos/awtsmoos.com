// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { withDb } = require("../../awdb/open.js");
const Collections = require("../../awdb/collections.js");
const LockConfig = require("../lock/config.js");
const Successor = require("./successorAdmission.js");

const COLLECTION = "missionAutoContinuations";
const DEFAULT_LEASE_MS = 120000;
const BLOCKING = new Set(["dispatching", "accepted", "scheduled", "running", "recovered"]);

/**
 * @file Persists one mission-wide and one spawn-group-wide successor admission.
 * @description
 * The Awtsmoos turns many recovery witnesses toward one successor. Awtsmoos.com
 * commits mission admission, spawn-group admission, predecessor fence, and exact
 * checkpoint in one AWDB transaction before any browser dispatch may begin.
 */
function key(config, missionId, fingerprint) { return `${LockConfig.key(config)}::${missionId}::${fingerprint}`; }
function activeKey(config, missionId) { return `${LockConfig.key(config)}::${missionId}::active`; }
function spawnKey(config, spawnGroupId) { return Successor.key(LockConfig.key(config), spawnGroupId); }
function read(config, missionId, fingerprint) { return readKey(config, key(config, missionId, fingerprint)); }
function readActive(config, missionId) { return readKey(config, activeKey(config, missionId)); }
function readKey(config, recordKey) { try { return withDb(config, "missions", db => Collections.plain(box(db)[recordKey])); } catch { return null; } }

function acquire(config, identity, options = {}) {
	return withDb(config, "missions", db => {
		const collection = box(db);
		const exactKey = key(config, identity.missionId, identity.fingerprint);
		const current = Collections.plain(collection[exactKey]);
		const active = Collections.plain(collection[activeKey(config, identity.missionId)]);
		const spawn = Collections.plain(collection[spawnKey(config, identity.spawnGroupId)]);
		const now = Number(options.now || Date.now());
		if (active && active.fingerprint !== identity.fingerprint && blocking(active)) return denied("mission_continuation_active", active);
		if (spawn && Successor.blocks(spawn, identity)) return denied("successor_spawn_group_held", spawn);
		if (spawn && Successor.fenced(spawn, identity)) return denied("predecessor_generation_fenced", spawn);
		if (current && activeLease(current, now) && current.owner !== options.owner) return denied("continuation_lease_held", current);
		const owner = options.owner || `continuation_${process.pid}_${crypto.randomBytes(4).toString("hex")}`;
		const record = { ...current, ...Successor.withFence(identity, spawn || {}), owner, status: "dispatching",
			attempts: Number(current?.attempts || 0) + 1,
			leaseExpiresAt: new Date(now + Number(options.leaseMs || DEFAULT_LEASE_MS)).toISOString(),
			lastAttemptAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString() };
		writeAll(collection, config, record);
		return { ok: true, record: Collections.plain(record) };
	});
}

function mark(config, record, status, details = {}) {
	return withDb(config, "missions", db => {
		const collection = box(db);
		const next = { ...record, ...details, status, leaseExpiresAt: null, updatedAt: new Date().toISOString() };
		writeAll(collection, config, next);
		return Collections.plain(next);
	});
}

function writeAll(collection, config, record) {
	collection[key(config, record.missionId, record.fingerprint)] = Collections.plain(record);
	collection[activeKey(config, record.missionId)] = Collections.plain(record);
	if (record.spawnGroupId) collection[spawnKey(config, record.spawnGroupId)] = Collections.plain(record);
}

function settleActive(config, record, reason = "prior_continuation_terminal") {
	if (!record?.missionId) return null;
	return mark(config, record, "settled", { settledReason: reason, settledAt: new Date().toISOString() });
}

function denied(reason, record) { return { ok: false, reason, record }; }
function blocking(record) { return BLOCKING.has(String(record?.status || "").toLowerCase()); }
function activeLease(record, now = Date.now()) { return Boolean(record?.leaseExpiresAt && Date.parse(record.leaseExpiresAt) > now); }
function box(db) { return Collections.ensure(db.root, COLLECTION); }

module.exports = { BLOCKING, COLLECTION, DEFAULT_LEASE_MS, acquire, activeKey, activeLease,
	blocking, key, mark, read, readActive, settleActive, spawnKey };
