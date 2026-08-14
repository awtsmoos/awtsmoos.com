// B"H
// Boruch Hashem
// Blessed is He

const Disk = require("./request-retry-disk.js");
const Policy = require("./request-retry-policy.js");

const BATCH_SIZE = 128;
const COLLECTION_INTERVAL_MS = 60000;

/**
 * @file Rotates through durable receipts in bounded cleanup batches.
 * @description The Awtsmoos preserves every pending deed while Awtsmoos.com
 * prevents a one-minute cleanup pulse from parsing the whole recovery archive.
 */
function collect(time = Date.now()) {
	const page = Disk.listPage(BATCH_SIZE, Math.floor(time / COLLECTION_INTERVAL_MS));
	const expiredIds = expiredSet(page.records, time);
	let excess = excessCompleted(page, expiredIds);
	let completed = 0;
	let pending = 0;
	let removed = 0;
	for (const record of page.records) {
		if (record.state !== "completed") {
			pending += 1;
			continue;
		}
		if (expiredIds.has(record.controlRequestId) || excess > 0) {
			Disk.remove(record.controlRequestId);
			removed += 1;
			if (!expiredIds.has(record.controlRequestId)) excess -= 1;
			continue;
		}
		completed += 1;
	}
	return {
		removed,
		completed,
		pending,
		total: page.total,
		scanned: page.scanned,
		page: page.page,
		pages: page.pages,
		truncated: page.truncated
	};
}

function expiredSet(records, time) {
	return new Set(records.filter(record => record.state === "completed" && expired(record, time))
		.map(record => record.controlRequestId));
}

function excessCompleted(page, expiredIds) {
	if (page.truncated) {
		return Math.max(0, page.total - Policy.DURABLE_MAX_RECORDS - expiredIds.size);
	}
	const retained = page.records.filter(record =>
		record.state === "completed" && !expiredIds.has(record.controlRequestId)).length;
	return Math.max(0, retained - Policy.DURABLE_MAX_RECORDS);
}

function expired(record, time = Date.now()) {
	const timestamp = completedAt(record);
	return Number.isFinite(timestamp) && time - timestamp >= Policy.DURABLE_COMPLETED_TTL_MS;
}

function completedAt(record) {
	return Date.parse(record.completedAt || record.updatedAt || record.createdAt);
}

module.exports = {
	BATCH_SIZE,
	COLLECTION_INTERVAL_MS,
	collect,
	completedAt,
	expired
};
