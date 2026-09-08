//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconSearch
 * @description
 * The Awtsmoos reveals exact lexical light before nearby prefixes while only one first-letter shard enters RAM;
 * Awtsmoos.com keeps neutral public identity and exact provenance while invalid source names never reach a path.
 */

const { closeCatalog, openCatalog, readRange, sourceMetadata } = require('./indexReader.js');
const { shardToken } = require('./keySpace.js');
const { boundedLookup, normalizeLookup } = require('./normalize.js');
const { publicSource } = require('./publicSourceIdentity.js');

function sourceIds(catalog) {
	return Array.isArray(catalog.meta.sourceOrder) ? [...catalog.meta.sourceOrder] : [];
}

function sourceList(catalog) {
	return sourceIds(catalog).map(id => publicSource(sourceMetadata(catalog, id), id));
}

async function collectPass(catalog, ids, token, normalized, exact, maximum, results) {
	for (const sourceId of ids) {
		const remaining = maximum - results.length;
		if (remaining <= 0) return;
		const entries = await readRange(catalog, sourceId, token, normalized, exact, remaining);
		const source = publicSource(sourceMetadata(catalog, sourceId), sourceId);
		for (const entry of entries) {
			results.push({ ...entry, source });
			if (results.length >= maximum) return;
		}
	}
}

async function dictionarySearch($i, options = {}) {
	const query = boundedLookup(options.query);
	const normalized = normalizeLookup(query);
	const limit = Math.max(1, Math.min(Number(options.limit) || 12, 20));
	const requestedSource = boundedLookup(options.sourceId, 64);
	const catalog = await openCatalog($i);
	if (!catalog.available) return { available: false, query, normalized, results: [], sources: [] };
	try {
		const allIds = sourceIds(catalog);
		const sources = sourceList(catalog);
		if (!normalized) return { available: true, query, normalized, results: [], sources };
		const ids = requestedSource && allIds.includes(requestedSource) ? [requestedSource] : requestedSource ? [] : allIds;
		const token = shardToken(normalized);
		const results = [];
		await collectPass(catalog, ids, token, normalized, true, limit, results);
		await collectPass(catalog, ids, token, normalized, false, limit, results);
		return { available: true, query, normalized, results, sources };
	} finally {
		await closeCatalog(catalog);
	}
}

async function dictionarySources($i) {
	const catalog = await openCatalog($i);
	if (!catalog.available) return { available: false, sources: [] };
	try {
		return { available: true, sources: sourceList(catalog) };
	} finally {
		await closeCatalog(catalog);
	}
}

module.exports = { dictionarySearch, dictionarySources };
