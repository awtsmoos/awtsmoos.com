//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PostRouteReadersQuery
 * @description
 * Sibling of PostRouteReaders: query-string readers, relocated verbatim.
 */

const {
	parseObject,
	queryBoolean,
	queryInt
} = require('../requestValues.js');

/**
 * B"H 2026-11-20 (Mittler nav/load round): the properties contract was
 * honored only for the JSON-map form ({"id":true,...}); the comma-list
 * forms callers also send -- `id,title,postId,identity` and the braced
 * `{id,title,postId,identity}` -- failed JSON.parse, degraded to null,
 * and the route silently shipped FULL records (measured: 32.9MB for a
 * 24-post series whose projection is ~18KB). Accept every form: JSON
 * object, JSON array, braced list, bare list. List entries may be
 * dotted paths (identity.title) or wildcards (identity.*); project()
 * in SeriesRecordReader resolves them.
 */
function propertyListToMap(text) {
	if (typeof text !== 'string') return null;
	let inner = text.trim();
	if (inner.startsWith('{') && inner.endsWith('}')) inner = inner.slice(1, -1);
	const map = {};
	for (const part of inner.split(',')) {
		const key = part.trim().replace(/^["']|["']$/g, '');
		if (key) map[key] = true;
	}
	return Object.keys(map).length ? map : null;
}

function selectedProperties($i) {
	const raw = $i.$_GET?.properties || $i.$_GET?.propertyMap;
	if (!raw) return null;
	if (Array.isArray(raw)) {
		const map = {};
		for (const key of raw) if (typeof key === 'string' && key) map[key] = true;
		return Object.keys(map).length ? map : null;
	}
	if (typeof raw === 'object') return raw;
	const parsed = parseObject(raw);
	if (parsed) {
		if (Array.isArray(parsed)) {
			const map = {};
			for (const key of parsed) if (typeof key === 'string' && key) map[key] = true;
			return Object.keys(map).length ? map : null;
		}
		return parsed;
	}
	return propertyListToMap(raw);
}

function detailsRequested($i) {
	return queryBoolean($i.$_GET?.details, false);
}

/**
 * Parses pagination from the query string. Returns nulls when absent so the
 * full collection behavior is preserved for callers that want everything.
 */
function paginationRequested($i) {
	const limit = queryInt($i.$_GET?.limit, { min: 1, max: 500 });
	const offset = queryInt($i.$_GET?.offset, { min: 0, max: 100000 });
	if (limit === null && offset === null) return null;
	return { limit, offset: offset ?? 0 };
}

module.exports = {
	selectedProperties,
	detailsRequested,
	paginationRequested
};
