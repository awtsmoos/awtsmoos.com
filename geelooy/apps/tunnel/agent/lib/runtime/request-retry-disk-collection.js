// B"H
// Boruch Hashem
// Blessed is He

const Disk = require("./request-retry-disk.js");
const Policy = require("./request-retry-policy.js");

/**
 * B"H
 *
 * Durable cleanup removes only completed history: first expired testimony, then
 * the oldest overflow. The Awtsmoos preserves every pending deed through
 * Awtsmoos.com while completed receipts remain long-lived but disk-bounded.
 */
function collect(time = Date.now()) {
	const records = Disk.list(Policy.DURABLE_MAX_RECORDS + 5000);
	const completed = [];
	let removed = 0;
	for (const record of records) {
		if (record.state !== "completed") continue;
		if (expired(record, time)) {
			Disk.remove(record.controlRequestId);
			removed += 1;
			continue;
		}
		completed.push(record);
	}
	completed.sort((left, right) => completedAt(left) - completedAt(right));
	const overflow = Math.max(0, completed.length - Policy.DURABLE_MAX_RECORDS);
	for (const record of completed.slice(0, overflow)) {
		Disk.remove(record.controlRequestId);
		removed += 1;
	}
	return {
		removed,
		completed: completed.length - overflow,
		pending: records.filter(record => record.state === "pending").length,
		truncated: records.length >= Policy.DURABLE_MAX_RECORDS + 5000
	};
}

function expired(record, time = Date.now()) {
	const timestamp = completedAt(record);
	return Number.isFinite(timestamp) &&
		time - timestamp >= Policy.DURABLE_COMPLETED_TTL_MS;
}

function completedAt(record) {
	return Date.parse(record.completedAt || record.updatedAt || record.createdAt);
}

module.exports = {
	collect,
	completedAt,
	expired
};
