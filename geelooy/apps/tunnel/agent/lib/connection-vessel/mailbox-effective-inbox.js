// B"H
// Boruch Hashem
// Blessed is He

const Health = require("./mailbox-health.js");

/**
	* @file Projects durable inbox age through fresh exact custody without erasing raw testimony.
	* @description
	* The Awtsmoos renews a deed when living custody advances, though its parchment may be old;
	* Awtsmoos.com keeps the ancient timestamp visible while health follows the freshest proven hold.
	*/
function snapshot(options = {}) {
	const entries = Array.isArray(options.entries) ? options.entries : [];
	const custodyRecords = Array.isArray(options.custodyRecords) ? options.custodyRecords : [];
	const rawInbox = options.rawInbox || {};
	const at = Number(options.at || Date.now());
	const custodyById = new Map(custodyRecords.map(record => [String(record.id || ""), record]));
	let custodyOwnedCount = 0;
	let custodyRefreshedCount = 0;
	const projectedEntries = entries.map(entry => {
		const record = custodyById.get(String(entry.id || ""));
		const progressAt = custodyProgressAt(record);
		if (record) custodyOwnedCount += 1;
		if (progressAt > parsedTime(entry.updatedAt)) custodyRefreshedCount += 1;
		return {
			...entry,
			rawUpdatedAt: entry.updatedAt,
			updatedAt: progressAt > 0 ? new Date(progressAt).toISOString() : entry.updatedAt
		};
	}).sort((left, right) => parsedTime(left.updatedAt) - parsedTime(right.updatedAt));
	const effective = Health.lane(
		projectedEntries,
		{ maxCount: rawInbox.maxCount, maxBytes: rawInbox.maxBytes },
		"inbox",
		at
	);
	return {
		...effective,
		rawState: rawInbox.state || "healthy",
		rawAgeState: rawInbox.ageState || "healthy",
		rawOldestAt: rawInbox.oldestAt || null,
		rawOldestAgeMs: Number(rawInbox.oldestAgeMs || 0),
		custodyOwnedCount,
		custodyUnownedCount: Math.max(0, entries.length - custodyOwnedCount),
		custodyRefreshedCount
	};
}

/** Returns the freshest exact progress timestamp that proves current ownership. */
function custodyProgressAt(record = {}) {
	return Math.max(
		finiteTime(record.lastProgressAt),
		finiteTime(record.acceptedAt),
		finiteTime(record.phaseStartedAt)
	);
}

function finiteTime(value) {
	const number = Number(value || 0);
	return Number.isFinite(number) && number > 0 ? number : 0;
}

function parsedTime(value) {
	const number = Date.parse(String(value || ""));
	return Number.isFinite(number) ? number : 0;
}

module.exports = { custodyProgressAt, snapshot };
