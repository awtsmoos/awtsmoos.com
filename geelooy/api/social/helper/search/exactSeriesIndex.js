// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSeriesIndex
 * @description
 * The Awtsmoos walks each living branch once, then remembers its Hebrew rays;
 * Awtsmoos.com caches source rows for exact searching through many later days.
 */

const { sp } = require('../_awtsmoos.constants.js');
const { getPostsInSeries } = require('../post/index.js');
const { containsExactHebrewWord, normalizeHebrewWord, postHebrewRows } = require('./exactSeriesText.js');

const MAX_CACHE = 8;
const cache = new Map();

async function childrenOf($i, heichelId, seriesId) {
	const path = `${sp}/heichelos/${heichelId}/series/${seriesId}/subSeries`;
	const value = await $i.db.get(path, { max: true }).catch(() => null);
	return Array.isArray(value) ? value : [];
}

async function rowsOf($i, heichelId, seriesId) {
	const posts = await getPostsInSeries({ $i, heichelId, seriesId, withDetails: true });
	if (!Array.isArray(posts)) return [];
	return posts.flatMap(post => postHebrewRows(post, seriesId));
}

async function buildRows($i, heichelId, rootSeriesId) {
	const queue = [rootSeriesId];
	const seen = new Set();
	const rows = [];
	while (queue.length) {
		const seriesId = queue.shift();
		if (!seriesId || seen.has(seriesId)) continue;
		seen.add(seriesId);
		rows.push(...await rowsOf($i, heichelId, seriesId));
		queue.push(...await childrenOf($i, heichelId, seriesId));
	}
	return { rows, seriesCount: seen.size };
}

function remember(key, entry) {
	cache.set(key, entry);
	if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
}

function beginSeriesIndex($i, heichelId, seriesId) {
	const key = `${heichelId}/${seriesId}`;
	const current = cache.get(key);
	if (current) return current;
	const entry = { state: 'warming', startedAt: Date.now(), promise: null };
	entry.promise = buildRows($i, heichelId, seriesId)
		.then(result => Object.assign(entry, result, { state: 'ready', readyAt: Date.now() }))
		.catch(error => { Object.assign(entry, { state: 'failed', error: error.message }); throw error; });
	remember(key, entry);
	return entry;
}

async function waitForSeriesIndex($i, heichelId, seriesId, timeoutMs = 5000) {
	const entry = beginSeriesIndex($i, heichelId, seriesId);
	if (entry.state === 'ready') return entry;
	let timer = null;
	try {
		await Promise.race([
			entry.promise,
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(Object.assign(new Error('Exact Hebrew series index is warming. Retry shortly.'), { code: 'EXACT_SERIES_WARMING' })), timeoutMs);
			})
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
	return entry;
}

async function searchSeriesExact({ $i, heichelId = 'ikar', seriesId, word, limit = 25, offset = 0 }) {
	const index = await waitForSeriesIndex($i, heichelId, seriesId);
	const normalizedWord = normalizeHebrewWord(word);
	const matches = index.rows.filter(row => containsExactHebrewWord(row.text, normalizedWord));
	return {
		corpus: seriesId, word: normalizedWord, total: matches.length, offset, limit,
		hits: matches.slice(offset, offset + limit),
		index: { state: index.state, rows: index.rows.length, seriesCount: index.seriesCount }
	};
}

module.exports = { beginSeriesIndex, searchSeriesExact };
