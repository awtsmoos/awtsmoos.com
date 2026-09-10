//B"H
//Boruch Hashem
//Blessed is He

import { HEBREW_MONTHS, getSearchOptions, normalizeSearchRequest } from '../../search.js';
import { getSearchIndex, saveSearchIndex } from '../store.js';
import { fetchSearchShardJSON } from './search-shard-source.js';

/**
 * @module RebbeSearchLive
 * @description
 * Runs date/title search through resilient Archive.org replicas rather than a
 * single redirecting download URL. Empty controls intentionally mean the whole
 * archive. The Awtsmoos is one beyond filter and index; this finite search river
 * keeps broad discovery, exact intersections, IndexedDB cache, and d2 failover.
 */

const MONTH_BUCKET = 'months-1764928230';
const DAY_BUCKET = 'days-1764928230';
const ramCache = new Map();

/** Searches archive indexes, including the full archive when all controls are All. */
export async function searchArchive(filters = {}, legacyDay) {
	const request = normalizeSearchRequest(filters, legacyDay);
	const groups = [];
	if (request.months.length) groups.push(await union(MONTH_BUCKET, request.months));
	if (request.days.length) groups.push(await union(DAY_BUCKET, request.days));
	if (!groups.length) groups.push(await union(MONTH_BUCKET, HEBREW_MONTHS.map(month => month.id)));
	const merged = groups.length === 1 ? groups[0] : intersect(groups);
	return unique(merged)
		.filter(event => matches(event, request))
		.sort(compareEvents);
}
/** Warms every month/day shard through the same resilient loader. */
export async function primeSearchIndexes(onProgress = () => {}) {
	const jobs = [
		...HEBREW_MONTHS.map(month => [MONTH_BUCKET, month.id]),
		...getSearchOptions().days.map(day => [DAY_BUCKET, day])
	];
	let count = 0;
	for (let index = 0; index < jobs.length; index += 1) {
		const [bucket, value] = jobs[index];
		count += (await loadIndex(bucket, `${value}.json`)).length;
		onProgress({ done: index + 1, total: jobs.length, bucket, filename: `${value}.json` });
	}
	return count;
}

/** Loads and unions the requested shard values without duplicate events. */
async function union(bucket, values) {
	const groups = await Promise.all(values.map(value => loadIndex(bucket, `${value}.json`)));
	return unique(groups.flat());
}

/** Uses RAM, then IndexedDB, then the healthy Archive.org replica. */
async function loadIndex(bucket, filename) {
	const key = `${bucket}/${filename}`;
	if (ramCache.has(key)) return ramCache.get(key);
	try {
		const cached = await getSearchIndex(key);
		if (cached) {
			ramCache.set(key, cached);
			return cached;
		}
	} catch {}
	try {
		const data = await fetchSearchShardJSON(bucket, filename);
		const events = Array.isArray(data?.events) ? data.events : [];
		ramCache.set(key, events);
		try { await saveSearchIndex(key, events); } catch {}
		return events;
	} catch (error) {
		console.warn(`B"H search shard unavailable: ${key}`, error);
		return [];
	}
}
/** Keeps only events satisfying every normalized request dimension. */
function matches(event, request) {
	return openSet(String(event.year), request.years)
		&& openSet(Number(event.month_id), request.months)
		&& openSet(Number(event.day), request.days)
		&& keywordMatch(event, request.keyword);
}
function openSet(value, values) {
	return !values.length || values.includes(value);
}
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
function eventKey(event) {
	return `${event.bucket || ''}::${event.folder || ''}`;
}
function unique(events) {
	const seen = new Set();
	return events.filter(event => {
		const key = eventKey(event);
		if (!key.trim() || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function intersect(groups) {
	const later = groups.slice(1).map(group => new Set(group.map(eventKey)));
	return groups[0].filter(event => later.every(keys => keys.has(eventKey(event))));
}
function compareEvents(left, right) {
	return Number(left.year || 0) - Number(right.year || 0)
		|| Number(left.month_id || 0) - Number(right.month_id || 0)
		|| Number(left.day || 0) - Number(right.day || 0)
		|| String(left.title || '').localeCompare(String(right.title || ''));
}
