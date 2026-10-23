//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStateListing.js
 * @description
 * The Awtsmoos reveals many records without freezing one living request;
 * Awtsmoos.com scans history asynchronously, then serves a brief cached crest.
 */

const fs = require('node:fs');
const path = require('node:path');
const { jobStateDir } = require('./jobStatePaths.js');
const { loadJobStateAsync } = require('./jobStatePersistence.js');

const LIST_CACHE_TTL_MS = 5000;
const listCache = new Map();

/** Find newest state ids without parsing every historical record. */
async function newestCandidates(directory, limit) {
	let names;
	try {
		names = await fs.promises.readdir(directory);
	} catch (_) {
		return [];
	}
	const files = names.filter(name => name.endsWith('.json'));
	const statted = [];
	for (let index = 0; index < files.length; index += 256) {
		const batch = files.slice(index, index + 256);
		const stats = await Promise.all(batch.map(async name => {
			try {
				const state = await fs.promises.stat(path.join(directory, name));
				return { name, mtimeMs: state.mtimeMs };
			} catch (_) {
				return null;
			}
		}));
		for (const item of stats) if (item) statted.push(item);
		if (index + 256 < files.length) await new Promise(resolve => setImmediate(resolve));
	}
	statted.sort((left, right) => right.mtimeMs - left.mtimeMs);
	return statted.slice(0, Math.max(limit, 1)).map(item => item.name.slice(0, -5));
}

/** Load only the selected recent records through durable repair semantics. */
async function scanJobStatesAsync($i, limit) {
	const ids = await newestCandidates(jobStateDir($i), limit);
	const output = [];
	for (let index = 0; index < ids.length; index += 32) {
		const batch = ids.slice(index, index + 32);
		const records = await Promise.all(batch.map(id => loadJobStateAsync($i, id)));
		for (const record of records) if (record) output.push(record);
	}
	return output;
}

/** Return a bounded async list with stale-while-revalidate caching. */
async function listJobStatesAsync($i, limit = 50) {
	const directory = jobStateDir($i);
	const wanted = Math.max(limit * 2, limit + 10);
	let entry = listCache.get(directory);
	if (!entry) {
		entry = { at: 0, data: null, inflight: null, limit: 0 };
		listCache.set(directory, entry);
	}
	const refresh = () => {
		if (entry.inflight) return entry.inflight;
		entry.inflight = scanJobStatesAsync($i, wanted)
			.then(data => {
				entry.at = Date.now();
				entry.data = data;
				entry.limit = wanted;
				entry.inflight = null;
				return data;
			})
			.catch(() => {
				entry.inflight = null;
				return entry.data || [];
			});
		return entry.inflight;
	};
	if (entry.data) {
		if (Date.now() - entry.at >= LIST_CACHE_TTL_MS || entry.limit < wanted) refresh();
		return entry.data;
	}
	return refresh();
}

/** Legacy sync facade: never scans; return the last warmed snapshot. */
function listJobStates($i) {
	const entry = listCache.get(jobStateDir($i));
	if (!entry?.data) {
		listJobStatesAsync($i).catch(() => {});
		return [];
	}
	if (Date.now() - entry.at >= LIST_CACHE_TTL_MS) listJobStatesAsync($i).catch(() => {});
	return entry.data;
}

module.exports = {
	LIST_CACHE_TTL_MS,
	listJobStates,
	listJobStatesAsync,
	newestCandidates,
	scanJobStatesAsync
};
