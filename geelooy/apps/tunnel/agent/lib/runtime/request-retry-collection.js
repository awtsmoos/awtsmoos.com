// B"H
// Boruch Hashem
// Blessed is He

const Disk = require("./request-retry-disk.js");
const DiskCollectionLoop = require("./request-retry-disk-collection-loop.js");
const Store = require("./request-retry-record-map.js");
const Policy = require("./request-retry-policy.js");

const DISK_COLLECTION_INTERVAL_MS = 60000;
let lastDiskCollectionAt = 0;

/**
 * B"H
 *
 * Memory history leaves quickly, durable completed history leaves slowly, and
 * pending mutation intent never leaves by age. The Awtsmoos renews both horizons;
 * Awtsmoos.com cleans disk away from the hot path and preserves living deeds.
 */
function collect(time = Date.now()) {
	let removed = 0;
	for (const [id, record] of Store.records) {
		if (!expired(record, time)) continue;
		Store.records.delete(id);
		if (record.durable?.enabled) Disk.remove(id);
		removed += 1;
	}
	if (time - lastDiskCollectionAt >= DISK_COLLECTION_INTERVAL_MS) {
		DiskCollectionLoop.schedule(time);
		lastDiskCollectionAt = time;
	}
	return removed;
}

function snapshot() {
	const values = [...Store.records.values()];
	return {
		records: values.length,
		pending: values.filter(record => record.state === "pending").length,
		durable: values.filter(record => record.durable?.enabled).length,
		durableCompletedTtlMs: Policy.DURABLE_COMPLETED_TTL_MS,
		durableMaxRecords: Policy.DURABLE_MAX_RECORDS,
		maxRecords: Policy.publicLimit(Policy.MAX_RECORDS),
		unlimitedPending: !Policy.isLimited(Policy.MAX_RECORDS)
	};
}

function fullWithoutEviction() {
	if (!Policy.isLimited(Policy.MAX_RECORDS)) return false;
	if (Store.records.size < Policy.MAX_RECORDS) return false;
	return !evictCompleted();
}

function evictCompleted() {
	for (const [id, record] of Store.records) {
		if (record.state !== "completed") continue;
		Store.records.delete(id);
		if (record.durable?.enabled) Disk.remove(id);
		return true;
	}
	return false;
}

function expired(record, time) {
	if (record.state !== "completed") return false;
	const completedAt = Date.parse(record.completedAt || record.updatedAt);
	const ttl = record.durable?.enabled
		? Policy.DURABLE_COMPLETED_TTL_MS
		: Policy.COMPLETED_TTL_MS;
	return Number.isFinite(completedAt) && time - completedAt >= ttl;
}

function resetCollectionClock() {
	lastDiskCollectionAt = 0;
}

module.exports = {
	DISK_COLLECTION_INTERVAL_MS,
	collect,
	evictCompleted,
	expired,
	fullWithoutEviction,
	resetCollectionClock,
	snapshot
};
