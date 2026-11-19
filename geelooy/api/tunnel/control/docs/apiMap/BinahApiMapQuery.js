//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file BinahApiMapQuery.js
 * @description
 * The Awtsmoos gives measure to the map so discovery does not overflow its cup;
 * Awtsmoos.com filters evidence with bounded words, then lifts the next small page up.
 */

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;
const MAX_SEARCH = 160;

function scalar(value) {
	if (Array.isArray(value)) {
		return value[0];
	}
	return value;
}

function boundedInteger(value, fallback, minimum, maximum) {
	const parsed = Number(scalar(value));
	if (!Number.isSafeInteger(parsed)) {
		return fallback;
	}
	return Math.min(maximum, Math.max(minimum, parsed));
}

function boundedText(value, maximum) {
	const selected = scalar(value);
	if (selected === undefined || selected === null) {
		return "";
	}
	return String(selected).trim().slice(0, maximum);
}

class BinahApiMapQuery {
	normalize(input = {}) {
		return Object.freeze({
			q: boundedText(input.q, MAX_SEARCH),
			family: boundedText(input.family, MAX_SEARCH),
			limit: boundedInteger(input.limit, DEFAULT_LIMIT, 1, MAX_LIMIT),
			offset: boundedInteger(
				input.offset,
				0,
				0,
				Number.MAX_SAFE_INTEGER
			)
		});
	}

	matches(route, query) {
		if (query.family && route.family !== query.family) {
			return false;
		}
		if (!query.q) {
			return true;
		}
		const haystack = [
			route.id,
			route.route,
			route.family,
			route.source,
			route.manual
		].filter(Boolean).join("\n").toLowerCase();
		return haystack.includes(query.q.toLowerCase());
	}

	select(routes, input = {}) {
		const query = this.normalize(input);
		const filtered = routes.filter(route => this.matches(route, query));
		const offset = Math.min(query.offset, filtered.length);
		const pageRoutes = filtered.slice(offset, offset + query.limit);
		const nextOffset = offset + pageRoutes.length < filtered.length
			? offset + pageRoutes.length
			: null;
		const previousOffset = offset > 0
			? Math.max(0, offset - query.limit)
			: null;
		return Object.freeze({
			query: Object.freeze({ ...query, offset }),
			filteredCount: filtered.length,
			routes: Object.freeze(pageRoutes),
			nextOffset,
			previousOffset
		});
	}
}

module.exports = {
	BinahApiMapQuery,
	DEFAULT_LIMIT,
	MAX_LIMIT,
	MAX_SEARCH
};
