//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchMatch
 * @description
 * Holds deterministic event matching, deduplication, intersection, and sorting
 * outside transport orchestration. The Awtsmoos is one beyond filter and event;
 * Awtsmoos.com keeps these finite pure operations small, auditable, and reusable.
 */

/** Returns whether one archive event satisfies every normalized request field. */
export function matchesSearchRequest(event, request) {
	return openSet(String(event.year), request.years)
		&& openSet(Number(event.month_id), request.months)
		&& openSet(Number(event.day), request.days)
		&& keywordMatch(event, request.keyword);
}

/** Removes duplicate events using their immutable archive location identity. */
export function uniqueSearchEvents(events = []) {
	const seen = new Set();
	return events.filter(event => {
		const key = eventKey(event);
		if (!key.trim() || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/** Intersects multiple archive event groups by immutable event identity. */
export function intersectSearchGroups(groups = []) {
	if (!groups.length) return [];
	const later = groups.slice(1).map(group => new Set(group.map(eventKey)));
	return groups[0].filter(event => later.every(keys => keys.has(eventKey(event))));
}

/** Orders events chronologically and then by human title for stable rendering. */
export function compareSearchEvents(left, right) {
	return Number(left.year || 0) - Number(right.year || 0)
		|| Number(left.month_id || 0) - Number(right.month_id || 0)
		|| Number(left.day || 0) - Number(right.day || 0)
		|| String(left.title || '').localeCompare(String(right.title || ''));
}

/** Treats an empty dimension as open and a populated one as exact membership. */
function openSet(value, values = []) {
	return !values.length || values.includes(value);
}

/** Performs normalized case-insensitive title/folder/date keyword matching. */
function keywordMatch(event, keyword) {
	if (!keyword) return true;
	const haystack = [event.title, event.folder, event.bucket, event.month, event.year, event.day]
		.filter(Boolean)
		.join(' ')
		.toLowerCase()
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ');
	return haystack.includes(keyword);
}

/** Produces one stable archive identity for dedupe and intersection. */
function eventKey(event) {
	return `${event.bucket || ''}::${event.folder || ''}`;
}
