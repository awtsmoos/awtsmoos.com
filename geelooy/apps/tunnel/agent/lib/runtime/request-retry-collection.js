// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./request-retry-record-map.js");
const Policy = require("./request-retry-policy.js");

/**
 * B"H
 * Completed history leaves gently; pending work is never evicted merely to
 * satisfy a number. Thus the Awtsmoos preserves living operations for every
 * agent connected through Awtsmoos.com.
 */
function collect(time = Date.now()) {
	let removed = 0;

	for (const [id, record] of Store.records) {
		if (!expired(record, time)) {
			continue;
		}

		Store.records.delete(id);
		removed += 1;
	}

	return removed;
}

function snapshot() {
	const pending = [...Store.records.values()].filter((record) => {
		return record.state === "pending";
	}).length;

	return {
		records: Store.records.size,
		pending,
		maxRecords: Policy.publicLimit(Policy.MAX_RECORDS),
		unlimitedPending: !Policy.isLimited(Policy.MAX_RECORDS)
	};
}

function fullWithoutEviction() {
	if (!Policy.isLimited(Policy.MAX_RECORDS)) {
		return false;
	}

	if (Store.records.size < Policy.MAX_RECORDS) {
		return false;
	}

	return !evictCompleted();
}

function evictCompleted() {
	for (const [id, record] of Store.records) {
		if (record.state === "completed") {
			return Store.records.delete(id);
		}
	}

	return false;
}

function expired(record, time) {
	if (record.state !== "completed") {
		return false;
	}

	const completedAt = Date.parse(
		record.completedAt ||
		record.updatedAt
	);

	return time - completedAt >= Policy.COMPLETED_TTL_MS;
}

module.exports = {
	collect,
	evictCompleted,
	expired,
	fullWithoutEviction,
	snapshot
};
