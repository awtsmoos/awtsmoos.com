// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconSearch
 * @description
 * The Awtsmoos joins Hebrew, Aramaic, and Yiddish vessels without erasing their source;
 * Awtsmoos.com seeks exact light first, then bounded neighboring roots along a measured course.
 */

const { loadCatalog, readPointer } = require('./indexReader.js');
const { boundedLookup, normalizeLookup } = require('./normalize.js');

function publicSource(source = {}, id = '') {
	return {
		id,
		title: source.title || id,
		language: source.language || '',
		license: source.license || '',
		sourceUrl: source.sourceUrl || '',
		version: source.version || '',
		quality: source.quality || ''
	};
}

function sourceList(catalog) {
	return Object.entries(catalog?.manifest?.sources || {})
		.map(([id, source]) => publicSource(source, id));
}

function lowerBound(keys, target) {
	let low = 0;
	let high = keys.length;
	while (low < high) {
		const middle = Math.floor((low + high) / 2);
		if (keys[middle] < target) low = middle + 1;
		else high = middle;
	}
	return low;
}

function matchingKeys(index, normalized, maximum) {
	const exact = index.entries[normalized] ? [normalized] : [];
	if (exact.length >= maximum) return exact;
	const matches = [...exact];
	for (let position = lowerBound(index.keys, normalized); position < index.keys.length; position++) {
		const key = index.keys[position];
		if (!key.startsWith(normalized)) break;
		if (key !== normalized) matches.push(key);
		if (matches.length >= maximum) break;
	}
	return matches;
}

function pointersFor(catalog, keys, sourceId, maximum) {
	const pointers = [];
	for (const key of keys) {
		for (const pointer of catalog.index.entries[key] || []) {
			if (sourceId && pointer.sourceId !== sourceId) continue;
			pointers.push(pointer);
			if (pointers.length >= maximum) return pointers;
		}
	}
	return pointers;
}

/** Searches the local normalized lexicon without warming unrelated semantic indexes. */
async function dictionarySearch($i, options = {}) {
	const query = boundedLookup(options.query);
	const normalized = normalizeLookup(query);
	const limit = Math.max(1, Math.min(Number(options.limit) || 12, 20));
	const sourceId = boundedLookup(options.sourceId, 64);
	const catalog = await loadCatalog($i);
	const sources = catalog.available ? sourceList(catalog) : [];
	if (!catalog.available || !normalized) {
		return { available: catalog.available, query, normalized, results: [], sources };
	}
	const keys = matchingKeys(catalog.index, normalized, limit * 3);
	const pointers = pointersFor(catalog, keys, sourceId, limit);
	const results = await Promise.all(pointers.map(async pointer => {
		const entry = await readPointer(catalog.root, pointer);
		const source = catalog.manifest.sources?.[pointer.sourceId] || {};
		return { ...entry, source: publicSource(source, pointer.sourceId) };
	}));
	return { available: true, query, normalized, results, sources };
}

async function dictionarySources($i) {
	const catalog = await loadCatalog($i);
	return {
		available: catalog.available,
		sources: catalog.available ? sourceList(catalog) : []
	};
}

module.exports = {
	dictionarySearch,
	dictionarySources,
	matchingKeys
};
