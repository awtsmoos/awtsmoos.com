//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiSearch
 * @description
 * Query normalization, matching and shard search for the Rebbe sichos API.
 * This is a faithful server port of the front end's geelooy/apps/rebbe/
 * search.js: one union per constrained dimension, dimensions intersected,
 * then every event re-checked against the full request. If the front end
 * shows it for a month/day, this API returns it, and vice versa.
 */

const { MONTHS, MONTH_BUCKET, DAY_BUCKET, yearList } = require("./catalog.js");
const { fetchShard } = require("./archive.js");

const ALL_MONTH_IDS = MONTHS.map(m => m.id);
const ALL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

/**
 * Normalizes raw agent query params into a canonical request.
 * Accepts: month/months, day/days, year/years (single, comma list, or
 * range via monthFrom/monthTo, dayFrom/dayTo, yearFrom/yearTo), q/keyword.
 * @param {object} raw Raw query/body params (string values typical).
 * @returns {{years:string[],months:number[],days:number[],keyword:string,limit:number,offset:number,includeTracks:boolean}}
 */
function normalizeQuery(raw = {}) {
	const years = resolveDimension(raw.year ?? raw.years, raw.yearFrom, raw.yearTo, yearList().map(Number)).map(String);
	const months = resolveDimension(raw.month ?? raw.months, raw.monthFrom, raw.monthTo, ALL_MONTH_IDS);
	const days = resolveDimension(raw.day ?? raw.days, raw.dayFrom, raw.dayTo, ALL_DAYS);
	return {
		years,
		months,
		days,
		keyword: normalizeKeyword(raw.q ?? raw.keyword ?? raw.text ?? ""),
		limit: clampInt(raw.limit, DEFAULT_LIMIT, 1, MAX_LIMIT),
		offset: clampInt(raw.offset, 0, 0, 1000000),
		includeTracks: String(raw.include || "").split(",").includes("tracks")
	};
}

/** Resolves one dimension from exact values or an explicit from/to range. */
function resolveDimension(exact, from, to, allowed) {
	const exactValues = splitValues(exact).map(Number).filter(Number.isFinite);
	if (exactValues.length) {
		const allowedSet = new Set(allowed.map(Number));
		const valid = [...new Set(exactValues)].filter(v => allowedSet.has(v));
		// Exact values were given but none exist in the archive: return a
		// sentinel that matches nothing, never an silently-open dimension.
		return valid.length ? valid : [-1];
	}
	let a = Number(from);
	let b = Number(to);
	a = Number.isFinite(a) && from !== undefined && from !== "" ? a : null;
	b = Number.isFinite(b) && to !== undefined && to !== "" ? b : null;
	if (a === null && b === null) return [];
	if (a !== null && b !== null && a > b) [a, b] = [b, a];
	return allowed.filter(v => (a === null || v >= a) && (b === null || v <= b));
}

/** Splits a single value or comma list into trimmed string parts. */
function splitValues(value) {
	if (value === undefined || value === null || value === "") return [];
	if (Array.isArray(value)) return value.flatMap(splitValues);
	return String(value).split(",").map(s => s.trim()).filter(Boolean);
}

/** Clamps an integer param with a fallback. */
function clampInt(value, fallback, min, max) {
	const n = parseInt(value, 10);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}

/** Normalizes keyword text exactly like the front end. */
function normalizeKeyword(value) {
	return String(value || "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Runs a normalized search over the shards.
 * @param {object} request Normalized request (see normalizeQuery).
 * @returns {Promise<object[]>} All matching events, sorted chronologically.
 */
async function searchEvents(request) {
	const groups = [];
	if (request.months.length) groups.push(await unionShard(MONTH_BUCKET, request.months));
	if (request.days.length) groups.push(await unionShard(DAY_BUCKET, request.days));
	if (!groups.length) groups.push(await unionShard(MONTH_BUCKET, ALL_MONTH_IDS));
	const merged = groups.length === 1 ? groups[0] : intersectGroups(groups);
	return uniqueEvents(merged)
		.filter(event => matchesRequest(event, request))
		.sort(compareEvents);
}

/** Unions one shard dimension across its requested values. */
async function unionShard(bucket, values) {
	const shards = await Promise.all(values.map(v => fetchShard(bucket, v)));
	return uniqueEvents(shards.flat());
}

/** Event identity, same as the front end: bucket + folder. */
function eventKey(event) {
	return `${event.bucket || ""}::${event.folder || ""}`;
}

/** Intersects event groups by identity. */
function intersectGroups(groups) {
	let map = new Map(groups[0].map(e => [eventKey(e), e]));
	for (const group of groups.slice(1)) {
		const keys = new Set(group.map(eventKey));
		map = new Map([...map].filter(([k]) => keys.has(k)));
	}
	return [...map.values()];
}

/** Dedupes events by identity, preserving first occurrence. */
function uniqueEvents(events) {
	const seen = new Set();
	const out = [];
	for (const event of events) {
		const k = eventKey(event);
		if (!k.trim() || seen.has(k)) continue;
		seen.add(k);
		out.push(event);
	}
	return out;
}

/** Full-request match: every constrained dimension plus keyword. */
function matchesRequest(event, request) {
	return inSetOrOpen(String(event.year), request.years)
		&& inSetOrOpen(Number(event.month_id), request.months)
		&& inSetOrOpen(Number(event.day), request.days)
		&& matchesKeyword(event, request.keyword);
}

/** Keyword match over the same haystack fields the front end searches. */
function matchesKeyword(event, keyword) {
	if (!keyword) return true;
	const haystack = normalizeKeyword([
		event.title, event.folder, event.bucket, event.month, event.year, event.day
	].filter(Boolean).join(" "));
	return haystack.includes(keyword);
}

function inSetOrOpen(value, values) {
	return !values.length || values.includes(value);
}

/** Chronological order: year, month, day, title — same as the front end. */
function compareEvents(a, b) {
	return (Number(a.year || 0) - Number(b.year || 0))
		|| (Number(a.month_id || 0) - Number(b.month_id || 0))
		|| (Number(a.day || 0) - Number(b.day || 0))
		|| String(a.title || "").localeCompare(String(b.title || ""));
}

/**
 * Serializes one event for API output.
 * @param {object} event Raw shard event.
 * @param {string} base Public API base path, e.g. "/api/rebbe".
 * @returns {object} Agent-facing event record.
 */
function serializeEvent(event, base) {
	const monthName = (MONTHS.find(m => m.id === Number(event.month_id)) || {}).name || event.month || null;
	return {
		id: eventKey(event),
		title: event.title || null,
		year: Number(event.year) || null,
		month: monthName,
		monthId: Number(event.month_id) || null,
		day: Number(event.day) || null,
		dateLabel: [monthName, event.day, event.year].filter(Boolean).join(" "),
		folder: event.folder || null,
		archiveItem: event.bucket || null,
		archiveUrl: event.bucket ? `https://archive.org/details/${event.bucket}` : null,
		eventUrl: `${base}/event?bucket=${encodeURIComponent(event.bucket || "")}&folder=${encodeURIComponent(event.folder || "")}`
	};
}

module.exports = {
	MAX_LIMIT,
	DEFAULT_LIMIT,
	normalizeQuery,
	searchEvents,
	serializeEvent,
	eventKey,
	compareEvents
};
