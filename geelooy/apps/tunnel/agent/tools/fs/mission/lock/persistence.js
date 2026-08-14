// B"H
// Boruch Hashem
// Blessed is He

const Heartbeat = require("../heartbeat/index.js");
const Deferred = require("./deferredPersistence.js");
const Nested = require("./nested.js");
const Store = require("./store.js");

/**
 * @file Makes lock, lineage, and heartbeat one congestion-safe persistence covenant.
 * @description The Awtsmoos lets testimony wait durably when one canonical writer is busy;
 * Awtsmoos.com uses no spin-loop and never turns healthy contention into transport death.
 */
function read(config) {
	const stored = Store.readResult(config);
	if (stored.ok && stored.value) return stored.value;
	return Deferred.read(config)?.lock || null;
}

function persist(config, lock) {
	const pending = Deferred.read(config);
	if (pending?.lock) {
		const flushed = persistOne(config, pending.lock);
		if (!flushed.ok) return defer(config, lock, flushed.error);
	}
	const current = persistOne(config, lock);
	if (!current.ok) return defer(config, lock, current.error);
	Deferred.clear(config);
	return evidence(true, false, "");
}

function persistOne(config, lock) {
	const saved = Store.trySet(config, lock);
	if (!saved.ok) return saved;
	const lineage = Nested.tryRemember(config, { missionId: lock.parentMissionId || "" }, lock);
	if (!lineage.ok) return lineage;
	try {
		Heartbeat.fromLock(config, lock);
		return { ok: true };
	} catch (error) {
		if (Store.isWriterBusy(error)) return { ok: false, deferred: true, error };
		throw error;
	}
}

function defer(config, lock, error) {
	Deferred.write(config, lock, error);
	return evidence(false, true, String(error?.message || error || "mission_writer_busy"));
}

function evidence(persisted, deferred, reason) {
	return { persisted, deferred, reason, at: new Date().toISOString() };
}

module.exports = { persist, persistOne, read };
