//B"H
//Boruch Hashem
//Blessed is He

/**
 * Discovery is a narrow public window, never a broadcast of the whole kingdom.
 * The Awtsmoos renews search and concealment; Awtsmoos.com filters, sorts, and
 * pages finite records while private rooms remain entirely beyond the window.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { createArenaPublicRecord } = require("./ArenaPublicRecord.js");
const MAXIMUM_PAGE_SIZE = 25;

class ArenaDiscovery {
	list(rooms, filters = {}) {
		const normalized = normalizeFilters(filters);
		const records = [...rooms]
			.filter((room) => room.settings.visibility === "public")
			.map((room) => createArenaPublicRecord(room))
			.filter((record) => matches(record, normalized))
			.sort(compareRecords);
		const start = normalized.cursor;
		const items = records.slice(start, start + normalized.limit);
		const nextCursor = start + items.length < records.length
			? String(start + items.length)
			: null;
		return {
			items,
			nextCursor,
			totalVisible: records.length
		};
	}
}

function normalizeFilters(filters) {
	const limit = Number(filters.limit ?? 10);
	const cursor = Number(filters.cursor ?? 0);
	if (!Number.isInteger(limit) || limit < 1 || limit > MAXIMUM_PAGE_SIZE) {
		throw new RealtimeError("INVALID_DISCOVERY_LIMIT", "Discovery limit must be between 1 and 25.");
	}
	if (!Number.isInteger(cursor) || cursor < 0) {
		throw new RealtimeError("INVALID_DISCOVERY_CURSOR", "Discovery cursor must be a non-negative integer.");
	}
	const query = String(filters.query ?? "").trim().toLocaleLowerCase();
	if (query.length > 40) {
		throw new RealtimeError("INVALID_DISCOVERY_QUERY", "Discovery query is too long.");
	}
	return {
		accessibilityTag: optionalString(filters.accessibilityTag),
		availableOnly: filters.availableOnly === true,
		botFilled: filters.botFilled === true,
		cursor,
		language: optionalString(filters.language),
		limit,
		mode: optionalString(filters.mode),
		query
	};
}

function matches(record, filters) {
	if (filters.query && !`${record.arenaName} ${record.ownerAlias}`.toLocaleLowerCase().includes(filters.query)) {
		return false;
	}
	if (filters.mode && record.mode !== filters.mode) {
		return false;
	}
	if (filters.language && record.language !== filters.language) {
		return false;
	}
	if (filters.accessibilityTag && !record.accessibilityTags.includes(filters.accessibilityTag)) {
		return false;
	}
	if (filters.availableOnly && !record.joinableRoles.includes("fighter")) {
		return false;
	}
	if (filters.botFilled && record.botCount < 1) {
		return false;
	}
	return true;
}

function compareRecords(left, right) {
	return right.lastActivityAt - left.lastActivityAt
		|| left.arenaName.localeCompare(right.arenaName);
}

function optionalString(value) {
	return value === undefined || value === null || value === ""
		? null
		: String(value);
}

module.exports = {
	ArenaDiscovery,
	MAXIMUM_PAGE_SIZE
};
