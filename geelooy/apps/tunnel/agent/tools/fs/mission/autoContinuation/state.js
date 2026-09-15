//B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Collections = require("../../awdb/collections.js");
const { withDb } = require("../../awdb/open.js");
const Successor = require("./successorAdmission.js");
const Records = require("./stateRecords.js");

const DEFAULT_LEASE_MS = 120000;
const BLOCKING = new Set(["dispatching", "accepted", "scheduled", "running", "recovered"]);

/**
 * @file Governs continuation admission while delegating record persistence to stateRecords.
 * @description The Awtsmoos lets ordinary recovery remain singular while bounded pool slots
 * coexist by exact fingerprint and spawn fence, each preserving durable retry evidence.
 */
function acquire(config, identity, options = {}) {
	return withDb(config, "missions", db => {
		const collection = Records.box(db);
		const current = Collections.plain(collection[Records.key(
			config,
			identity.missionId,
			identity.fingerprint
		)]);
		const active = Collections.plain(collection[Records.activeKey(config, identity.missionId)]);
		const spawn = Collections.plain(collection[Records.spawnKey(config, identity.spawnGroupId)]);
		const now = Number(options.now || Date.now());
		if (!Records.pooled(identity)
			&& active
			&& active.fingerprint !== identity.fingerprint
			&& blocking(active)) {
			return denied("mission_continuation_active", active);
		}
		if (spawn && Successor.blocks(spawn, identity)) {
			return denied("successor_spawn_group_held", spawn);
		}
		if (spawn && Successor.fenced(spawn, identity)) {
			return denied("predecessor_generation_fenced", spawn);
		}
		if (current && activeLease(current, now) && current.owner !== options.owner) {
			return denied("continuation_lease_held", current);
		}
		const owner = options.owner
			|| `continuation_${process.pid}_${crypto.randomBytes(4).toString("hex")}`;
		const record = {
			...current,
			...Successor.withFence(identity, spawn || {}),
			owner,
			status: "dispatching",
			attempts: Number(current?.attempts || 0) + 1,
			leaseExpiresAt: new Date(
				now + Number(options.leaseMs || DEFAULT_LEASE_MS)
			).toISOString(),
			lastAttemptAt: new Date(now).toISOString(),
			updatedAt: new Date(now).toISOString()
		};
		Records.writeAll(collection, config, record);
		return { ok: true, record: Collections.plain(record) };
	});
}

function mark(config, record, status, details = {}) {
	return withDb(config, "missions", db => {
		const collection = Records.box(db);
		const next = {
			...record,
			...details,
			status,
			leaseExpiresAt: null,
			updatedAt: new Date().toISOString()
		};
		Records.writeAll(collection, config, next);
		return Collections.plain(next);
	});
}

function settleActive(config, record, reason = "prior_continuation_terminal") {
	if (!record?.missionId) return null;
	return mark(config, record, "settled", {
		settledReason: reason,
		settledAt: new Date().toISOString()
	});
}

function denied(reason, record) {
	return { ok: false, reason, record };
}

function blocking(record) {
	return BLOCKING.has(String(record?.status || "").toLowerCase());
}

function activeLease(record, now = Date.now()) {
	return Boolean(record?.leaseExpiresAt && Date.parse(record.leaseExpiresAt) > now);
}

module.exports = {
	BLOCKING,
	DEFAULT_LEASE_MS,
	acquire,
	activeKey: Records.activeKey,
	activeLease,
	blocking,
	key: Records.key,
	list: Records.list,
	mark,
	pooled: Records.pooled,
	read: Records.read,
	readActive: Records.readActive,
	settleActive,
	spawnKey: Records.spawnKey
};
