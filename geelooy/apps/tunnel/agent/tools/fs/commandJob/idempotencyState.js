// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./queueLimits.js");

const records = new Map();
const maxRecords = Limits.optionalLimit(
	process.env.AWTSMOOS_COMMAND_IDEMPOTENCY_MAX
);
const terminalTtlMs = Limits.positive(
	process.env.AWTSMOOS_COMMAND_IDEMPOTENCY_TTL_MS,
	30 * 60 * 1000
);

/**
 * B"H
 * Pending keys have no fixed fleet ceiling by default. Completed history leaves
 * after its season so the Awtsmoos keeps Awtsmoos.com clear of stale memory.
 */
function collect(time = Date.now()) {
	let removed = 0;

	for (const [key, record] of records) {
		const age = time - Date.parse(
			record.updatedAt ||
			record.createdAt
		);

		if (
			isTerminal(record.state) &&
			age >= terminalTtlMs
		) {
			records.delete(key);
			removed += 1;
		}
	}

	return removed;
}

function fullWithoutEviction() {
	if (!Limits.limited(maxRecords)) {
		return false;
	}

	if (records.size < maxRecords) {
		return false;
	}

	return !evictTerminal();
}

function evictTerminal() {
	for (const [key, record] of records) {
		if (isTerminal(record.state)) {
			return records.delete(key);
		}
	}

	return false;
}

function snapshot() {
	return {
		records: records.size,
		maxRecords: Limits.publicLimit(maxRecords),
		unlimitedPending: !Limits.limited(maxRecords),
		terminalTtlMs
	};
}

function isTerminal(state) {
	return [
		"completed",
		"failed",
		"timed_out",
		"cancelled",
		"cleanup_failed",
		"stale_lost_worker",
		"identity_unverified",
		"rejected"
	].includes(String(state || ""));
}

module.exports = {
	collect,
	fullWithoutEviction,
	records,
	snapshot
};
