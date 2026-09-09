// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconBrowsePage
 * @description
 * The Awtsmoos merges a handful of bounded source-letter pages into one stable lexical page, then releases every database;
 * Awtsmoos.com lets an opaque cursor remember only the final word coordinate while the dictionary ocean remains outside RAM.
 */

const { decodeLexiconCursor, encodeLexiconCursor } = require('./cursor.js');
const { closeCatalog, openCatalog, sourceMetadata } = require('./indexReader.js');
const { boundedLookup, normalizeLookup } = require('./normalize.js');
const { publicSource } = require('./publicSourceIdentity.js');
const { readShardRows } = require('./browseReader.js');
const { cursorTuple, mergeBrowseRows } = require('./browseCore.js');
const { publicSources, selectedSourceIds } = require('./browseCatalog.js');

/** Bounds public pages so one request can never gather an unbounded lexical vessel. */
function pageLimit(value) {
	return Math.max(1, Math.min(Number(value) || 20, 40));
}

/** Creates the explicit stale/foreign cursor failure understood by route safety wrappers. */
function invalidCursor() {
	const error = new Error('invalid_lexicon_cursor');
	error.code = 'INVALID_LEXICON_CURSOR';
	return error;
}

/** Chooses the smallest source-local lower key that can still contain globally eligible rows. */
function lowerKey(cursor, sourceId, start) {
	if (!cursor) return start || '';
	return cursor.sourceId === sourceId ? cursor.key : cursor.normalized;
}

/** Reads a small candidate page from each selected source and decorates provenance after the shard has closed. */
async function sourceCandidates(catalog, sourceIds, token, cursor, start, limit) {
	const candidates = [];
	for (const sourceId of sourceIds) {
		const rows = await readShardRows(catalog, sourceId, token, lowerKey(cursor, sourceId, start), limit + 1);
		const source = publicSource(sourceMetadata(catalog, sourceId), sourceId);
		for (const row of rows) candidates.push({ ...row, source });
	}
	return candidates;
}

/** Reads one stable merged lexical page without retaining any shard or corpus-sized index in process memory. */
async function dictionaryBrowse($i, options = {}) {
	const catalog = await openCatalog($i);
	if (!catalog.available) return { available: false, sources: [], entries: [], cursor: '' };
	try {
		const requestedSource = boundedLookup(options.sourceId, 64);
		const sourceIds = selectedSourceIds(catalog, requestedSource);
		const token = boundedLookup(options.token || options.letter, 8).toLowerCase();
		const cursor = decodeLexiconCursor(options.cursor);
		if (cursor && (cursor.token !== token || !sourceIds.includes(cursor.sourceId))) throw invalidCursor();
		if (!token || !sourceIds.some(sourceId => Number(catalog.meta.shards?.[sourceId]?.[token]) > 0)) {
			return { available: true, sources: publicSources(catalog), token, entries: [], cursor: '', hasMore: false };
		}
		const limit = pageLimit(options.limit);
		const start = cursor ? '' : normalizeLookup(boundedLookup(options.start, 96));
		const candidates = await sourceCandidates(catalog, sourceIds, token, cursor, start, limit);
		const merged = mergeBrowseRows(candidates, sourceIds, cursor, limit);
		return {
			available: true,
			sources: publicSources(catalog),
			token,
			entries: merged.rows,
			cursor: merged.hasMore ? encodeLexiconCursor(cursorTuple(merged.last)) : '',
			hasMore: merged.hasMore
		};
	} finally {
		await closeCatalog(catalog);
	}
}

module.exports = { dictionaryBrowse };
