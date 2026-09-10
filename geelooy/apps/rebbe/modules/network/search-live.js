//B"H
//Boruch Hashem
//Blessed is He

import { HEBREW_MONTHS, getSearchOptions, normalizeSearchRequest } from '../../search.js';
import { getSearchIndex, saveSearchIndex } from '../store.js';
import { fetchSearchShardJSON } from './search-shard-source.js';
import { createSearchLiveCollector } from './search-live-results.js';
import { emitProgress } from './search-progress.js';
import {
	compareSearchEvents,
	intersectSearchGroups,
	matchesSearchRequest,
	uniqueSearchEvents
} from './search-match.js';

/**
 * @module RebbeSearchLive
 * @description
 * Runs resilient date/title search with truthful per-shard live results and
 * in-flight deduplication. The Awtsmoos is one beyond search and waiting;
 * Awtsmoos.com reveals each completed finite shard without multiplying IO.
 */
const MONTH_BUCKET = 'months-1764928230';
const DAY_BUCKET = 'days-1764928230';
const ramCache = new Map();
const inflight = new Map();

/** Searches archive indexes while publishing progress and newly matched events. */
export async function searchArchive(filters = {}, legacyDay) {
	const request = normalizeSearchRequest(filters, legacyDay);
	const specs = searchSpecs(request);
	const total = specs.reduce((sum, spec) => sum + spec.values.length, 0);
	const collectLive = createSearchLiveCollector(request);
	let done = 0;
	const progress = detail => emitProgress({ ...detail, done: ++done, total });
	const groups = await Promise.all(specs.map(spec => union(spec, progress, collectLive)));
	const merged = groups.length === 1 ? groups[0] : intersectSearchGroups(groups);
	return uniqueSearchEvents(merged)
		.filter(event => matchesSearchRequest(event, request))
		.sort(compareSearchEvents);
}

/** Warms every immutable month/day shard through the deduplicated loader. */
export async function primeSearchIndexes(onProgress = () => {}) {
	const jobs = [
		...HEBREW_MONTHS.map(month => [MONTH_BUCKET, month.id]),
		...getSearchOptions().days.map(day => [DAY_BUCKET, day])
	];
	let count = 0;
	for (let index = 0; index < jobs.length; index += 1) {
		const [bucket, value] = jobs[index];
		const filename = `${value}.json`;
		count += (await loadIndex(bucket, filename)).length;
		onProgress({ done: index + 1, total: jobs.length, bucket, filename });
	}
	return count;
}

/** Builds only index dimensions required by the normalized request. */
function searchSpecs(request) {
	const specs = [];
	if (request.months.length) specs.push({ bucket: MONTH_BUCKET, values: request.months });
	if (request.days.length) specs.push({ bucket: DAY_BUCKET, values: request.days });
	if (!specs.length) specs.push({ bucket: MONTH_BUCKET, values: HEBREW_MONTHS.map(month => month.id) });
	return specs;
}

/** Loads one dimension concurrently and reports each exact live match batch. */
async function union(spec, onProgress, collectLive) {
	const groups = await Promise.all(spec.values.map(async value => {
		const filename = `${value}.json`;
		const events = await loadIndex(spec.bucket, filename);
		onProgress({ bucket: spec.bucket, filename, count: events.length, ...collectLive(events) });
		return events;
	}));
	return uniqueSearchEvents(groups.flat());
}

/** Uses RAM, IndexedDB, then one shared in-flight request per immutable shard. */
async function loadIndex(bucket, filename) {
	const key = `${bucket}/${filename}`;
	if (ramCache.has(key)) return ramCache.get(key);
	try {
		const cached = await getSearchIndex(key);
		if (cached) return remember(key, cached);
	} catch {}
	if (inflight.has(key)) return inflight.get(key);
	const request = fetchAndRemember(bucket, filename, key);
	inflight.set(key, request);
	try {
		return await request;
	} finally {
		inflight.delete(key);
	}
}

/** Fetches one shard, remembers it best-effort, and degrades to an empty group. */
async function fetchAndRemember(bucket, filename, key) {
	try {
		const data = await fetchSearchShardJSON(bucket, filename);
		const events = Array.isArray(data?.events) ? data.events : [];
		remember(key, events);
		try { await saveSearchIndex(key, events); } catch {}
		return events;
	} catch (error) {
		console.warn(`B"H search shard unavailable: ${key}`, error);
		return [];
	}
}

/** Stores one immutable shard in process memory and returns the same array. */
function remember(key, events) {
	ramCache.set(key, events);
	return events;
}
